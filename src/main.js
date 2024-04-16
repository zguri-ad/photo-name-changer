import pkg from 'electron';
import path from 'path';
import Processor from "./modules/processor.js";
import Store from 'electron-store';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { app, BrowserWindow, ipcMain, ipcRenderer, dialog } = pkg;
const store = new Store();

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

  ipcMain.handle('set-path', async function setPath(_event, value) {
    console.log(value);
  });

  ipcMain.handle('dialog:openDirectory', async (event, rawdata) => {
    var sStoredPath = store.get('dir');
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      defaultPath: sStoredPath
    })
    if (canceled) {
      return
    } else {
      console.log(filePaths[0]);
      return filePaths[0]
      store.set('dir', filePaths[0]);
    }
  })

  ipcMain.handle('process', (_event, obj) => {
    //nameChanger.changeName(mainWindow, obj);
    let proc = new Processor(mainWindow);
    proc.process(obj);
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