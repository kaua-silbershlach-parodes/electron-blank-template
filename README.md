# Electron Blank Template with Graphical Shell and GitHub Auto-Updates

A blank Electron desktop template by A Elite Estrangeira: a working
graphical shell (window, secure preload bridge, house icon) with
**GitHub auto-updates wired end to end** through electron-updater and
electron-builder. Clone it, replace the welcome panel with your product,
and the update machinery is already done.

## What is inside

| Path | Contents |
|---|---|
| `main.js` | Main process: window creation + the auto-updater wiring (events forwarded to the UI) |
| `preload.js` | Secure bridge (`contextIsolation` on, no Node in the page): version, check, install |
| `src/` | The graphical interface: `index.html`, `styles.css`, `renderer.js`, `icon.png` |
| `build/` | The application icon: `icon.ico` (multi-resolution, up to 256x256) and `icon.png` |
| `package.json` | App metadata + the electron-builder configuration (NSIS installer, GitHub publish target) |

The interface shows the running version and a live **Updates panel**:
current state, download progress, an event log, a manual check button,
and the restart-to-update button when a new version is ready.

## Run in development

```
npm install
npm start
```

In dev mode the update panel reports that updates are disabled —
auto-update only works in the packaged, installed app.

## Build the installer

```
npm run dist
```

Produces the NSIS installer in `dist/`. Install it like any Windows
program; the app icon is `build/icon.ico`.

## Auto-updates: how they work

- electron-builder publishes each release to this repository's
  **GitHub Releases**, including `latest.yml`, the installer and its
  blockmap.
- The installed app (electron-updater) checks the latest published
  release on startup (and on demand from the Updates panel), downloads
  the new version in the background, and offers **Restart to update**.
- Draft releases are invisible to the updater; the publish target is
  configured as a full release on purpose.

## Test the update flow (the proof this template exists for)

1. Set `"version": "1.0.0"` in `package.json`, `npm run dist`, and
   install the app. Open it: the badge shows **v1.0.0** and the panel
   reports the latest version.
2. Bump to `"version": "1.0.1"` and publish:
   `GH_TOKEN=<token> npm run release`
   (the token needs write access to this repository's contents and
   releases; it is used from the environment only, never committed).
3. Reopen the installed 1.0.0 app. Within seconds the panel shows
   *Version 1.0.1 found. Downloading…*, then *downloaded and ready*.
4. Click **Restart to update**. The app relaunches as **v1.0.1** — the
   version badge is the proof.

## House rules baked in

- The icon is a real multi-resolution `.ico` (16 to 256 px), not a
  renamed PNG.
- No credentials in the repository, ever; publishing reads the token
  from the environment.
- Copyright is always **A Elite Estrangeira**.

## License

Copyright (c) 2026 A Elite Estrangeira. All rights reserved. See
[LICENSE](LICENSE).
