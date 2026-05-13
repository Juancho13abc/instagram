@echo off
REM Iniciar Frontend - Ionic
REM Este script inicia el servidor de desarrollo Ionic en puerto 4200

echo.
echo =========================================
echo  Iniciando Frontend - Ionic
echo =========================================
echo.

cd /d "C:\Users\juand\Desktop\PROYECTO DE APPS\instaIonic-master"

echo Verificando versión de Node...
node -v

echo.
echo Iniciando servidor Ionic en http://localhost:4200
echo.

npm start

pause
