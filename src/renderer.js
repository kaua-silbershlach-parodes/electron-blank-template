'use strict';

// Renderer: shows the app version and the live auto-update state
// forwarded by the main process (electron-updater events).

const versionEl = document.getElementById('app-version');
const stateEl = document.getElementById('update-state');
const messageEl = document.getElementById('update-message');
const logEl = document.getElementById('update-log');
const progressWrap = document.getElementById('progress-wrap');
const progressBar = document.getElementById('progress-bar');
const btnCheck = document.getElementById('btn-check');
const btnInstall = document.getElementById('btn-install');

function log(line) {
  const li = document.createElement('li');
  const time = new Date().toLocaleTimeString();
  li.textContent = `[${time}] ${line}`;
  logEl.prepend(li);
}

function setState(state, text) {
  stateEl.textContent = state.replace(/-/g, ' ');
  stateEl.className = `state state-${state}`;
  if (text) messageEl.textContent = text;
}

window.api.getVersion().then((v) => {
  versionEl.textContent = v;
  log(`App started, version ${v}.`);
});

btnCheck.addEventListener('click', () => {
  log('Manual update check requested.');
  window.api.checkForUpdates();
});

btnInstall.addEventListener('click', () => {
  log('Restarting to install the update…');
  window.api.quitAndInstall();
});

window.api.onUpdateStatus(({ state, data }) => {
  switch (state) {
    case 'dev-mode':
      setState('idle', 'Updates are disabled in dev mode. Install the packaged app to test auto-updates.');
      log('Dev mode: auto-update is only active in the installed app.');
      break;
    case 'checking':
      setState('checking', 'Checking GitHub Releases for a newer version…');
      log('Checking for updates…');
      break;
    case 'available':
      setState('available', `Version ${data.version} found. Downloading…`);
      progressWrap.hidden = false;
      progressBar.style.width = '0%';
      log(`Update available: ${data.version}. Download started.`);
      break;
    case 'not-available':
      setState('idle', `You are on the latest version (${data.version}).`);
      log(`No update available (latest is ${data.version}).`);
      break;
    case 'downloading':
      setState('downloading', `Downloading update… ${data.percent}%`);
      progressWrap.hidden = false;
      progressBar.style.width = `${data.percent}%`;
      break;
    case 'downloaded':
      setState('downloaded', `Version ${data.version} downloaded and ready. Restart to apply.`);
      progressBar.style.width = '100%';
      btnInstall.hidden = false;
      log(`Update ${data.version} downloaded. Ready to install.`);
      break;
    case 'error':
      setState('error', `Update check failed: ${data.message}`);
      log(`Update error: ${data.message}`);
      break;
    default:
      log(`Update event: ${state}`);
  }
});
