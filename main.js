const { app, BrowserWindow, ipcMain, dialog, globalShortcut, screen, nativeImage, Tray, Menu, powerSaveBlocker, Notification } = require('electron'); // Importar módulos do Electron
const path = require('path'); // Importar módulo de caminho
const fs = require('fs') // Importar módulo de filesystem
const os = require('os'); // Importar módulo do sistema operacional

let mainWindow; // Janela principal
let previewWindow;  // Janela de pré-visualização
let powerWindow; // Janela de gerenciamento de energia
const stateFile = path.join(app.getPath('userData'), 'window-state.json'); // Arquivo para salvar estado da janela
let lastImageData = null; // guarda a última imagem aberta
let tray = null;
let currentImageIndex = 0; // índice da imagem atual
let imagesInFolder = []; // lista de imagens na pasta atual

// Variáveis de gerenciamento de energia
let powerSaveBlockerId = null; // ID do bloqueador de economia de energia
let lowPowerModeActive = false; // Estado do modo de baixo consumo

// 🔔 Função para criar notificações do sistema operacional
function showSystemNotification(title, body, options = {}) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body,
      icon: path.join(__dirname, 'assets', 'icons', 'icon_64x64.png'),
      silent: options.silent || false,
      ...options
    });
    
    notification.show();
    return notification;
  }
}

function restoreWindowState() { // Restaurar estado da janela
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    return { 
      width: 800, 
      height: 600,
      x: undefined,
      y: undefined,
      isMaximized: false
    };
  }
}

function saveWindowState() { // Salvar estado da janela
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  const { workAreaSize } = screen.getPrimaryDisplay();
  
  // Verificar se está maximizada (Electron) ou ocupando toda área de trabalho
  const isMaximized = mainWindow.isMaximized() || 
    (bounds.x === 0 && bounds.y === 0 && 
     bounds.width === workAreaSize.width && 
     bounds.height === workAreaSize.height);
  
  const windowState = {
    ...bounds,
    isMaximized: isMaximized
  };
  
  fs.writeFileSync(stateFile, JSON.stringify(windowState));
}

