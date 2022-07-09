const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  updateList: callback => ipcRenderer.on('update-list', callback),
});
