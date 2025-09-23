# PhotoViewer Lite - Guia de Build

## ⚠️ Importante: Por que usamos electron-packager

**Problema com electron-builder**: O sistema de build tradicional (`electron-builder`) não funcionou devido a problemas específicos do Windows:

- **Erro de privilégios**: Tentava criar links simbólicos que requerem privilégios de administrador
- **Assinatura de código**: Baixava ferramentas de assinatura (`winCodeSign`) que falhavam na extração
- **Erro específico**: `"O cliente não tem o privilégio necessário"`

**Solução adotada**: Mudamos para `electron-packager` que é:
- ✅ Mais simples e direto
- ✅ Não requer privilégios especiais
- ✅ Funciona "out of the box"
- ✅ Cria aplicação portátil funcional

## Como fazer a build da aplicação

### Windows

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Execute o script de build no powershell:**
   ```bash
   .\build-windows.bat 
   ```

3. **Localização do executável:**
   ```
   dist\PhotoViewer-Lite-win32-x64\PhotoViewer-Lite.exe
   ```

O script `build.bat` automaticamente:
- Limpa builds anteriores
- Instala dependências (se necessário)
- Cria a build usando `electron-packager`
- Mostra informações sobre o executável gerado

### Linux

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Execute o script de build:**
   ```bash
   chmod +x build-linux.sh
   ./build-linux.sh
   ```

   Ou diretamente via npm:
   ```bash
   npm run package:linux
   ```

3. **Localização do executável:**
   ```
   dist/PhotoViewer-Lite-linux-x64/PhotoViewer-Lite
   ```

4. **Para executar no Linux:**
   ```bash
   cd dist/PhotoViewer-Lite-linux-x64
   ./PhotoViewer-Lite
   ```

O script `build-linux.sh` automaticamente:
- Verifica se Node.js e npm estão instalados
- Limpa builds anteriores
- Instala dependências (se necessário)
- Cria a build usando `electron-packager`
- Define permissões de execução no executável
- Mostra informações sobre o executável gerado

**Nota:** A build para Linux pode ser criada a partir do Windows usando cross-compilation do `electron-packager`.

### Método alternativo: Comando manual
```bash
npm run package
```

## Resultado da Build

A build será criada na pasta `dist/PhotoViewer-Lite-win32-x64/` contendo:
- `PhotoViewer-Lite.exe` - Executável principal
- Todas as dependências necessárias
- Arquivos de recursos

## Como executar a build

```bash
.\dist\PhotoViewer-Lite-win32-x64\PhotoViewer-Lite.exe
```

## Distribuição

A pasta `PhotoViewer-Lite-win32-x64` pode ser:
- Compactada em ZIP para distribuição
- Copiada para outros computadores Windows
- Executada sem instalação (aplicação portátil)

## Requisitos

- Windows 10 ou superior
- Arquitetura x64
- Não requer instalação do Node.js ou Electron no computador de destino

## Tamanho da Build

### Windows
A aplicação compilada tem aproximadamente **293 MB** e contém:
- Executável principal (`PhotoViewer-Lite.exe`)
- Runtime do Electron
- Bibliotecas DLL necessárias
- Assets da aplicação

O executável final está localizado em:
```
dist\PhotoViewer-Lite-win32-x64\PhotoViewer-Lite.exe
```

### Linux
A aplicação compilada tem aproximadamente **285 MB** e contém:
- Executável principal (`PhotoViewer-Lite`)
- Runtime do Electron
- Bibliotecas `.so` necessárias
- Assets da aplicação

O executável final está localizado em:
```
dist/PhotoViewer-Lite-linux-x64/PhotoViewer-Lite
```

**Observação:** As builds são portáteis e não requerem instalação - basta executar o arquivo principal.

## 🌐 Builds Multiplataforma

O `electron-packager` permite criar builds para diferentes plataformas a partir de qualquer sistema operacional:

### Scripts Disponíveis
```bash
npm run package        # Build para Windows (padrão)
npm run package:linux  # Build para Linux
```

### Cross-compilation
- ✅ **Windows → Linux**: Funciona perfeitamente
- ✅ **Linux → Windows**: Funciona perfeitamente  
- ✅ **macOS → Windows/Linux**: Funciona perfeitamente
- ⚠️ **Windows/Linux → macOS**: Requer ferramentas adicionais

### Arquiteturas Suportadas
- `x64` (64-bit) - Padrão e recomendado
- `ia32` (32-bit) - Para sistemas mais antigos
- `arm64` - Para processadores ARM (ex: Apple M1, Raspberry Pi)

### Exemplo para múltiplas plataformas
```bash
# Criar builds para Windows e Linux simultaneamente
npm run package && npm run package:linux
```

## 🔧 Troubleshooting

### Se o electron-builder não funcionar:
```
Erro: "O cliente não tem o privilégio necessário"
```
**Causa**: Problemas com links simbólicos e assinatura de código no Windows  
**Solução**: Use o `electron-packager` (já configurado neste projeto)

### Se arquivos ficarem "em uso" durante limpeza:
```
Erro: "O arquivo já está sendo usado por outro processo"
```
**Causa**: Aplicação ainda está executando  
**Solução**: Feche todas as instâncias da aplicação e execute `.\build.bat` novamente

### Comparação de ferramentas:

| Ferramenta | Vantagens | Desvantagens |
|------------|-----------|--------------|
| **electron-builder** | Instaladores, assinatura, auto-updater | Complexo, problemas de privilégios |
| **electron-packager** | Simples, rápido, portátil | Sem instalador, sem assinatura |

**Recomendação**: Para desenvolvimento e distribuição simples, use `electron-packager` (atual configuração)