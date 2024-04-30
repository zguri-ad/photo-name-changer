const pkg = require('electron');
const path = require('path');
const Processor = require("./modules/processor.js");
const Store = require('electron-store');
const { fileURLToPath } = require('url');

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

const { app, BrowserWindow, ipcMain, ipcRenderer, dialog } = pkg;
const store = new Store();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

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

  console.log(MAIN_WINDOW_VITE_DEV_SERVER_URL);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // // do smth
  //mainWindow.loadFile(indexHtmlPath);

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