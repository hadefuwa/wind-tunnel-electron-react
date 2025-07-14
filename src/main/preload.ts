// Preload script for Electron context isolation
// You can expose safe APIs here if needed 

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  updateFromGit: () => ipcRenderer.invoke('update-from-git'),
}); 