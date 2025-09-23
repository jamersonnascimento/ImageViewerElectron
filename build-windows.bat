@echo off
echo ========================================
echo    PhotoViewer Lite - Build Script
echo ========================================
echo.

echo Limpando builds anteriores...
if exist "dist" rmdir /s /q "dist"

echo.
echo Criando nova build...
npm run package

echo.
if exist "dist\PhotoViewer-Lite-win32-x64\PhotoViewer-Lite.exe" (
    echo ✓ Build criada com sucesso!
    echo.
    echo Localização: dist\PhotoViewer-Lite-win32-x64\
    echo Executável: PhotoViewer-Lite.exe
    echo.
    echo Para testar, execute:
    echo .\dist\PhotoViewer-Lite-win32-x64\PhotoViewer-Lite.exe
) else (
    echo ✗ Erro na criação da build!
)

echo.
pause