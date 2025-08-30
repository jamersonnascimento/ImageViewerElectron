const { contextBridge, ipcRenderer } = require('electron'); // Importar módulos do Electron

contextBridge.exposeInMainWorld('electronAPI', { //Expor API do Electron para a renderização
  minimize: () => ipcRenderer.send('window-control', 'minimize'),
  maximizeRestore: () => ipcRenderer.send('window-control', 'maximize'),
  close: () => ipcRenderer.send('window-control', 'close'),

  openImage: () => ipcRenderer.invoke('open-image-dialog'),

  onImageData: (cb) => ipcRenderer.on('image-data', (_e, data) => cb(data)),

  onPreviewImage: (cb) => ipcRenderer.on('preview-image', (_e, dataUrl) => cb(dataUrl)),

  // 🔹 Novo → receber estado da janela
  onWindowState: (cb) => ipcRenderer.on('window-state-updated', (_e, bounds) => cb(bounds))
});
