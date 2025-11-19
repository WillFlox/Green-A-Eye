# 🔧 Solución al Error de Railway: "pip: command not found"

## 🐛 Problema

Cuando intentas desplegar el backend en Railway, aparece este error:

```
/bin/bash: line 1: pip: command not found
ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c cd backend && pip install -r requirements.txt" did not complete successfully: exit code: 127
```

## 🔍 Causa

Railway está intentando construir todo el proyecto (frontend Next.js + backend Python) desde la raíz del repositorio. Detecta el proyecto Next.js primero y trata de usar comandos de Node.js, pero luego intenta ejecutar comandos de Python que no están disponibles en ese contexto.

## ✅ Solución: Configurar el Root Directory en Railway

### Paso 1: Acceder a la Configuración del Servicio

1. Ve a tu proyecto en [railway.app](https://railway.app)
2. Haz clic en el servicio que se creó (probablemente llamado "Green A-Eye" o similar)
3. En el menú lateral, haz clic en **Settings** (Configuración)

### Paso 2: Configurar el Root Directory

1. En la sección de configuración, busca **Root Directory** (Directorio Raíz)
2. Haz clic en el campo o en "Change" si está disponible
3. Establece el valor como: `backend`
4. **⚠️ IMPORTANTE**: También asegúrate de que **Builder** esté configurado como **NIXPACKS** (no Dockerfile)
5. Haz clic en **Save** o **Update**

### Paso 3: Configurar el Builder

1. En la misma sección de Settings, busca **Builder**
2. **IMPORTANTE**: Asegúrate de que esté configurado como **NIXPACKS** (no Dockerfile)
3. Si está configurado como Dockerfile, cámbialo a **NIXPACKS**
4. Guarda los cambios

### Paso 4: Configurar el Build Command (Opcional)

1. En la misma sección de Settings, busca **Build Command**
2. Puedes dejarlo vacío para que Railway lo detecte automáticamente desde `nixpacks.toml`
3. O establece: `pip install --no-cache-dir -r requirements.txt`

### Paso 5: Configurar el Start Command

1. Busca **Start Command**
2. Establece: `uvicorn api:app --host 0.0.0.0 --port $PORT`
3. O déjalo vacío si ya está configurado en `railway.json` o `Procfile`

### Paso 6: Configurar Variables de Entorno

1. Ve a la pestaña **Variables** en Railway
2. Agrega las siguientes variables:

   **ALLOWED_ORIGINS**:
   ```
   https://tu-app.vercel.app,https://tu-dominio.com
   ```
   (Reemplaza con tu URL real de Vercel)

   **PORT** (opcional, Railway lo configura automáticamente):
   ```
   8000
   ```

### Paso 7: Redesplegar

1. Después de hacer los cambios, Railway debería redesplegar automáticamente
2. Si no, ve a la pestaña **Deployments**
3. Haz clic en los tres puntos (...) del último despliegue
4. Selecciona **Redeploy**

### ✅ Verificar que Funciona

1. Ve a la pestaña **Deployments** en Railway
2. Espera a que el despliegue termine (verás "Deployed successfully")
3. Haz clic en la URL generada por Railway (ej: `https://tu-backend.up.railway.app`)
4. Deberías ver: `{"message": "Green A-Eye API - Detector de Enfermedades en Hojas"}`
5. Prueba el endpoint de health: `https://tu-backend.up.railway.app/health`
6. Deberías ver: `{"status": "healthy"}`

---

## 🔄 Alternativa: Usar la Interfaz de Railway para Crear el Servicio Manualmente

Si la solución anterior no funciona, puedes crear el servicio manualmente:

### Paso 1: Crear Nuevo Proyecto Vacío

1. En Railway, haz clic en **New Project**
2. Selecciona **Empty Project**

### Paso 2: Conectar el Repositorio

1. Haz clic en **+ New** → **GitHub Repo**
2. Selecciona tu repositorio "Green A-Eye"
3. Railway creará un nuevo servicio

### Paso 3: Configurar el Servicio

1. Haz clic en el servicio recién creado
2. Ve a **Settings**
3. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install --no-cache-dir -r requirements.txt`
   - **Start Command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`

### Paso 4: Configurar Variables y Redesplegar

Sigue los pasos 5 y 6 de la solución anterior.

---

## 📝 Notas Importantes

### Sobre los archivos necesarios

Asegúrate de que estos archivos estén en tu repositorio:
- `backend/api.py`
- `backend/predict.py`
- `backend/requirements.txt`
- `backend/runtime.txt` (con `python-3.11.0`)
- `backend/Procfile` (opcional, con `web: uvicorn api:app --host 0.0.0.0 --port $PORT`)
- `classes.json` (en la raíz del proyecto)
- `dataset/best_model.pth` o `best_model.pth` (en la raíz)

### Sobre las rutas de archivos

El backend buscará `classes.json` y `best_model.pth` desde diferentes ubicaciones:
- Desde la raíz del proyecto (relativo a `backend/`)
- Desde el directorio `backend/`
- Desde un nivel arriba de `backend/`

Si el despliegue falla porque no encuentra estos archivos, necesitarás ajustar las rutas en `backend/predict.py`.

---

## 🆘 Si Aún No Funciona

1. **Revisa los logs de Railway**:
   - Ve a la pestaña **Deployments**
   - Haz clic en el último despliegue
   - Revisa los logs para ver errores específicos

2. **Verifica que Python esté configurado correctamente**:
   - Asegúrate de que `backend/runtime.txt` existe con `python-3.11.0`

3. **Verifica las dependencias**:
   - Revisa que `backend/requirements.txt` tenga todas las dependencias necesarias

4. **Contacta al soporte de Railway**:
   - Si nada funciona, contacta a Railway con los logs de error

---

## 📚 Recursos

- [Documentación de Railway - Root Directory](https://docs.railway.app/develop/variables#root-directory)
- [Documentación de Railway - Build & Deploy](https://docs.railway.app/develop/deploy)

---

¡Buena suerte! 🚀

