const { app, BrowserWindow } = require('electron');
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
    show: false, 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
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
}

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