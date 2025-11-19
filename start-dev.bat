@echo off
echo ========================================
echo Green A-Eye - Iniciando Servidores
echo ========================================
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no está instalado
    pause
    exit /b 1
)

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no está instalado
    pause
    exit /b 1
)

echo Iniciando Backend API...
start "Green A-Eye Backend" cmd /k "cd backend && python api.py"

timeout /t 3 /nobreak >nul

echo Iniciando Frontend...
start "Green A-Eye Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Servidores iniciados:
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo ========================================
echo.
echo Presiona cualquier tecla para cerrar esta ventana
echo (Los servidores seguirán ejecutándose)
pause >nul