function createMainWindow() { // Criar janela principal
  const state = restoreWindowState();

  // Separar o estado de maximização das dimensões da janela
  const { isMaximized, ...windowBounds } = state;

  mainWindow = new BrowserWindow({ // Criar janela principal
    ...windowBounds,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    icon: path.join(__dirname, 'assets/icons/icon_64x64.png')
  });

  mainWindow.loadFile('index.html'); // Carregar arquivo HTML

  // Restaurar estado de maximização após a janela ser criada
  if (isMaximized) {
    // Usar área de trabalho disponível ao invés de maximize() para respeitar a barra de tarefas
    const { workAreaSize } = screen.getPrimaryDisplay();
    mainWindow.setBounds({
      x: 0,
      y: 0,
      width: workAreaSize.width,
      height: workAreaSize.height
    });
  }

  mainWindow.on('close', (event) => {
  saveWindowState(); // sempre salva estado

  if (!app.isQuitting) {
    event.preventDefault(); // impede fechar
    mainWindow.hide();      // apenas esconde
    
    // 🔔 Notificação do sistema quando minimizada para bandeja
    showSystemNotification(
      'PhotoViewer Lite',
      'Aplicação minimizada para o ícone da bandeja do sistema.',
      { silent: true }
    );
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
  
  // Salvar estado quando maximizar ou restaurar
  mainWindow.on('maximize', saveWindowState);
  mainWindow.on('unmaximize', saveWindowState);
  
  // 🔔 Eventos para notificações de sistema
  mainWindow.on('minimize', () => {
    mainWindow.webContents.send('window-minimized');
  });
  
  mainWindow.on('restore', () => {
    mainWindow.webContents.send('window-restored');
  });
  
  mainWindow.on('show', () => {
    mainWindow.webContents.send('window-shown');
  });
  
  mainWindow.on('hide', () => {
    mainWindow.webContents.send('window-hidden');
  });

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

  // Seta para cima -> maximizar janela (respeitando área de trabalho)
  globalShortcut.register('Ctrl+Alt+Up', () => {
    const bounds = mainWindow.getBounds();
    const { workAreaSize } = screen.getPrimaryDisplay();
    
    // Verificar se já está maximizada
    const isMaximized = mainWindow.isMaximized() || 
      (bounds.x === 0 && bounds.y === 0 && 
       bounds.width === workAreaSize.width && 
       bounds.height === workAreaSize.height);
    
    if (!isMaximized) {
      mainWindow.setBounds({
        x: 0,
        y: 0,
        width: workAreaSize.width,
        height: workAreaSize.height
      });
    }
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
        width: 800,
        height: 600,
        alwaysOnTop: true,
        frame: false,
        resizable: true,
        icon: path.join(__dirname, 'assets/icons/icon_64x64.png'),
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

// Função para detectar todas as imagens na pasta
function getImagesInFolder(imagePath) {
  const folderPath = path.dirname(imagePath);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  
  try {
    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    }).map(file => path.join(folderPath, file));
    
    return imageFiles.sort(); // Ordenar alfabeticamente
  } catch (error) {
    console.error('Erro ao ler pasta:', error);
    return [];
  }
}

// IPC abrir preview
ipcMain.on('open-preview', () => {
  togglePreviewWindow();
});

// Handler para maximizar janela de preview
ipcMain.on('maximize-preview-window', () => {
  if (previewWindow) {
    if (previewWindow.isMaximized()) {
      previewWindow.unmaximize();
    } else {
      previewWindow.maximize();
    }
  }
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

  try {
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
    
    // Detectar todas as imagens na pasta
    imagesInFolder = getImagesInFolder(filePath);
    currentImageIndex = imagesInFolder.indexOf(filePath);

    // Mostrar a janela principal se ela estiver oculta
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }

    mainWindow.webContents.send('image-data', imageData); // Enviar dados da imagem para a janela principal
    if (previewWindow) previewWindow.webContents.send('preview-image', dataUrl); // Enviar dados da imagem para a janela de preview
    
    // 🔔 Notificação do sistema para carregamento bem-sucedido
    showSystemNotification(
      'Imagem Carregada',
      `${imageData.name} (${imageData.width}x${imageData.height})`,
      { silent: true }
    );

    return imageData;
  } catch (error) {
    // 🔔 Notificação do sistema para erro de carregamento
    showSystemNotification(
      'Erro ao Carregar Imagem',
      'Não foi possível carregar a imagem selecionada.',
      { silent: false }
    );
    return null;
  }
}

// Função para carregar uma imagem específica
async function loadImageByPath(imagePath) {
  if (!fs.existsSync(imagePath)) return null;

  const fsExtra = require('fs');
  const stats = fsExtra.statSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase().replace('.', '') || 'png';
  const dataUrl = `data:image/${ext};base64,${fsExtra.readFileSync(imagePath).toString('base64')}`;

  const { nativeImage } = require('electron');
  const image = nativeImage.createFromPath(imagePath);
  const size = image.getSize();

  const imageData = {
    path: imagePath,
    name: path.basename(imagePath),
    size: stats.size,
    width: size.width,
    height: size.height,
    dataUrl
  };

  lastImageData = imageData;
  mainWindow.webContents.send('image-data', imageData);
  if (previewWindow) previewWindow.webContents.send('preview-image', dataUrl);

  return imageData;
}

// Função para navegar para próxima imagem
function nextImage() {
  if (imagesInFolder.length === 0) return;
  
  currentImageIndex = (currentImageIndex + 1) % imagesInFolder.length;
  const nextImagePath = imagesInFolder[currentImageIndex];
  loadImageByPath(nextImagePath);
}

// Função para navegar para imagem anterior
function previousImage() {
  if (imagesInFolder.length === 0) return;
  
  currentImageIndex = (currentImageIndex - 1 + imagesInFolder.length) % imagesInFolder.length;
  const prevImagePath = imagesInFolder[currentImageIndex];
  loadImageByPath(prevImagePath);
}

// Handler IPC para abrir imagem
ipcMain.handle('open-image-dialog', openImageDialog);

// Handlers IPC para navegação
ipcMain.on('next-image', nextImage);
ipcMain.on('previous-image', previousImage);

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
    
    // Limpar cache de imagens não utilizadas
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.session.clearCache();
    }
    
    return { success: true, message: 'Recursos otimizados com sucesso!' };
  } catch (error) {
    return { success: false, message: 'Erro ao otimizar recursos: ' + error.message };
  }
});
