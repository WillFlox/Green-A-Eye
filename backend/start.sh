#!/bin/bash

echo "========================================"
echo "Iniciando Green A-Eye Backend API"
echo "========================================"
echo ""

# Verificar que Python esté instalado
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 no está instalado"
    exit 1
fi

echo "Verificando dependencias..."
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "Instalando dependencias..."
    pip3 install -r requirements.txt
fi

echo ""
echo "Iniciando servidor en http://localhost:8000"
echo "Presiona Ctrl+C para detener el servidor"
echo ""

python3 api.py

