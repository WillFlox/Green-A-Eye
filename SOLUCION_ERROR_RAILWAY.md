# 🔧 Solución al Error de Railway: "pip: command not found"

## 🐛 Problema

Cuando intentas desplegar el backend en Railway, aparece este error:

```
/bin/bash: line 1: pip: command not found
ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c cd backend && pip install -r requirements.txt" did not complete successfully: exit code: 127
```

## 🔍 Causa

El problema puede tener dos causas:

1. **Railway está usando el Dockerfile en lugar de NIXPACKS**: Railway detecta automáticamente el `Dockerfile` en el directorio `backend/` y lo usa, pero el Dockerfile intenta copiar archivos desde el directorio padre (`../classes.json`, `../dataset/best_model.pth`), lo cual no funciona cuando el Root Directory está configurado como `backend`.

2. **Railway está intentando construir todo el proyecto**: Railway detecta el proyecto Next.js primero y trata de usar comandos de Node.js, pero luego intenta ejecutar comandos de Python que no están disponibles en ese contexto.

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
4. **NOTA**: Si Railway sigue detectando el Dockerfile, el archivo `backend/Dockerfile` ha sido renombrado a `Dockerfile.backup` para evitar que Railway lo use automáticamente
5. Guarda los cambios

### Paso 4: Configurar el Build Command (IMPORTANTE)

1. En la misma sección de Settings, busca **Build Command**
2. **⚠️ CRÍTICO**: Si hay algún comando que incluya `cd backend`, elimínalo o déjalo vacío
3. El Build Command debe estar vacío o ser: `pip install --no-cache-dir -r requirements.txt` (sin `cd backend`)
4. Railway debería detectar automáticamente el `nixpacks.toml` desde el directorio `backend`
5. Guarda los cambios

### Paso 5: Configurar el Start Command (CRÍTICO)

1. Busca **Start Command** en Settings
2. **⚠️ IMPORTANTE**: Si ves `cd backend && uvicorn ...`, elimínalo completamente
3. Establece: `uvicorn api:app --host 0.0.0.0 --port $PORT` (sin `cd backend`)
4. O déjalo vacío si ya está configurado correctamente en `railway.json` o `Procfile`
5. **NOTA**: Railway puede estar usando un Start Command manual en lugar del de `railway.json` o `Procfile`

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

### Error: "cd: can't cd to backend"

Si ves este error (`cd backend && pip install -r requirements.txt`), significa que Railway está intentando ejecutar comandos que incluyen `cd backend`, pero cuando el Root Directory es `backend`, ya estás en ese directorio.

**Solución**:
1. El archivo `nixpacks.toml` en la raíz ha sido renombrado a `nixpacks.toml.root.backup` para evitar conflictos
2. El archivo `backend/nixpacks.toml` ha sido recreado con los comandos correctos (sin `cd backend`)
3. Verifica en Railway Settings:
   - **Root Directory**: Debe estar configurado como `backend`
   - **Builder**: Debe estar configurado como **NIXPACKS** (no Dockerfile)
   - **Build Command**: Debe estar **vacío** o ser `pip install --no-cache-dir -r requirements.txt` (sin `cd backend`)
   - **Start Command**: Debe ser `uvicorn api:app --host 0.0.0.0 --port $PORT` (sin `cd backend`)
4. Guarda todos los cambios
5. Redesplega el servicio

**⚠️ IMPORTANTE**: Si hay algún Build Command en Railway que incluya `cd backend`, elimínalo completamente. Railway usará el `backend/nixpacks.toml` automáticamente cuando el Root Directory sea `backend`.

### Error: "COPY ../classes.json: not found"

Si ves este error, significa que Railway está usando el Dockerfile (aunque el Root Directory esté configurado como `backend`). 

**Solución**:
1. El archivo `backend/Dockerfile` ha sido renombrado a `Dockerfile.backup` para evitar que Railway lo use
2. Asegúrate de que el Builder esté configurado como **NIXPACKS** (no Dockerfile)
3. Redesplega el servicio

**Alternativa**: Si necesitas usar Dockerfile, necesitas cambiar el Root Directory a la raíz del proyecto y modificar el Dockerfile para que copie correctamente los archivos desde el contexto correcto.

### Otros problemas:

1. **Revisa los logs de Railway**:
   - Ve a la pestaña **Deployments**
   - Haz clic en el último despliegue
   - Revisa los logs para ver errores específicos

2. **Error: "mise ERROR failed to install core:python@3.11.0"**:
   - Este error ocurre cuando NIXPACKS intenta usar `mise` para instalar Python desde `runtime.txt`
   - **Solución**: El archivo `runtime.txt` ha sido actualizado de `python-3.11.0` a `python-3.11`
   - El `nixpacks.toml` ahora usa directamente los paquetes de Nix (`python311`) en lugar de depender de `mise`
   - Si el error persiste, puedes eliminar temporalmente `runtime.txt` ya que NIXPACKS detectará Python automáticamente

