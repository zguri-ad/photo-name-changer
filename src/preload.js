const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('API', {
    getLastStoredFolderPath: () => ipcRenderer.invoke('getLastStoredFolderPath'),
    selectFolder: (obj) => ipcRenderer.invoke('dialog:openDirectory', obj),
    getFileCount: (obj) => ipcRenderer.invoke('getFileCount', obj),
    process: (obj) => ipcRenderer.invoke('process', obj),
    onUpdateProcessOutput: (callback) => ipcRenderer.on('update-output', (_event, value) => callback(value)),
});

