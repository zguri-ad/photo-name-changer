import pkg from 'electron';
import path from 'path';
import Processor from "./modules/processor.js";
import Store from 'electron-store';
import { fileURLToPath } from 'url';
import { logObject, ERROR_TYPE } from "../exchange/exchageLogObject.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { app, BrowserWindow, ipcMain, dialog } = pkg;
const store = new Store();
/** typeof {Processor} */
let processor = undefined;

try {
  require('electron-reloader')(module)
} catch (_) {}

const createWindow = () => {
  const indexHtmlPath = path.resolve(__dirname, '../resources/index.html');
  const preloadScriptPath = path.join(__dirname, './preload.js');

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: preloadScriptPath
    }
  });

  // do smth
  mainWindow.loadFile(indexHtmlPath);

  processor = new Processor(mainWindow);

  ipcMain.handle('getLastStoredFolderPath', async (_event, obj) => {
    return store.get('dir');
  })

  ipcMain.handle('dialog:openDirectory', async (_event, obj) => {
    var sStoredPath = store.get('dir');
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      defaultPath: sStoredPath
    });

    if (canceled) {
      return;
    } else {
      const folderPath = filePaths[0];
      console.log(folderPath);
      store.set('dir', folderPath);
      return {
        folderPath: folderPath
      };
    }
  })

  const updateLog = function(updateObject) {
    mainWindow.webContents.send('update-output', updateObject);
  }

  ipcMain.handle('getFileCount', async (_event, obj) => {
    const files = await processor.getJpegFiles(obj);
    return files.length;
  })

  ipcMain.handle('process', async (_event, obj) => {
    console.log("process");
    let folderPath = obj.folderPath;
    const files = await processor.getJpegFiles(obj);
    console.log(files);

    let totalFiles = files.length;
    
    let updateObject = { ...logObject };
    
    
    files.forEach(async (file) => {
      const updateObject = await processor.changeNameForFile(file, obj);
      updateObject.folderPath = folderPath;
      updateObject.processedFile = totalFiles;
      updateObject.processedFile += 1;
      updateLog(updateObject);
    });
  });

  
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})