3. **Verifica que Python esté configurado correctamente**:
   - El archivo `backend/runtime.txt` existe con `python-3.11` (no `python-3.11.0`)

4. **Verifica las dependencias**:
   - Revisa que `backend/requirements.txt` tenga todas las dependencias necesarias

5. **Verifica que los archivos necesarios estén en el repositorio**:
   - `classes.json` debe estar en la raíz del repositorio
   - `best_model.pth` debe estar en `dataset/best_model.pth` o en la raíz como `best_model.pth`
   - El backend buscará estos archivos en múltiples ubicaciones durante la ejecución

6. **Error: "Build timed out"**:
   - Este error ocurre cuando el build tarda demasiado (PyTorch con CUDA es muy pesado ~2GB+ y puede tardar 10+ minutos)
   - **Solución**: 
     - El archivo `requirements.txt` ha sido actualizado para usar PyTorch CPU-only (mucho más ligero ~200MB)
     - Esto reduce significativamente el tiempo de build de ~10 minutos a ~3-5 minutos
     - El código ya está preparado para usar CPU si no hay GPU disponible (`torch.device('cuda' if torch.cuda.is_available() else 'cpu')`)
     - Asegúrate de que el Build Command esté vacío o solo tenga `pip install --no-cache-dir -r requirements.txt`
     - Verifica que no haya comandos innecesarios en el build que aumenten el tiempo
     - Si el build sigue fallando por timeout después de optimizar, Railway puede tener un límite muy estricto
     - Considera desplegar en Render que tiene límites de tiempo más generosos (15-20 minutos)

7. **Error: Deploy command tiene "cd backend && uvicorn ..."**:
   - Aunque `railway.json` y `Procfile` estén correctos, Railway puede tener un Start Command manual configurado en la interfaz web
   - **Solución**:
     - Ve a Railway Settings → Start Command
     - Si ves `cd backend && uvicorn ...`, cámbialo a solo `uvicorn api:app --host 0.0.0.0 --port $PORT`
     - O déjalo vacío para que use el `Procfile` o `railway.json`
     - Guarda los cambios y redesplega

8. **Error: "No se encontró el archivo classes.json"**:
   - Este error ocurre cuando Railway tiene el Root Directory configurado como `backend`, pero `classes.json` está en la raíz del proyecto, fuera de `backend/`
   - **Solución**: 
     - El archivo `classes.json` ha sido copiado a `backend/classes.json` para que esté disponible cuando Railway usa `backend/` como Root Directory
     - El código en `predict.py` ha sido actualizado para buscar `classes.json` en múltiples ubicaciones, incluyendo el directorio `backend/`
     - El archivo `backend/nixpacks.toml` intenta copiar `classes.json` desde el directorio padre durante el build si está disponible
     - Asegúrate de que `backend/classes.json` esté en tu repositorio Git y se haya hecho commit
     - Redesplega el servicio después de agregar el archivo

9. **Error: "No se encontró el archivo best_model.pth"**:
   - Este error ocurre cuando Railway tiene el Root Directory configurado como `backend`, pero `best_model.pth` está en `dataset/best_model.pth` en la raíz del proyecto, fuera de `backend/`
   - **Solución**: 
     - El código en `predict.py` ha sido actualizado para buscar `best_model.pth` en múltiples ubicaciones, incluyendo `/app/dataset/best_model.pth` (Railway), `backend/dataset/best_model.pth`, y `backend/best_model.pth`
     - El archivo `backend/nixpacks.toml` intenta copiar `best_model.pth` desde el directorio padre durante el build si está disponible
     - **⚠️ IMPORTANTE**: Asegúrate de que `best_model.pth` esté en tu repositorio Git:
       - Verifica que NO esté en `.gitignore` (o está comentado)
       - Si está en `.gitignore`, descoméntalo o elimínalo de `.gitignore`
       - Haz commit y push del archivo al repositorio:
         ```bash
         git add dataset/best_model.pth best_model.pth
         git commit -m "Agregar best_model.pth al repositorio"
         git push
         ```
     - Si el archivo es muy grande (>100MB), considera usar **Git LFS** (ver `CONFIGURAR_GIT_LFS.md`)
     - Si el archivo NO está en el repositorio, Railway NO lo tendrá disponible
     - Redesplega el servicio después de agregar el archivo al repositorio

10. **Contacta al soporte de Railway**:
   - Si nada funciona, contacta a Railway con los logs de error

---

## 📚 Recursos

- [Documentación de Railway - Root Directory](https://docs.railway.app/develop/variables#root-directory)
- [Documentación de Railway - Build & Deploy](https://docs.railway.app/develop/deploy)

---

¡Buena suerte! 🚀

