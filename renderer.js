/**
 * ========================================
 * RENDERER.JS - LÓGICA DA INTERFACE PRINCIPAL
 * ========================================
 * 
 * Este arquivo contém toda a lógica do processo renderer (interface do usuário).
 * Responsável por:
 * - Controles da janela (minimizar, maximizar, fechar)
 * - Carregamento e exibição de imagens
 * - Navegação entre imagens
 * - Interface de usuário e interações
 * - Comunicação com o processo principal via electronAPI
 * 
 * IMPORTANTE: Este código roda no contexto do renderer (navegador),
 * com acesso limitado ao Node.js por questões de segurança.
 * A comunicação com o sistema é feita através do preload.js
 */

// ========================================
// CONTROLES DA JANELA
// ========================================

/**
 * Controles personalizados da barra de título
 * Como usamos frame: false, implementamos nossos próprios controles
 */

// Botão minimizar - reduz janela para barra de tarefas
document.getElementById('minimize').addEventListener('click', () => {
  window.electronAPI.minimize();
});

// Botão maximizar/restaurar - alterna entre maximizado e tamanho normal
document.getElementById('maximize').addEventListener('click', () => {
  window.electronAPI.maximizeRestore();
});

// Botão fechar - fecha a janela (na verdade minimiza para tray)
document.getElementById('close').addEventListener('click', () => {
  window.electronAPI.close();
});

// ========================================
// ELEMENTOS DOM E REFERÊNCIAS
// ========================================

/**
 * Referências para elementos principais da interface
 * Armazenadas para acesso rápido e reutilização
 */
const imageInfoElement = document.getElementById('imageInfo');       // Painel de informações da imagem
const imagePreviewElement = document.getElementById('imagePreview'); // Elemento <img> principal
const imageContainer = document.querySelector('.image-container');   // Container da imagem
const statusBar = document.getElementById('statusBar');             // Barra de status inferior

// ========================================
// CARREGAMENTO DE IMAGENS
// ========================================

/**
 * Botão "Abrir Imagem" - Abre diálogo para selecionar arquivo
 * Carrega e exibe a imagem selecionada com suas informações
 */
document.getElementById('openImage').addEventListener('click', async () => {
  try {
    // Solicita ao processo principal para abrir diálogo de arquivo
    const imageData = await window.electronAPI.openImage();
    
    if (!imageData) {
      return; // Usuário cancelou ou erro ocorreu
    }

    // Atualiza painel de informações com dados da imagem
    imageInfoElement.innerHTML = `
      <strong>Nome:</strong> ${imageData.name}<br>
      <strong>Caminho:</strong> ${imageData.path}<br>
      <strong>Tamanho:</strong> ${(imageData.size / 1024).toFixed(1)} KB<br>
      <strong>Resolução:</strong> ${imageData.width}x${imageData.height}
    `;
    
    // Mostra painel de informações e carrega imagem
    imageInfoElement.style.display = 'block';
    imagePreviewElement.src = imageData.dataUrl;
    
    adjustLayout(); // Ajusta layout após carregar imagem
    
  } catch (error) {
    console.error('Erro ao carregar imagem:', error);
  }
});

// ========================================
// JANELA DE PRÉ-VISUALIZAÇÃO
// ========================================

/**
 * Botão "Pré-visualização" - Abre janela flutuante com a imagem atual
 * Só funciona se há uma imagem carregada
 */
document.getElementById('previewImage').addEventListener('click', () => {
  if (imagePreviewElement.src) {
    window.electronAPI.openPreview(); // Solicita abertura da janela de preview
  }
});

// ========================================
// CONTROLE DE IMAGENS
// ========================================

/**
 * Botão "Fechar Imagem" - Remove a imagem atual da visualização
 * Limpa todos os dados e reajusta o layout
 */
document.getElementById('closeImage').addEventListener('click', () => {
  if (imagePreviewElement.src) {
    imagePreviewElement.src = '';                    // Remove fonte da imagem
    imagePreviewElement.style.display = 'none';     // Esconde elemento da imagem
    imageInfoElement.innerHTML = '';                 // Limpa informações da imagem
    adjustLayout();                                  // Reajusta layout após remoção
  }
});

// ========================================
// GERENCIAMENTO DE ENERGIA
// ========================================

/**
 * Botão "Gerenciamento de Energia" - Abre janela de configurações de energia
 * Permite controlar economia de energia e monitoramento do sistema
 */
document.getElementById('powerManagement').addEventListener('click', () => {
  window.electronAPI.openPowerManagement();
});

// ========================================
// NAVEGAÇÃO ENTRE IMAGENS
// ========================================

/**
 * Botões de navegação para percorrer múltiplas imagens
 * Funciona quando há uma pasta com várias imagens carregada
 */

// Próxima imagem na sequência
document.getElementById('nextImage').addEventListener('click', () => {
  window.electronAPI.nextImage();
});

// Imagem anterior na sequência
document.getElementById('prevImage').addEventListener('click', () => {
  window.electronAPI.previousImage();
});

// ========================================
// ATALHOS DE TECLADO
// ========================================

