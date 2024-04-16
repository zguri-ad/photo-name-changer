const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('API', {
    setPath: (args) => {
        ipcRenderer.invoke('set-path', args)
    },
    selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
    process: (path) => ipcRenderer.invoke('process', path),
    onUpdateProcessOutput: (callback) => ipcRenderer.on('update-output', (_event, value) => callback(value)),
});

