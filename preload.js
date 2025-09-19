const { contextBridge, ipcRenderer } = require('electron'); // Importar módulos do Electron

contextBridge.exposeInMainWorld('electronAPI', { //Expor API do Electron para a renderização
  minimize: () => ipcRenderer.send('window-control', 'minimize'),
  maximizeRestore: () => ipcRenderer.send('window-control', 'maximize'),
  close: () => ipcRenderer.send('window-control', 'close'),

  openImage: () => ipcRenderer.invoke('open-image-dialog'),

  openPreview: () => ipcRenderer.send('open-preview'),

  // Navegação entre imagens
  nextImage: () => ipcRenderer.send('next-image'),
  previousImage: () => ipcRenderer.send('previous-image'),

  onImageData: (cb) => ipcRenderer.on('image-data', (_e, data) => cb(data)),

  onPreviewImage: (cb) => ipcRenderer.on('preview-image', (_e, dataUrl) => cb(dataUrl)),

  // 🔹 Novo → receber estado da janela
  onWindowState: (cb) => ipcRenderer.on('window-state-updated', (_e, bounds) => cb(bounds)),

  // APIs de gerenciamento de energia
  openPowerManagement: () => ipcRenderer.send('open-power-management'),
  togglePowerSaveBlocker: () => ipcRenderer.invoke('toggle-power-save-blocker'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  toggleLowPowerMode: () => ipcRenderer.invoke('toggle-low-power-mode'),
  optimizeResources: () => ipcRenderer.invoke('optimize-resources'),
  onPowerStateUpdate: (cb) => ipcRenderer.on('power-state-update', (_e, data) => cb(data))
});