/**
 * Sistema de atalhos para navegação rápida
 * Permite controle via teclado sem usar mouse
 */
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    window.electronAPI.nextImage();      // Seta direita = próxima imagem
  } else if (event.key === 'ArrowLeft') {
    window.electronAPI.previousImage();  // Seta esquerda = imagem anterior
  }
});

// ========================================
// EVENTOS DO PROCESSO PRINCIPAL
// ========================================

/**
 * Listeners para eventos enviados pelo processo principal
 * Mantém a interface sincronizada com o estado da aplicação
 */

/**
 * Recebe dados de nova imagem carregada pelo processo principal
 * Atualiza interface com informações e preview da imagem
 */
window.electronAPI.onImageData((imageData) => {
  imagePreviewElement.src = imageData.dataUrl;     // Carrega imagem no elemento
  imagePreviewElement.style.display = 'block';     // Torna imagem visível
  
  // Atualiza painel de informações com dados da nova imagem
  imageInfoElement.innerHTML = `
    <strong>Nome:</strong> ${imageData.name}<br>
    <strong>Caminho:</strong> ${imageData.path}<br>
    <strong>Tamanho:</strong> ${(imageData.size / 1024).toFixed(1)} KB<br>
    <strong>Resolução:</strong> ${imageData.width}x${imageData.height}
  `;
  
  imageInfoElement.style.display = 'block';
  adjustLayout(); // Reajusta layout para nova imagem
});

/**
 * Recebe atualizações do estado da janela (posição, tamanho)
 * Exibe informações na barra de status
 */
window.electronAPI.onWindowState((bounds) => {
  statusBar.textContent = `Posição: ${bounds.x},${bounds.y} | ${bounds.width}x${bounds.height}`;
});

// ========================================
// SISTEMA DE NOTIFICAÇÕES
// ========================================

/**
 * Listeners para eventos de janela que disparam notificações
 * Fornece feedback visual sobre mudanças de estado da aplicação
 */

// Notificação quando janela é minimizada
window.electronAPI.onWindowMinimized(() => {
  if (window.notifications) {
    window.notifications.info(
      'Janela Minimizada',
      'Aplicação minimizada. Acesse pela bandeja do sistema.',
      { duration: 3000 }
    );
  }
});

// Notificação quando janela é restaurada
window.electronAPI.onWindowRestored(() => {
  if (window.notifications) {
    window.notifications.success(
      'Janela Restaurada',
      'Bem-vindo de volta ao PhotoViewer Lite!',
      { duration: 2000 }
    );
  }
});

// Notificação quando aplicação é enviada para bandeja
window.electronAPI.onWindowHidden(() => {
  if (window.notifications) {
    window.notifications.info(
      'Aplicação na Bandeja',
      'PhotoViewer Lite está rodando em segundo plano.',
      { duration: 2500 }
    );
  }
});

// Notificação quando aplicação volta a ser visível
window.electronAPI.onWindowShown(() => {
  if (window.notifications) {
    window.notifications.success(
      'Aplicação Ativa',
      'PhotoViewer Lite está pronto para uso!',
      { duration: 2000 }
    );
  }
});

// ========================================
// FUNÇÕES DE LAYOUT E INTERFACE
// ========================================

/**
 * Ajusta o layout da interface baseado no conteúdo atual
 * Reorganiza elementos quando imagem é carregada ou removida
 */
function adjustLayout() {
  const scrollContainer = document.querySelector('.scroll-container');
  const hasImage = imagePreviewElement.src !== '';
  
  if (hasImage) {
    imageContainer.style.display = 'flex';
    imageContainer.classList.add('has-image');
    imageInfoElement.style.display = 'block';
    
    // Habilita rolagem apenas se o conteúdo for maior que o container
    const contentHeight = scrollContainer.scrollHeight;
    const containerHeight = scrollContainer.clientHeight;
    
    if (contentHeight > containerHeight) {
      scrollContainer.style.overflowY = 'auto';
    } else {
      scrollContainer.style.overflowY = 'hidden';
    }
  } else {
    imageContainer.style.display = 'none';
    imageContainer.classList.remove('has-image');
    imageInfoElement.style.display = 'none';
    scrollContainer.style.overflowY = 'hidden';
  }
}

// Event listeners
window.addEventListener('resize', adjustLayout);

// Ajustar layout inicial
adjustLayout();

// ========================================
// MODAL DE AJUDA
// ========================================

/**
 * Funcionalidade do modal de ajuda com atalhos de teclado
 * Similar ao implementado na janela de preview
 */

// Botão de ajuda - abre o modal com atalhos
document.getElementById('helpButton').addEventListener('click', () => {
  const helpModal = document.getElementById('helpModal');
  helpModal.classList.add('show');
});

// Botão fechar modal - fecha o modal de ajuda
document.getElementById('helpClose').addEventListener('click', () => {
  const helpModal = document.getElementById('helpModal');
  helpModal.classList.remove('show');
});

// Fechar modal clicando fora do conteúdo
document.getElementById('helpModal').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    const helpModal = document.getElementById('helpModal');
    helpModal.classList.remove('show');
  }
});

// Fechar modal com tecla ESC
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const helpModal = document.getElementById('helpModal');
    if (helpModal.classList.contains('show')) {
      helpModal.classList.remove('show');
    }
  }
});

// Sistema de notificações carregado automaticamente