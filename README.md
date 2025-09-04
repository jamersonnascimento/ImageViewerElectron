# 📷 PhotoViewer Lite

Aplicativo desenvolvido em **Electron** como desafio prático proposto pelo professor Alexandre Ferreira, com o objetivo de construir um app simples de visualização de imagens chamado **PhotoViewer Lite**, utilizando recursos avançados do Electron. 

---

## 🚀 Objetivo

Construir um app simples de visualização de imagens chamado **PhotoViewer Lite**, utilizando recursos avançados do Electron:

- Janela sem moldura com **barra de título customizada**
- Janela de pré-visualização flutuante
- Persistência de posição/tamanho da janela
- Comunicação via IPC nos **3 sentidos**:
  - Renderer → Main (send)
  - Renderer → Main (invoke)
  - Main → Renderer (send)

---

## 🖼️ Funcionalidades

✅ Janela sem moldura com botões customizados (minimizar, maximizar, fechar)  
✅ Botão para abrir imagens (mostra nome, caminho e tamanho)  
✅ Janela de pré-visualização (Ctrl+Shift+P) sempre por cima  
✅ Posição e tamanho da janela são salvos ao fechar e restaurados ao abrir  
✅ Barra de status mostra posição e dimensões da janela em tempo real  
✅ Atalhos extras para organização da janela  

---

## ⌨️ Atalhos de teclado

- **Ctrl+Alt+Left** → metade esquerda da tela  
- **Ctrl+Alt+Right** → metade direita da tela  
- **Ctrl+Alt+Up** → maximizar  
- **Ctrl+Alt+Down** → restaurar para 800x600 centralizado  
- **Ctrl+Shift+P** → abrir/fechar janela de pré-visualização  

---

## 📂 Estrutura do projeto

photo-viewer-lite/
├─ package.json
├─ main.js
├─ preload.js
├─ index.html
├─ renderer.js
├─ preview.html
├─ styles.css
└─ README.md


---

## ▶️ Como rodar

1. Clone o repositório:
   ```bash
   git clone https://github.com/jamersonnascimento/ImageViewerElectron

2. Instale as dependências:
  ```bash
  npm install

3. Rode o app:
  ```bash	
  npm start


---

## 📋 Checklist de requisitos

✅ Janela sem moldura com barra de título customizada
✅ Botões de controle da janela funcionando via IPC
✅ Botão para abrir imagens com exibição de informações
✅ Janela de pré-visualização (Ctrl+Shift+P)
✅ Persistência de posição e tamanho da janela
✅ Comunicação Renderer ↔ Main nos 3 sentidos
✅ Atalhos de organização da janela
✅ Status bar exibindo dimensões em tempo real