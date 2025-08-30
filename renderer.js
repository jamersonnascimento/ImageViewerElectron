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

// Abrir imagem
document.getElementById('openImage').addEventListener('click', async () => {
  const imageData = await window.electronAPI.openImage();
  if (!imageData) return;

  document.getElementById('imageInfo').innerHTML = `
    <strong>Nome:</strong> ${imageData.name}<br>
    <strong>Caminho:</strong> ${imageData.path}<br>
    <strong>Tamanho:</strong> ${(imageData.size / 1024).toFixed(1)} KB<br>
    <strong>Resolução:</strong> ${imageData.width}x${imageData.height}
    `;

  document.getElementById('imagePreview').src = imageData.dataUrl;
});

window.electronAPI.onImageData((imageData) => {
  document.getElementById('imagePreview').src = imageData.dataUrl;
});

// 🔹 Atualizar status bar com dimensões
const statusBar = document.getElementById('statusBar');
window.electronAPI.onWindowState((bounds) => {
  statusBar.textContent = `Posição: ${bounds.x},${bounds.y} | ${bounds.width}x${bounds.height}`;
});
