// Controles da janela
document.getElementById('minimize').addEventListener('click', () => {
  window.electronAPI.minimize();
});

document.getElementById('maximize').addEventListener('click', () => {
  window.electronAPI.maximizeRestore();
});

document.getElementById('close').addEventListener('click', () => {
  window.electronAPI.close();
});

// Elementos DOM
const imageInfoElement = document.getElementById('imageInfo');
const imagePreviewElement = document.getElementById('imagePreview');
const imageContainer = document.querySelector('.image-container');
const statusBar = document.getElementById('statusBar');

// Abrir imagem
document.getElementById('openImage').addEventListener('click', async () => {
  const imageData = await window.electronAPI.openImage();
  if (!imageData) return;

  imageInfoElement.innerHTML = `
    <strong>Nome:</strong> ${imageData.name}<br>
    <strong>Caminho:</strong> ${imageData.path}<br>
    <strong>Tamanho:</strong> ${(imageData.size / 1024).toFixed(1)} KB<br>
    <strong>Resolução:</strong> ${imageData.width}x${imageData.height}
  `;
  
  imageInfoElement.style.display = 'block';
  imagePreviewElement.src = imageData.dataUrl;
  
  adjustLayout(); // Ajustar layout após carregar imagem
});

// Pré-visualização
document.getElementById('previewImage').addEventListener('click', () => {
  window.electronAPI.openPreview();
});

// Fechar imagem
document.getElementById('closeImage').addEventListener('click', () => {
  imagePreviewElement.src = '';
  imagePreviewElement.style.display = 'none'; // Esconder elemento da imagem
  imageInfoElement.innerHTML = ''; // Limpar conteúdo das informações (CSS automático vai esconder)
  adjustLayout(); // Ajustar layout após remover imagem
})

// Gerenciamento de energia
document.getElementById('powerManagement').addEventListener('click', () => {
  window.electronAPI.openPowerManagement();
});

// Navegação entre imagens
document.getElementById('nextImage').addEventListener('click', () => {
  window.electronAPI.nextImage();
});

document.getElementById('prevImage').addEventListener('click', () => {
  window.electronAPI.previousImage();
});

// Atalhos de teclado para navegação
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    window.electronAPI.nextImage();
  } else if (event.key === 'ArrowLeft') {
    window.electronAPI.previousImage();
  }
});

// Listeners de eventos do Electron
window.electronAPI.onImageData((imageData) => {
  imagePreviewElement.src = imageData.dataUrl;
  imagePreviewElement.style.display = 'block'; // Mostrar elemento da imagem
  
  // Atualizar informações da imagem
  imageInfoElement.innerHTML = `
    <strong>Nome:</strong> ${imageData.name}<br>
    <strong>Caminho:</strong> ${imageData.path}<br>
    <strong>Tamanho:</strong> ${(imageData.size / 1024).toFixed(1)} KB<br>
    <strong>Resolução:</strong> ${imageData.width}x${imageData.height}
  `;
  
  imageInfoElement.style.display = 'block';
  adjustLayout(); // Ajustar layout após carregar imagem
});

window.electronAPI.onWindowState((bounds) => {
  statusBar.textContent = `Posição: ${bounds.x},${bounds.y} | ${bounds.width}x${bounds.height}`;
});

// Função para ajustar layout
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