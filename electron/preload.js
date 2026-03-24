const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  savePodcasts: (data) => ipcRenderer.invoke('podcats:save', data),
  loadPodcasts: () => ipcRenderer.invoke('podcats:load'),
});
