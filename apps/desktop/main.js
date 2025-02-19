const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'My Electron App',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the Next.js app in Electron
  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../web/out/index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
