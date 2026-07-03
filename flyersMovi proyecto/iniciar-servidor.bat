@echo off
echo.
echo  ======================================
echo   FlyerStudio - Servidor local
echo  ======================================
echo.
echo  Abriendo en: http://localhost:3000
echo  Para cerrar: Ctrl+C
echo.

cd /d "%~dp0"
node servidor.js
pause
