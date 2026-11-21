'use strict';

// Preload bridge: the only surface the renderer can touch.
// contextIsolation stays on; no Node access from the page.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getVersion: () => ipcRenderer.invoke('app:version'),
  checkForUpdates: () => ipcRenderer.send('update:check'),
  quitAndInstall: () => ipcRenderer.send('update:install'),
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update:status', (_event, payload) => callback(payload));
  },
});
