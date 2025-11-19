# 🔧 Solución: Backend No Disponible

## ✅ Diagnóstico Completado

El modelo y todos los archivos están correctos. El problema es que **el servidor backend no está ejecutándose**.

## 🚀 Solución Rápida

### Opción 1: Usar el Script Automático (Recomendado)

1. **Doble clic en el archivo**: `iniciar-backend.bat`
   - Esto abrirá una ventana de terminal
   - El servidor se iniciará automáticamente
   - **MANTÉN ESTA VENTANA ABIERTA** mientras uses la aplicación

2. Deberías ver mensajes como:
   ```
   Clases cargadas desde: ...
   Modelo encontrado en: ...
   Modelo cargado exitosamente!
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

3. Una vez que veas "Uvicorn running", el backend está listo

4. **Refresca la página web** (F5) y el mensaje de error debería desaparecer

### Opción 2: Inicio Manual

1. Abre una **nueva terminal/PowerShell**

2. Navega al directorio del proyecto:
   ```bash
   cd "C:\Users\HP\Desktop\Green A-Eye\backend"
   ```

3. Ejecuta el servidor:
   ```bash
   python api.py
   ```

4. Deberías ver:
   ```
   Cargando modelo...
   Clases cargadas desde: ...
   Modelo encontrado en: ...
   Modelo cargado exitosamente!
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

5. **NO CIERRES ESTA TERMINAL** - el servidor debe seguir ejecutándose

6. Refresca la página web

## ⚠️ Importante

- El backend debe estar **ejecutándose** mientras uses la aplicación
- Si cierras la terminal donde está el backend, el servidor se detiene
- Necesitas **DOS ventanas abiertas**:
  1. Una para el backend (Python)
  2. Otra para el frontend (Next.js) - si lo iniciaste manualmente

## 🔍 Verificar que Funciona

1. Con el backend ejecutándose, abre en tu navegador:
   ```
   http://localhost:8000/health
   ```

2. Deberías ver:
   ```json
   {"status":"healthy"}
   ```

3. Si ves esto, el backend está funcionando correctamente

## 🎯 Flujo Completo de Uso

1. **Inicia el Backend**:
   - Doble clic en `iniciar-backend.bat`
   - O ejecuta `python backend/api.py` en una terminal

2. **Inicia el Frontend** (si no está corriendo):
   - En otra terminal: `npm run dev`
   - O usa `start-dev.bat` para iniciar ambos automáticamente

3. **Abre el navegador**:
   - Ve a http://localhost:3000
   - Deberías ver "✅ Conectado al servidor de predicción"

4. **Usa la aplicación**:
   - Arrastra una imagen
   - Haz clic en "Analizar Hoja"
   - ¡Disfruta de las predicciones!

## ❌ Si Sigue Sin Funcionar

1. **Verifica que el puerto 8000 no esté en uso**:
   ```bash
   netstat -ano | findstr :8000
   ```
   Si hay algo usando el puerto, cierra ese proceso

2. **Revisa los errores en la terminal del backend**:
   - Cualquier mensaje de error te dirá qué está mal

3. **Ejecuta el script de prueba**:
   ```bash
   python backend/test_backend.py
   ```
   Esto verificará que todo esté correcto

## 📞 Resumen

**El problema**: El backend no está ejecutándose
**La solución**: Ejecuta `iniciar-backend.bat` o `python backend/api.py`
**Importante**: Mantén la terminal del backend abierta mientras uses la app

