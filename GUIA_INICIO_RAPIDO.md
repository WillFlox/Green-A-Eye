# 🚀 Guía de Inicio Rápido - Green A-Eye

## Integración Completa del Modelo en la Página Web

Esta guía te ayudará a poner en marcha la aplicación completa con el modelo real integrado.

## 📋 Requisitos Previos

- ✅ Node.js 18+ instalado
- ✅ Python 3.8+ instalado
- ✅ pip (gestor de paquetes de Python)
- ✅ El archivo `best_model.pth` en `dataset/best_model.pth` o en la raíz
- ✅ El archivo `classes.json` en la raíz del proyecto

## 🎯 Opción 1: Inicio Automático (Windows)

### Paso 1: Instalar dependencias del frontend
```bash
npm install
```

### Paso 2: Instalar dependencias del backend
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### Paso 3: Iniciar ambos servidores automáticamente
```bash
start-dev.bat
```

Esto abrirá dos ventanas:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000

## 🎯 Opción 2: Inicio Manual

### Terminal 1: Backend (Python)

```bash
cd backend
pip install -r requirements.txt
python api.py
```

Deberías ver:
```
INFO:     Started server process
INFO:     Waiting for application startup.
Cargando modelo...
Clases cargadas desde: C:\Users\HP\Desktop\Green A-Eye\classes.json
Modelo encontrado en: C:\Users\HP\Desktop\Green A-Eye\dataset\best_model.pth
Modelo cargado exitosamente desde ...
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Frontend (Next.js)

```bash
npm install
npm run dev
```

Deberías ver:
```
  ▲ Next.js 15.1.0
  - Local:        http://localhost:3000
```

## ✅ Verificar que Funciona

1. Abre tu navegador en **http://localhost:3000**
2. Deberías ver la interfaz del "Detector de Enfermedades en Hojas"
3. Arrastra una imagen de una hoja o haz clic para seleccionar
4. Haz clic en "Analizar Hoja"
5. Deberías ver la predicción con una de las 38 enfermedades específicas

## 🔧 Solución de Problemas

### Error: "No se encontró el archivo best_model.pth"

**Solución**: Asegúrate de que el archivo esté en una de estas ubicaciones:
- `dataset/best_model.pth` (recomendado)
- `best_model.pth` (en la raíz)

### Error: "No se encontró el archivo classes.json"

**Solución**: Asegúrate de que `classes.json` esté en la raíz del proyecto.

### Error: "ModuleNotFoundError: No module named 'fastapi'"

**Solución**: 
```bash
cd backend
pip install -r requirements.txt
```

### Error: "Error en la predicción" en el frontend

**Solución**: 
1. Verifica que el backend esté ejecutándose en http://localhost:8000
2. Abre http://localhost:8000/health en tu navegador
3. Deberías ver `{"status":"healthy"}`

### El frontend no se conecta al backend

**Solución**: 
1. Verifica que ambos servidores estén corriendo
2. Revisa la consola del navegador (F12) para ver errores
3. Asegúrate de que no haya un firewall bloqueando el puerto 8000

## 📱 Uso de la Aplicación

1. **Cargar Imagen**: 
   - Arrastra y suelta una imagen en el área indicada
   - O haz clic para abrir el selector de archivos

2. **Analizar**: 
   - Haz clic en el botón "Analizar Hoja"
   - Espera a que se complete el análisis (2-5 segundos)

3. **Ver Resultados**: 
   - La predicción principal aparecerá destacada
   - Haz clic en "Ver Detalles" para ver las top 5 predicciones
   - Cada resultado muestra el porcentaje de confianza

4. **Nueva Análisis**: 
   - Haz clic en "Analizar Otra Imagen" para empezar de nuevo

## 🎨 Características Integradas

✅ **Modelo Real**: Usa el modelo PyTorch entrenado (`best_model.pth`)
✅ **38 Enfermedades**: Detecta enfermedades específicas, no solo tipos generales
✅ **Interfaz Moderna**: Diseño responsive con modo oscuro
✅ **Animaciones**: Transiciones suaves con Framer Motion
✅ **Feedback Visual**: Barras de progreso y estados de carga

## 📊 Ejemplo de Respuesta del API

```json
{
  "prediction": "Tomato___Early_blight",
  "confidence": 0.95,
  "all_results": [
    {"label": "Tomato___Early_blight", "score": 0.95},
    {"label": "Tomato___Late_blight", "score": 0.03},
    {"label": "Tomato___healthy", "score": 0.01},
    {"label": "Potato___Early_blight", "score": 0.005},
    {"label": "Tomato___Bacterial_spot", "score": 0.005}
  ]
}
```

## 🎉 ¡Listo!

Tu aplicación está completamente integrada y lista para usar. El modelo real está funcionando y puede predecir 38 enfermedades específicas en hojas de plantas.

Para más información, consulta el [README.md](README.md) principal.

