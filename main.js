const { app, BrowserWindow, ipcMain, dialog, globalShortcut, screen, nativeImage, Tray, Menu, powerSaveBlocker } = require('electron'); // Importar módulos do Electron
const path = require('path'); // Importar módulo de caminho
const fs = require('fs') // Importar módulo de filesystem
const os = require('os'); // Importar módulo do sistema operacional

let mainWindow; // Janela principal
let previewWindow;  // Janela de pré-visualização
let powerWindow; // Janela de gerenciamento de energia
const stateFile = path.join(app.getPath('userData'), 'window-state.json'); // Arquivo para salvar estado da janela
let lastImageData = null; // guarda a última imagem aberta
let tray = null;

// Variáveis de gerenciamento de energia
let powerSaveBlockerId = null; // ID do bloqueador de economia de energia
let lowPowerModeActive = false; // Estado do modo de baixo consumo

function restoreWindowState() { // Restaurar estado da janela
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    return { width: 800, height: 600 };
  }
}

function saveWindowState() { // Salvar estado da janela
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  fs.writeFileSync(stateFile, JSON.stringify(bounds));
}

function createMainWindow() { // Criar janela principal
  const state = restoreWindowState();

  mainWindow = new BrowserWindow({ // Criar janela principal
    ...state,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false
  });

  mainWindow.loadFile('index.html'); // Carregar arquivo HTML

  mainWindow.on('close', (event) => {
  saveWindowState(); // sempre salva estado

  if (!app.isQuitting) {
    event.preventDefault(); // impede fechar
    mainWindow.hide();      // apenas esconde
  }
})

  //  Broadcast window-state-updated
  const sendWindowState = () => { // Enviar estado da janela
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    mainWindow.webContents.send('window-state-updated', bounds);
  };

  mainWindow.on('resize', sendWindowState); // Enviar estado da janela ao redimensionar
  mainWindow.on('move', sendWindowState); // Enviar estado da janela ao mover

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

  globalShortcut.register('Ctrl+Shift+P', togglePreviewWindow); // Atalho para pré-visualização
};

function togglePreviewWindow() {
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
  }

// Função para criar/mostrar janela de gerenciamento de energia
function createPowerWindow() {
  if (powerWindow) {
    powerWindow.focus();
    return;
  }

  powerWindow = new BrowserWindow({
    width: 800,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    icon: path.join(__dirname, 'assets/icons/icon_64x64.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  powerWindow.loadFile('power-management.html');

  powerWindow.once('ready-to-show', () => {
    powerWindow.show();
    // Enviar estado inicial
    powerWindow.webContents.send('power-state-update', {
      powerSaveBlocker: powerSaveBlockerId !== null,
      lowPowerMode: lowPowerModeActive
    });
  });

  powerWindow.on('closed', () => {
    powerWindow = null;
  });
}

 function createTray() {
  // caminho do ícone local
  const iconPath = path.join(__dirname, 'assets', 'icons', 'tray_icon_64x64.png');

  // tenta carregar o ícone do arquivo; se não existir, usa um pequeno fallback base64
  let icon;
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  } else {
    // fallback simples (PNG 16x16)
    icon = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAHklEQVR42mNgGAWjYBSMglEwCkbBqBgFo2AUjIIBAMwiB27rB5DzAAAAAElFTkSuQmCC'
    );
  }

  // cria o tray
  tray = new Tray(icon);
  tray.setToolTip('PhotoViewer Lite');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir Imagem',
      type: 'normal',
      click: async () => { 
        try {
          await openImageDialog();
        } catch (error) {
          console.error('Erro ao abrir imagem:', error);
        }
      }
    },
    {
      label: 'Pré-visualização',
      type: 'normal',
      click: () => { if (typeof togglePreviewWindow === 'function') togglePreviewWindow(); }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      type: 'normal',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) mainWindow.hide();
    else mainWindow.show();
  });

  // opcional: cleanup ao sair (garantir que o tray seja destruído)
  app.on('before-quit', () => {
    if (tray) {
      tray.destroy();
      tray = null;
    }
  });
}


// 2. INICIALIZAÇÃO PRINCIPAL DO APP
// Esta é a única chamada de whenReady necessária.
app.whenReady().then(() => {
  createMainWindow(); // Primeiro, cria a janela principal
  createTray();       // Depois, cria o Tray
  // Todos os outros inicializadores (como globalShortcut) já estão dentro de createMainWindow
});

