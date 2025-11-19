@echo off
echo ========================================
echo Iniciando Backend Green A-Eye
echo ========================================
echo.

cd /d "%~dp0backend"

echo Verificando archivos necesarios...
if not exist "..\classes.json" (
    echo ERROR: No se encuentra classes.json en la raiz del proyecto
    pause
    exit /b 1
)

if not exist "..\dataset\best_model.pth" (
    if not exist "..\best_model.pth" (
        echo ERROR: No se encuentra best_model.pth
        echo Buscado en: ..\dataset\best_model.pth y ..\best_model.pth
        pause
        exit /b 1
    )
)

echo Archivos encontrados correctamente.
echo.
echo Iniciando servidor en http://localhost:8000
echo.
echo IMPORTANTE: Manten esta ventana abierta mientras uses la aplicacion
echo Presiona Ctrl+C para detener el servidor
echo.

python api.py

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR al iniciar el servidor
    echo ========================================
    echo.
    echo Posibles causas:
    echo 1. Falta instalar dependencias: pip install -r requirements.txt
    echo 2. El puerto 8000 esta en uso
    echo 3. Error al cargar el modelo
    echo.
    pause
)

