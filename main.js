const { app, BrowserWindow, ipcMain, dialog, globalShortcut, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let previewWindow;
const stateFile = path.join(app.getPath('userData'), 'window-state.json');
let lastImageData = null; // guarda a última imagem aberta

function restoreWindowState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    return { width: 800, height: 600 };
  }
}

function saveWindowState() {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  fs.writeFileSync(stateFile, JSON.stringify(bounds));
}

function createMainWindow() {
  const state = restoreWindowState();

  mainWindow = new BrowserWindow({
    ...state,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('close', saveWindowState);

  //  Broadcast window-state-updated
  const sendWindowState = () => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    mainWindow.webContents.send('window-state-updated', bounds);
  };

  mainWindow.on('resize', sendWindowState);
  mainWindow.on('move', sendWindowState);

  // Atalhos Extras
  
  // Seta para esquerda -> ajustar para a metade esquerda
  globalShortcut.register('Ctrl+Alt+Left', () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow.setBounds({ x: 0, y: 0, width: width / 2, height });
  });

  // Seta para direita -> ajustar para a metade direita
  globalShortcut.register('Ctrl+Alt+Right', () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow.setBounds({ x: width / 2, y: 0, width: width / 2, height });
  });

  // Seta para cima -> maximizar janela
  globalShortcut.register('Ctrl+Alt+Up', () => {
    if (!mainWindow.isMaximized()) mainWindow.maximize();
  });

  // Seta para baixo -> restaurar tamanho padrão centralizado
  globalShortcut.register('Ctrl+Alt+Down', () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow.setBounds({
      x: Math.floor((width - 800) / 2),
      y: Math.floor((height - 600) / 2),
      width: 800,
      height: 600
    });
  });


  // Janela de preview com atalho
  globalShortcut.register('Ctrl+Shift+P', () => {
    if (previewWindow) {
      previewWindow.close();
      previewWindow = null;
    } else {
      previewWindow = new BrowserWindow({
        width: 300,
        height: 200,
        alwaysOnTop: true,
        frame: false,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        }
      });
      previewWindow.loadFile('preview.html');
      previewWindow.on('closed', () => previewWindow = null);

      previewWindow.once('ready-to-show', () => {
        if (lastImageData) {
          previewWindow.webContents.send('preview-image', lastImageData.dataUrl);
        }
      });
    }
  });
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC controles da janela
ipcMain.on('window-control', (_e, action) => {
  switch (action) {
    case 'minimize': mainWindow.minimize(); break;
    case 'maximize':
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
      break;
    case 'close': mainWindow.close(); break;
  }
});

// IPC abrir imagem
ipcMain.handle('open-image-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'Imagens', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
    properties: ['openFile']
  });
  if (canceled || filePaths.length === 0) return null;

  const fsExtra = require('fs');
  const filePath = filePaths[0];
  const stats = fsExtra.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '') || 'png';
  const dataUrl = `data:image/${ext};base64,${fsExtra.readFileSync(filePath).toString('base64')}`;

  const imageData = {
    path: filePath,
    name: path.basename(filePath),
    size: stats.size,
    width: 0,
    height: 0,
    dataUrl
  };

  lastImageData = imageData;

  mainWindow.webContents.send('image-data', imageData);
  if (previewWindow) previewWindow.webContents.send('preview-image', dataUrl);

  return imageData;
});
