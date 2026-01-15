const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let djangoProcess = null;
let mahjongCppProcess = null;
let mainWindow = null;

app.setPath('userData', path.join(app.getPath('appData'), 'mahjong-simulator-data'));

function startDjango() {
  const exePath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'run_Django.exe')
    : path.join(__dirname, 'backend', 'run_Django.exe');

  const args = ['runserver', '127.0.0.1:8010', '--noreload'];

  djangoProcess = spawn(exePath, args, { 
    shell: false ,
    cwd: path.dirname(exePath)
  });

  djangoProcess.stdout.on('data', (data) => console.log(`Django: ${data}`));
  djangoProcess.stderr.on('data', (data) => console.error(`Django Error: ${data}`));
}

function startMahjongCpp() {
  // mahjong-cppの実行ファイルパス
  const exePath = app.isPackaged
    ? path.join(process.resourcesPath, 'mahjong-cpp', 'server.exe')
    : path.join(__dirname, 'mahjong-cpp', 'server.exe');

  const args = []; 

  mahjongCppProcess = spawn(exePath, args, { 
    shell: false ,
    cwd: path.dirname(exePath)
  });

  mahjongCppProcess.stdout.on('data', (data) => console.log(`MahjongCpp: ${data}`));
  mahjongCppProcess.stderr.on('data', (data) => console.error(`MahjongCpp Error: ${data}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    focusable: true, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 作成したファイルを読み込む
      contextIsolation: true, // 最近のElectronではデフォルトtrueですが明示しておくと安心
      nodeIntegration: false,
    },
  });

  mainWindow.setAspectRatio(16 / 9);

  const djangoUrl = 'http://127.0.0.1:8010/app/mahjong_render/';

  const waitForDjango = () => {
    http.get(djangoUrl, (res) => {
      console.log('Django is ready!');
      mainWindow.loadURL(djangoUrl);
      mainWindow.once('ready-to-show', () => {
        mainWindow.show(); // ウィンドウを表示
      });
    }).on('error', () => {
      console.log('Waiting for Django...');
      setTimeout(waitForDjango, 1000);
    });
  };

  waitForDjango();

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

app.whenReady().then(() => {
  startDjango();
  startMahjongCpp();
  createWindow();
});

app.on('window-all-closed', () => {
  if (djangoProcess) djangoProcess.kill();
  if (mahjongCppProcess) mahjongCppProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});