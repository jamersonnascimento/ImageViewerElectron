#!/bin/bash

# Script para build do PhotoViewer Lite para Linux
# Usando electron-packager (mais confiável que electron-builder)

echo "=== PhotoViewer Lite - Build para Linux ==="
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não está instalado!"
    echo "   Instale o Node.js primeiro: https://nodejs.org/"
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Erro: npm não está instalado!"
    exit 1
fi

echo "✅ Node.js e npm encontrados"
echo ""

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências!"
        exit 1
    fi
    echo ""
fi

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
if [ -d "dist/PhotoViewer-Lite-linux-x64" ]; then
    rm -rf "dist/PhotoViewer-Lite-linux-x64"
    echo "   Removido: dist/PhotoViewer-Lite-linux-x64"
fi

# Criar pasta dist se não existir
mkdir -p dist

echo ""
echo "🔨 Iniciando build para Linux..."
echo "   Plataforma: linux"
echo "   Arquitetura: x64"
echo "   Ferramenta: electron-packager"
echo ""

# Executar o build
npm run package:linux

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build concluída com sucesso!"
    echo ""
    echo "📁 Localização: dist/PhotoViewer-Lite-linux-x64/"
    echo "🚀 Executável: dist/PhotoViewer-Lite-linux-x64/PhotoViewer-Lite"
    echo ""
    echo "💡 Para executar:"
    echo "   cd dist/PhotoViewer-Lite-linux-x64"
    echo "   ./PhotoViewer-Lite"
    echo ""
    
    # Mostrar tamanho da build
    if command -v du &> /dev/null; then
        BUILD_SIZE=$(du -sh "dist/PhotoViewer-Lite-linux-x64" 2>/dev/null | cut -f1)
        echo "📊 Tamanho da build: $BUILD_SIZE"
    fi
    
    # Tornar o executável executável (importante no Linux)
    chmod +x "dist/PhotoViewer-Lite-linux-x64/PhotoViewer-Lite"
    echo "🔧 Permissões de execução definidas"
    
else
    echo ""
    echo "❌ Erro durante o build!"
    echo "   Verifique as mensagens de erro acima"
    exit 1
fi

echo ""
echo "🎉 Processo concluído!"