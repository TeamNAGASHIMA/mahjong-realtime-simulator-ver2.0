const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // (必要に応じて設定)
    },
  });

  // DjangoアプリケーションのURLをロードします
  mainWindow.loadURL('http://127.0.0.1:8000/admin'); // Djangoの開発サーバーのURLに合わせてください

  // デベロッパーツールを開く (開発時のみ)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});