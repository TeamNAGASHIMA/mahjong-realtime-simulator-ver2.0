const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Reactから 'window-focus' という合図を送れるようにする関数
    focusWindow: () => ipcRenderer.send('window-focus')
});