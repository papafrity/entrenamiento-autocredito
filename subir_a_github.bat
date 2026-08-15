@echo off
REM Configura la consola
title Subir Entrenador AutoCredito a GitHub

echo =======================================================
echo     SUBIR PROYECTO A GITHUB (EVITA CARGAR NODE_MODULES)
echo =======================================================
echo.
echo NOTA: Este script requiere que tengas Git instalado en tu computadora.
echo Si estas arrastrando los archivos a la web de GitHub, te da error
echo porque intenta subir la carpeta node_modules (que tiene miles de archivos).
echo Este script ignora esa carpeta automaticamente y sube solo lo necesario.
echo.

REM Comprobar si Git esta instalado
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git no esta instalado o no se encuentra en el PATH del sistema.
    echo Por favor, descarga e instala Git desde: https://git-scm.com/
    echo Luego de instalarlo, vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b
)

REM Pedir la URL del repositorio
set /p REPO_URL="Pega la URL de tu repositorio de GitHub (ej: https://github.com/tu-usuario/nombre-repo.git): "

if "%REPO_URL%"=="" (
    echo El campo no puede estar vacio.
    pause
    exit /b
)

echo.
echo [1/5] Inicializando repositorio local de Git...
git init

echo.
echo [2/5] Agregando archivos del proyecto (excluyendo node_modules)...
git add .

echo.
echo [3/5] Guardando archivos localmente (Commit)...
git commit -m "Subida inicial del Entrenador AutoCredito IA"

echo.
echo [4/5] Configurando la rama principal como main...
git branch -M main

REM Verificar si el origen ya existe y removerlo para evitar errores
git remote remove origin >nul 2>nul
echo.
echo [5/5] Vinculando al repositorio remoto...
git remote add origin %REPO_URL%

echo.
echo Enviando archivos a GitHub...
git push -u origin main -f

echo.
echo =======================================================
echo PROCESO FINALIZADO!
echo Si no hubo errores arriba, ya podes ir a Vercel e importar el proyecto.
echo =======================================================
echo.
pause
