const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    focusable: true, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 作成したファイルを読み込む
      contextIsolation: true, // 最近のElectronではデフォルトtrueですが明示しておくと安心
      nodeIntegration: false,
    },
  });

  // ウィンドウのアスペクト比を固定 (16:9)
  mainWindow.setAspectRatio(16 / 9);

  // DjangoアプリケーションのURLをロードします
  // mainWindow.loadURL('http://127.0.0.1:8010/admin'); // Djangoの開発サーバーのURLに合わせてください
  mainWindow.loadURL('http://127.0.0.1:8010/app/mahjong_render/');

  // デベロッパーツールを開く (開発時のみ)
  // mainWindow.webContents.openDevTools();
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

ipcMain.on('window-focus', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    // 【修正】Windows特有のフォーカスバグ対策
    // 最小化(minimize)までしなくても、blur() → focus() で直ることが多いです
    if (process.platform === 'win32') {
      win.blur();  // 一旦フォーカスを外す
      win.focus(); // 即座にフォーカスを当て直す
    } else {
      win.show();
      win.focus();
    }
  }
});

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