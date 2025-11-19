# 🚀 Guía de Despliegue del Backend en la Nube

Esta guía te ayudará a desplegar el backend Python de Green A-Eye en la nube para que funcione junto con tu frontend desplegado en Vercel.

## 📋 ¿Por qué necesitas desplegar el backend por separado?

- **Vercel** solo puede ejecutar aplicaciones Next.js (frontend)
- El backend Python con PyTorch necesita ejecutarse en un servidor separado
- Necesitas desplegar el backend en una plataforma que soporte Python y modelos de ML

---

## 🎯 Opción 1: Railway (Recomendado - Más Fácil)

Railway es gratuito y muy fácil de usar. Sigue estos pasos:

### Paso 1: Preparar el repositorio

Asegúrate de que tu código esté en GitHub, GitLab o Bitbucket.

### Paso 2: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en "Start a New Project"
3. Inicia sesión con GitHub (o tu plataforma Git)

### Paso 3: Desplegar el backend

1. Haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Selecciona tu repositorio "Green A-Eye"
4. **⚠️ IMPORTANTE**: En la configuración del servicio, necesitas establecer el **Root Directory** como `backend`
   - Haz clic en el servicio que se crea
   - Ve a **Settings** (Configuración)
   - Busca **Root Directory** (Directorio Raíz)
   - Establece: `backend`
   - Guarda los cambios
5. Railway detectará automáticamente Python desde el directorio backend
6. El servicio comenzará a desplegarse automáticamente

### Paso 4: Configurar variables de entorno

1. En el panel de Railway, ve a la pestaña "Variables"
2. Agrega la variable `ALLOWED_ORIGINS` con el valor:
   ```
   https://tu-app.vercel.app,https://tu-dominio.com
   ```
   (Reemplaza con tu URL real de Vercel)

### Paso 5: Obtener la URL del backend

1. Railway generará automáticamente una URL como: `https://tu-backend.up.railway.app`
2. Copia esta URL (la necesitarás en el siguiente paso)

### Paso 6: Configurar variables de entorno en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Agrega una nueva variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://tu-backend.up.railway.app` (la URL que copiaste)
   - **Environments**: Selecciona Production, Preview y Development
4. Haz clic en **Save**

### Paso 7: Redesplegar el frontend

1. En Vercel, ve a la pestaña **Deployments**
2. Haz clic en los tres puntos (...) del último despliegue
3. Selecciona **Redeploy**
4. Esto aplicará la nueva variable de entorno

### ✅ ¡Listo!

Ahora tu aplicación debería funcionar completamente en la nube. El frontend en Vercel se conectará automáticamente al backend en Railway.

---

## 🎯 Opción 2: Render (Alternativa Gratuita)

Render es otra opción gratuita que funciona muy bien:

### Paso 1: Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Crea una cuenta gratuita (puedes usar GitHub)

### Paso 2: Crear nuevo Web Service

1. En el dashboard, haz clic en **New +** → **Web Service**
2. Conecta tu repositorio de GitHub
3. Selecciona el repositorio "Green A-Eye"

### Paso 3: Configurar el servicio

Render detectará automáticamente el archivo `render.yaml`. Si no lo detecta, configura manualmente:

- **Name**: `green-a-eye-backend`
- **Environment**: `Python 3`
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && uvicorn api:app --host 0.0.0.0 --port $PORT`

### Paso 4: Configurar variables de entorno en Render

1. En la configuración del servicio, ve a **Environment**
2. Agrega las variables:
   - `ALLOWED_ORIGINS`: `https://tu-app.vercel.app,https://tu-dominio.com`
   - `PYTHON_VERSION`: `3.11.0`

### Paso 5: Obtener la URL y configurar Vercel

1. Render generará una URL como: `https://green-a-eye-backend.onrender.com`
2. Sigue los pasos 6 y 7 de la sección de Railway arriba para configurar Vercel

---

## 🔧 Verificar que Todo Funciona

### Verificar el backend

1. Abre la URL de tu backend en el navegador (ej: `https://tu-backend.up.railway.app/health`)
2. Deberías ver: `{"status":"healthy"}`

### Verificar el frontend

1. Ve a tu aplicación en Vercel
2. El mensaje de error del backend debería desaparecer
3. Intenta subir una imagen y hacer una predicción
4. Debería funcionar correctamente

---

## ⚠️ Notas Importantes

### Sobre el modelo (`best_model.pth`)

- El archivo del modelo puede ser grande (>100MB)
- Railway y Render tienen límites de tamaño de repositorio
- Si tu modelo es muy grande:
  - Usa **Git LFS** (ver `CONFIGURAR_GIT_LFS.md`)
  - O sube el modelo a un servicio de almacenamiento (S3, Cloudinary) y descárgalo al iniciar

### Sobre los archivos necesarios

Asegúrate de que estos archivos estén en tu repositorio:
- `backend/api.py`
- `backend/predict.py`
- `backend/requirements.txt`
- `backend/railway.json` o `render.yaml` (dependiendo de la plataforma)
- `dataset/best_model.pth` (o en la raíz como `best_model.pth`)
- `classes.json` (en la raíz)

### Sobre CORS

El backend ya está configurado para aceptar requests desde cualquier origen configurado en `ALLOWED_ORIGINS`. Solo asegúrate de agregar la URL de tu frontend en Vercel.

---

## 🆘 Solución de Problemas

### El backend no inicia en Railway/Render

1. Revisa los logs en la plataforma
2. Verifica que `requirements.txt` tenga todas las dependencias
3. Asegúrate de que `best_model.pth` y `classes.json` estén en las rutas correctas

### El frontend no se conecta al backend

1. Verifica que la variable `NEXT_PUBLIC_API_URL` esté configurada en Vercel
2. Verifica que hayas redesplegado el frontend después de agregar la variable
3. Revisa la consola del navegador (F12) para ver errores
4. Verifica que `ALLOWED_ORIGINS` en el backend incluya la URL de Vercel

### Error de CORS

1. Agrega la URL exacta de tu frontend a `ALLOWED_ORIGINS` en el backend
2. Asegúrate de incluir `https://` en la URL
3. No incluyas una barra final `/` en la URL

---

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app)
- [Documentación de Render](https://render.com/docs)
- [Documentación de Vercel - Variables de Entorno](https://vercel.com/docs/concepts/projects/environment-variables)

---

¡Buena suerte con tu despliegue! 🚀

