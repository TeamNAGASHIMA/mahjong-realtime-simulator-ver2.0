const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      // (必要に応じて設定)
    },
  });

  // ウィンドウのアスペクト比を固定 (16:9)
  mainWindow.setAspectRatio(16 / 9);

  // DjangoアプリケーションのURLをロードします
  // mainWindow.loadURL('http://127.0.0.1:8010/admin'); // Djangoの開発サーバーのURLに合わせてください
  mainWindow.loadURL('http://127.0.0.1:8010/app/mahjong_render/');

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