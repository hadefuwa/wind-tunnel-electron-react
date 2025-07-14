// Preload script for Electron context isolation
// You can expose safe APIs here if needed 

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runUpdateScript: () => ipcRenderer.invoke('run-update-script'),
  runManualUpdate: () => ipcRenderer.invoke('run-manual-update'),
  checkAppVersion: () => ipcRenderer.invoke('check-app-version'),
}); 