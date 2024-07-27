import { app, BrowserWindow, globalShortcut, screen } from "electron";
import serve from "electron-serve";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appServe = app.isPackaged ? serve({
  directory: path.join(__dirname, "../out")
}) : null;

let win;

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }

  // Close on clicking outside
  win.on('blur', () => {
    win.hide();
  });

  win.setPosition(Math.floor(width / 2 - 400), Math.floor(height / 2 - 300));

  const ret = globalShortcut.register('Alt+G', () => {
    console.log('Shortcut triggered');
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });

  if (!ret) {
    console.log('Shortcut registration failed');
  } else {
    console.log('Shortcut registered successfully');
  }
}

app.on("ready", () => {
    createWindow();
});

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});

app.on('will-quit', () => {
  // Unregister the shortcut when the app is about to quit
  globalShortcut.unregisterAll();
});