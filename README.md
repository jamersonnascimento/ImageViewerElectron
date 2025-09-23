# 📷 PhotoViewer Lite v1.0.0

Aplicativo avançado desenvolvido em **Electron** como desafio prático proposto pelo professor Alexandre Ferreira. O **PhotoViewer Lite** é um visualizador de imagens moderno com sistema integrado de **gerenciamento de energia**, oferecendo controle total sobre o consumo energético do sistema.

---

## 🚀 Visão Geral

O PhotoViewer Lite combina visualização de imagens com monitoramento e controle de energia em tempo real, utilizando recursos avançados do Electron para criar uma experiência completa e profissional. **Versão 1.0** com identidade visual moderna e ícones personalizados.

### ✨ Principais Características

- 🖼️ **Visualizador de Imagens**: Interface moderna para visualização de imagens
- ⚡ **Gerenciamento de Energia**: Sistema completo de monitoramento e controle energético
- 🎨 **Interface Customizada**: Janela sem moldura com design profissional
- 🎯 **Identidade Visual Moderna**: Ícones personalizados com design glassmorphism
- 📊 **Monitoramento em Tempo Real**: CPU, memória, temperatura e consumo energético
- 🔧 **Controles Avançados**: PowerSaveBlocker, modo economia e otimização de sistema
- 🏷️ **Sistema de Bandeja**: Integração completa com área de notificação do sistema

---

## 🎨 Identidade Visual e Ícones Personalizados

### 🎯 **Design Moderno v1.0**

✅ **Ícones Personalizados**
- Design exclusivo com estilo glassmorphism
- Gradientes modernos e bordas arredondadas
- Múltiplos tamanhos: 16x16, 32x32, 64x64 pixels
- Formato SVG vetorial para máxima qualidade

✅ **Integração Completa**
- Ícone principal da aplicação na barra de tarefas
- Ícones específicos para bandeja do sistema (tray)
- Consistência visual em todas as janelas
- Substituição completa dos ícones padrão do Electron

✅ **Características Técnicas**
- Paleta de cores harmoniosa (azul, roxo, dourado)
- Elementos representativos de visualização de imagens
- Otimização para diferentes contextos de uso
- Identidade visual única e profissional

---

## 🖼️ Funcionalidades do Visualizador

✅ **Janela Principal**
- Barra de título customizada com botões de controle
- Abertura de imagens com informações detalhadas (nome, caminho, tamanho, resolução)
- Botão de energia com design especial e animações

✅ **Janela de Pré-visualização**
- Janela flutuante sempre por cima (Ctrl+Shift+P)
- Sincronização automática com a imagem principal
- Controles independentes

✅ **Persistência de Estado**
- Posição e tamanho da janela salvos automaticamente
- Restauração do estado ao reiniciar a aplicação
- Barra de status com dimensões em tempo real

---

## ⚡ Sistema de Gerenciamento de Energia

### 📊 **Monitoramento em Tempo Real**

O sistema monitora continuamente:
- **CPU**: Número de cores, velocidade e modelo do processador
- **Memória**: Uso em porcentagem, GB utilizados/livres/total
- **Temperatura**: Simulação de temperatura do sistema (45-75°C)
- **Energia**: Consumo energético estimado (50-150W)
- **Uptime**: Tempo de funcionamento do sistema

### 🔧 **Controles de Energia**

#### 1. 🟢 **Manter Sistema Acordado**
- **Função**: Impede que o sistema entre em suspensão/hibernação
- **Uso**: Ideal para apresentações, downloads longos, renderização
- **Tecnologia**: Utiliza `powerSaveBlocker` do Electron

#### 2. 🟡 **Modo Economia de Energia**
- **Função**: Ativa modo de baixo consumo energético
- **Uso**: Reduz atualizações e otimiza recursos
- **Benefício**: Prolonga duração da bateria

### 🚀 **Ações do Sistema**

#### **🚀 Otimizar Sistema**
- Força garbage collection para liberar memória
- Minimiza janelas para reduzir uso de recursos visuais
- Feedback visual durante o processo

#### **🔄 Atualizar Dados**
- Recarrega informações de sistema em tempo real
- Atualiza métricas de CPU, memória e energia

#### **🔄 Restaurar Padrões**
- Desativa todos os modos especiais
- Retorna sistema ao estado inicial
- Reset completo das configurações de energia

### 💡 **Dicas de Economia**

O sistema fornece dicas práticas:
- **Manter Acordado**: Útil durante apresentações ou downloads
- **Economia de Energia**: Reduz frequência de atualizações
- **Otimizar Sistema**: Libera memória não utilizada

---

## ⌨️ Atalhos de Teclado

### **Organização de Janela**
- **Ctrl+Alt+Left** → Metade esquerda da tela
- **Ctrl+Alt+Right** → Metade direita da tela
- **Ctrl+Alt+Up** → Maximizar janela
- **Ctrl+Alt+Down** → Restaurar para 800x600 centralizado

