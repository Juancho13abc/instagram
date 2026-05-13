@echo off
REM Iniciar Backend - Laravel
REM Este script inicia el servidor Laravel en puerto 8000

echo.
echo =========================================
echo  Iniciando Backend - Laravel
echo =========================================
echo.

cd /d "C:\Users\juand\Desktop\PROYECTO DE APPS\insta-api-main"

echo Verificando versión de PHP...
php -v

echo.
echo Iniciando servidor Laravel en http://0.0.0.0:8000
echo.

php artisan serve --host 0.0.0.0 --port 8000

pause