app.on('window-all-closed', () => { // Fechar app quando todas as janelas forem fechadas
  if (process.platform !== 'darwin') app.quit();
});

// IPC controles da janela
ipcMain.on('window-control', (_e, action) => { // Controles da janela
  switch (action) {
    case 'minimize': mainWindow.minimize(); break;
    case 'maximize':
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
      break;
    case 'close': mainWindow.close(); break;
  }
});

// IPC abrir preview
ipcMain.on('open-preview', () => {
  togglePreviewWindow();
});

// IPC abrir imagem
// Função para abrir imagem (pode ser chamada tanto pelo IPC quanto pelo tray)
async function openImageDialog() {
  // Garantir que a janela principal existe
  if (!mainWindow) {
    createMainWindow();
  }

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'Imagens', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
    properties: ['openFile']
  });

  if (canceled || filePaths.length === 0) return null; // Se cancelado ou nenhum arquivo selecionado, retornar null

  const fsExtra = require('fs');
  const filePath = filePaths[0];
  const stats = fsExtra.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '') || 'png';
  const dataUrl = `data:image/${ext};base64,${fsExtra.readFileSync(filePath).toString('base64')}`;

  const { nativeImage } = require('electron');
  const image = nativeImage.createFromPath(filePath);
  const size = image.getSize(); // { width, height }

  const imageData = {
    path: filePath,
    name: path.basename(filePath),
    size: stats.size,
    width: size.width,
    height: size.height,
    dataUrl
  };

  lastImageData = imageData; // Guardar última imagem aberta

  // Mostrar a janela principal se ela estiver oculta
  if (mainWindow && !mainWindow.isVisible()) {
    mainWindow.show();
  }

  mainWindow.webContents.send('image-data', imageData); // Enviar dados da imagem para a janela principal
  if (previewWindow) previewWindow.webContents.send('preview-image', dataUrl); // Enviar dados da imagem para a janela de preview

  return imageData;
}

// Handler IPC para abrir imagem
ipcMain.handle('open-image-dialog', openImageDialog);

// IPC para abrir janela de gerenciamento de energia
ipcMain.on('open-power-management', () => {
  createPowerWindow();
});

// IPC para alternar powerSaveBlocker
ipcMain.handle('toggle-power-save-blocker', () => {
  if (powerSaveBlockerId !== null) {
    // Desativar powerSaveBlocker
    powerSaveBlocker.stop(powerSaveBlockerId);
    powerSaveBlockerId = null;
    return false;
  } else {
    // Ativar powerSaveBlocker
    powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
    return true;
  }
});

// IPC para obter informações do sistema
ipcMain.handle('get-system-info', () => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  return {
    cpu: {
      model: cpus[0].model,
      cores: cpus.length,
      speed: cpus[0].speed
    },
    memory: {
      total: Math.round(totalMem / 1024 / 1024 / 1024 * 100) / 100, // GB
      used: Math.round(usedMem / 1024 / 1024 / 1024 * 100) / 100, // GB
      free: Math.round(freeMem / 1024 / 1024 / 1024 * 100) / 100, // GB
      percentage: Math.round((usedMem / totalMem) * 100)
    },
    platform: os.platform(),
    arch: os.arch(),
    uptime: Math.round(os.uptime() / 3600 * 100) / 100, // horas
    powerSaveBlocker: powerSaveBlockerId !== null,
    lowPowerMode: lowPowerModeActive
  };
});

// IPC para alternar modo de baixo consumo
ipcMain.handle('toggle-low-power-mode', () => {
  lowPowerModeActive = !lowPowerModeActive;
  
  if (lowPowerModeActive) {
    // Ativar modo de baixo consumo
    if (powerSaveBlockerId !== null) {
      powerSaveBlocker.stop(powerSaveBlockerId);
      powerSaveBlockerId = null;
    }
  }
  
  return lowPowerModeActive;
});

// IPC para otimizar recursos
ipcMain.handle('optimize-resources', () => {
  try {
    // Forçar garbage collection se disponível
    if (global.gc) {
      global.gc();
    }
    
    // Minimizar todas as janelas para liberar recursos visuais
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
    if (previewWindow && !previewWindow.isDestroyed()) {
      previewWindow.minimize();
    }
    
    return { success: true, message: 'Recursos otimizados com sucesso!' };
  } catch (error) {
    return { success: false, message: 'Erro ao otimizar recursos: ' + error.message };
  }
});
