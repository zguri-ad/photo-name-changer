// import pkg from 'electron';
// import Store from 'electron-store';
// import Processor from "./processor.js";
// const { app, BrowserWindow, ipcMain, dialog } = pkg;

// export default class ElectronEventHandler {
//     mainWindow = undefined;
//     ipcMainWindow = undefined;
//     store = undefined;
//     processor = undefined;

//     /**
//      * 
//      * @param {BrowserWindow} window 
//      * @param {ipcMain} window 
//      */
//     ElectronEventHandler(window, ipcMainHandler) {
//         this.mainWindow = window;
//         this.ipcMainWindow = ipcMainHandler;
//         this.store = new Store();
//         this.processor = new Processor(mainWindow);
//     }

//     handleOpenDirectory() {
//         this.ipcMainWindow.handle('dialog:openDirectory', async (event, rawdata) => {
//             var sStoredPath = this.store.get('dir');
//             const { canceled, filePaths } = await dialog.showOpenDialog(this.mainWindow, {
//               properties: ['openDirectory'],
//               defaultPath: sStoredPath
//             });
        
//             if (canceled) {
//               return;
//             } else {
//               const folderPath = filePaths[0];
//               console.log(folderPath);
//               store.set('dir', folderPath);
//               const files = await this.processor.getJpegFiles(folderPath);
//               let totalFiles = files.length;
//               return {
//                 filepath: folderPath,
//                 filecount: totalFiles
//               };
//             }
//           }
//         )
//     }
// }