'use strict';

// Electron Blank Template - main process.
// Blank graphical shell + GitHub auto-updates via electron-updater.
// Updates only work in the packaged (installed) app; in dev mode the
// update panel reports that updates are disabled.

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');

let win = null;

function sendStatus(state, data) {
  if (win && !win.isDestroyed()) {
    win.webContents.send('update:status', { state, data: data || null });
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 860,
    minHeight: 600,
    backgroundColor: '#0f1115',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.on('closed', () => { win = null; });
}

function wireUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => sendStatus('checking'));
  autoUpdater.on('update-available', (info) => sendStatus('available', { version: info.version }));
  autoUpdater.on('update-not-available', (info) => sendStatus('not-available', { version: info.version }));
  autoUpdater.on('download-progress', (p) => sendStatus('downloading', {
    percent: Math.round(p.percent),
    transferred: p.transferred,
    total: p.total,
  }));
  autoUpdater.on('update-downloaded', (info) => sendStatus('downloaded', { version: info.version }));
  autoUpdater.on('error', (err) => sendStatus('error', { message: String((err && err.message) || err) }));
}

ipcMain.handle('app:version', () => app.getVersion());
ipcMain.on('update:check', () => {
  if (!app.isPackaged) {
    sendStatus('dev-mode');
    return;
  }
  autoUpdater.checkForUpdates().catch((err) => {
    sendStatus('error', { message: String((err && err.message) || err) });
  });
});
ipcMain.on('update:install', () => {
  autoUpdater.quitAndInstall();
});

app.whenReady().then(() => {
  wireUpdater();
  createWindow();
  if (app.isPackaged) {
    // First automatic check, a few seconds after the window is up.
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        sendStatus('error', { message: String((err && err.message) || err) });
      });
    }, 3000);
  } else {
    setTimeout(() => sendStatus('dev-mode'), 500);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