### **Funcionalidades**
- **Ctrl+Shift+P** → Abrir/fechar janela de pré-visualização

---

## 📂 Estrutura do Projeto

```
ImageViewerElectron/
├── 📁 assets/
│   └── 📁 icons/          # Ícones personalizados da aplicação
│       ├── 📄 icon-16.svg     # Ícone 16x16 (barra de tarefas)
│       ├── 📄 icon-32.svg     # Ícone 32x32 (janela principal)
│       ├── 📄 icon-64.svg     # Ícone 64x64 (alta resolução)
│       ├── 📄 tray-16.svg     # Ícone bandeja 16x16
│       ├── 📄 tray-32.svg     # Ícone bandeja 32x32
│       └── 📄 tray-64.svg     # Ícone bandeja 64x64
├── 📄 main.js             # Processo principal do Electron
├── 📄 preload.js          # Script de pré-carregamento
├── 📄 index.html          # Interface principal
├── 📄 renderer.js         # Lógica da interface principal
├── 📄 power-management.html # Interface de gerenciamento de energia
├── 📄 preview.html        # Interface da janela de pré-visualização
├── 📄 styles.css          # Estilos da aplicação
├── 📄 package.json        # Configurações e dependências (v1.0.0)
└── 📄 README.md           # Documentação atualizada
```

---

## ▶️ Instalação e Uso

### **Pré-requisitos**
- Node.js (versão 14 ou superior)
- npm ou yarn

### **Instalação**

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/jamersonnascimento/ImageViewerElectron
   cd ImageViewerElectron
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute a aplicação:**
   ```bash
   npm start
   ```

### **Como Usar**

1. **Visualizar Imagens:**
   - Clique em "Abrir Imagem" para selecionar uma imagem
   - As informações aparecerão automaticamente abaixo da imagem

2. **Gerenciar Energia:**
   - Clique no botão "⚡ Energia" (dourado) na barra superior
   - Use os controles para monitorar e otimizar o sistema

3. **Pré-visualização:**
   - Use Ctrl+Shift+P ou clique em "Pré-visualizar"
   - A janela flutuante mostrará a imagem atual

---

## 🛠️ Tecnologias Utilizadas

- **Electron**: Framework principal para aplicações desktop
- **Node.js**: Runtime JavaScript
- **HTML5/CSS3**: Interface moderna e responsiva
- **JavaScript ES6+**: Lógica da aplicação
- **IPC (Inter-Process Communication)**: Comunicação entre processos
- **PowerSaveBlocker**: Controle de energia do sistema
- **OS Module**: Informações do sistema operacional

---

## 📋 Checklist de Funcionalidades

### **Interface Principal**
✅ Janela sem moldura com barra de título customizada  
✅ Botões de controle da janela funcionando via IPC  
✅ Botão para abrir imagens com exibição de informações completas  
✅ Design responsivo e moderno  
✅ Ícones personalizados com identidade visual única  
✅ Sistema de bandeja (tray) com ícones específicos  

### **Sistema de Energia**
✅ Monitoramento em tempo real de CPU, memória e energia  
✅ Controle PowerSaveBlocker para manter sistema acordado  
✅ Modo economia de energia  
✅ Otimização de recursos do sistema  
✅ Interface dedicada para gerenciamento de energia  

### **Funcionalidades Avançadas**
✅ Janela de pré-visualização (Ctrl+Shift+P)  
✅ Persistência de posição e tamanho da janela  
✅ Comunicação Renderer ↔ Main nos 3 sentidos  
✅ Atalhos de organização da janela  
✅ Status bar exibindo dimensões em tempo real  

### **Experiência do Usuário**
✅ Animações e transições suaves  
✅ Feedback visual para todas as ações  
✅ Dicas e orientações integradas  
✅ Design consistente e profissional  

---

## 🎯 Objetivos Alcançados

Este projeto demonstra o domínio de conceitos avançados do Electron:

- **Arquitetura Multi-Processo**: Separação clara entre Main e Renderer
- **IPC Avançado**: Comunicação bidirecional eficiente
- **APIs Nativas**: Integração com recursos do sistema operacional
- **Gerenciamento de Estado**: Persistência e sincronização de dados
- **Interface Moderna**: Design profissional com animações
- **Otimização de Performance**: Controle de recursos e memória
- **Identidade Visual**: Ícones personalizados e design glassmorphism
- **Sistema de Bandeja**: Integração completa com área de notificação
- **Versionamento**: Aplicação pronta para produção (v1.0.0)

---

## 👨‍💻 Desenvolvido por

**Jamerson Nascimento**  
Projeto desenvolvido como parte do curso de Electron com o professor Alexandre Ferreira.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.