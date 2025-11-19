# 🚀 Guía de Despliegue - Green A-Eye

Esta guía te ayudará a desplegar tu aplicación Green A-Eye en producción.

## 📋 Tabla de Contenidos

1. [Despliegue del Frontend (Next.js)](#frontend)
2. [Despliegue del Backend (FastAPI)](#backend)
3. [Configuración de Variables de Entorno](#variables)
4. [Opciones de Plataformas](#plataformas)

## 🚀 Guías Rápidas

Para instrucciones paso a paso más detalladas, consulta:
- **📘 [DESPLIEGUE_BACKEND_CLOUD.md](DESPLIEGUE_BACKEND_CLOUD.md)** - Guía completa para desplegar el backend en Railway o Render
- **⚙️ [CONFIGURAR_VERCEL.md](CONFIGURAR_VERCEL.md)** - Cómo configurar variables de entorno en Vercel

---

## 🎨 Despliegue del Frontend (Next.js) {#frontend}

### Opción 1: Vercel (Recomendado - Gratis)

Vercel es la plataforma oficial de Next.js y ofrece despliegue gratuito.

#### Pasos:

1. **Preparar el proyecto:**
   ```bash
   # Asegúrate de que el proyecto esté en un repositorio Git
   git init
   git add .
   git commit -m "Preparar para despliegue"
   ```

2. **Crear cuenta en Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub, GitLab o Bitbucket

3. **Desplegar:**
   - Haz clic en "New Project"
   - Importa tu repositorio
   - Vercel detectará automáticamente que es un proyecto Next.js
   - Configura las variables de entorno (ver sección de variables)
   - Haz clic en "Deploy"

4. **Configurar variables de entorno en Vercel:**
   - Ve a Settings → Environment Variables
   - Agrega: `NEXT_PUBLIC_API_URL=https://tu-backend-url.com`
   - **📖 Para instrucciones detalladas, consulta: [CONFIGURAR_VERCEL.md](CONFIGURAR_VERCEL.md)**

#### Ventajas:
- ✅ Gratis para proyectos personales
- ✅ Despliegue automático desde Git
- ✅ SSL automático
- ✅ CDN global
- ✅ Optimizado para Next.js

---

### Opción 2: Netlify

#### Pasos:

1. **Crear archivo `netlify.toml` en la raíz:**
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Desplegar:**
   - Ve a [netlify.com](https://netlify.com)
   - Conecta tu repositorio Git
   - Netlify detectará la configuración automáticamente

---

### Opción 3: Despliegue Manual (VPS/Server)

#### Requisitos:
- Node.js 18+ instalado
- Servidor con acceso SSH

#### Pasos:

1. **Construir la aplicación:**
   ```bash
   npm run build
   ```

2. **Iniciar el servidor de producción:**
   ```bash
   npm start
   ```

3. **Usar PM2 para mantener el proceso activo:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "green-a-eye" -- start
   pm2 save
   pm2 startup
   ```

4. **Configurar Nginx como proxy reverso:**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🐍 Despliegue del Backend (FastAPI + PyTorch) {#backend}

El backend es más complejo porque requiere PyTorch y el modelo entrenado.

### Opción 1: Railway (Recomendado - Fácil)

Railway soporta Python y puede manejar modelos de ML.

**📖 Para instrucciones paso a paso detalladas, consulta: [DESPLIEGUE_BACKEND_CLOUD.md](DESPLIEGUE_BACKEND_CLOUD.md)**

**Resumen rápido:**
1. El archivo `railway.json` ya está configurado en tu proyecto
2. Ve a [railway.app](https://railway.app) y crea un nuevo proyecto
3. Conecta tu repositorio Git
4. Railway detectará automáticamente la configuración
5. Configura la variable `ALLOWED_ORIGINS` con la URL de tu frontend en Vercel
6. Obtén la URL del backend y configúrala en Vercel como `NEXT_PUBLIC_API_URL`

#### Nota sobre el modelo:
- El archivo `best_model.pth` puede ser grande (>100MB)
- Railway permite archivos grandes, pero considera usar Git LFS
- Alternativamente, sube el modelo a un servicio de almacenamiento (S3, Cloudinary) y descárgalo al iniciar

---

### Opción 2: Render

**📖 Para instrucciones paso a paso detalladas, consulta: [DESPLIEGUE_BACKEND_CLOUD.md](DESPLIEGUE_BACKEND_CLOUD.md)**

**Resumen rápido:**
1. El archivo `render.yaml` ya está configurado en tu proyecto
2. Ve a [render.com](https://render.com) y crea un nuevo Web Service
3. Conecta tu repositorio Git
4. Render detectará automáticamente el archivo `render.yaml`
5. Configura la variable `ALLOWED_ORIGINS` con la URL de tu frontend en Vercel
6. Obtén la URL del backend y configúrala en Vercel como `NEXT_PUBLIC_API_URL`

---

### Opción 3: Google Cloud Run (Recomendado para producción)

Cloud Run es ideal para aplicaciones con modelos de ML.

#### Pasos:

1. **Crear archivo `Dockerfile` en `backend/`:**
   ```dockerfile
   FROM python:3.11-slim
   
   WORKDIR /app
   
   # Instalar dependencias del sistema
   RUN apt-get update && apt-get install -y \
       build-essential \
       && rm -rf /var/lib/apt/lists/*
   
   # Copiar requirements
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   # Copiar código y modelo
   COPY . .
   COPY ../dataset/best_model.pth /app/dataset/best_model.pth
   COPY ../classes.json /app/classes.json
   
   # Exponer puerto
   EXPOSE 8000
   
   # Comando de inicio
   CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Construir y desplegar:**
   ```bash
   # Instalar Google Cloud SDK
   gcloud builds submit --tag gcr.io/TU-PROYECTO/green-a-eye-backend
   gcloud run deploy green-a-eye-backend \
     --image gcr.io/TU-PROYECTO/green-a-eye-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

---

### Opción 4: AWS Lambda (Con contenedores)

Para usar Lambda, necesitas empaquetar todo en un contenedor.

#### Crear `Dockerfile` (similar al de Cloud Run)

#### Desplegar:
```bash
# Construir imagen
docker build -t green-a-eye-backend ./backend

# Crear ECR repository
aws ecr create-repository --repository-name green-a-eye-backend

# Subir imagen
docker tag green-a-eye-backend:latest TU-ACCOUNT.dkr.ecr.REGION.amazonaws.com/green-a-eye-backend:latest
docker push TU-ACCOUNT.dkr.ecr.REGION.amazonaws.com/green-a-eye-backend:latest

# Crear función Lambda desde la imagen
```

---

### Opción 5: VPS Manual (DigitalOcean, Linode, etc.)

#### Requisitos:
- Ubuntu 20.04+ o similar
- Python 3.11+
- Al menos 2GB RAM (PyTorch requiere memoria)

#### Pasos:

1. **Conectar por SSH:**
   ```bash
   ssh usuario@tu-servidor.com
   ```

2. **Instalar dependencias:**
   ```bash
   sudo apt update
   sudo apt install python3.11 python3-pip git
   ```

3. **Clonar el repositorio:**
   ```bash
   git clone TU-REPOSITORIO
   cd "Green A-Eye/backend"
   ```

4. **Instalar dependencias Python:**
   ```bash
   pip3 install -r requirements.txt
   ```

5. **Usar systemd para mantener el servicio activo:**
   Crear archivo `/etc/systemd/system/green-a-eye.service`:
   ```ini
   [Unit]
   Description=Green A-Eye Backend API
   After=network.target
   
   [Service]
   Type=simple
   User=tu-usuario
   WorkingDirectory=/ruta/a/Green A-Eye/backend
   Environment="PATH=/usr/bin:/usr/local/bin"
   ExecStart=/usr/bin/python3 api.py
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

6. **Iniciar el servicio:**
   ```bash
   sudo systemctl enable green-a-eye
   sudo systemctl start green-a-eye
   sudo systemctl status green-a-eye
   ```

7. **Configurar Nginx como proxy:**
   ```nginx
   server {
       listen 80;
       server_name api.tu-dominio.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

---

## 🔧 Configuración de Variables de Entorno {#variables}

### Frontend (.env.local o en Vercel):

```bash
NEXT_PUBLIC_API_URL=https://tu-backend-url.com
```

**📖 Para instrucciones detalladas sobre cómo configurar esto en Vercel, consulta: [CONFIGURAR_VERCEL.md](CONFIGURAR_VERCEL.md)**

### Backend:

Actualizar CORS en `backend/api.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://tu-frontend-url.vercel.app",  # Agregar tu URL de producción
        "https://tu-dominio.com"  # Tu dominio personalizado
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

O mejor aún, usar variables de entorno:

```python
import os

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Comparación de Plataformas {#plataformas}

### Frontend:

| Plataforma | Gratis | Facilidad | Recomendado |
|------------|--------|-----------|-------------|
| Vercel | ✅ | ⭐⭐⭐⭐⭐ | ✅ Sí |
| Netlify | ✅ | ⭐⭐⭐⭐ | ✅ Sí |
| VPS Manual | ❌ | ⭐⭐ | Solo si necesitas control total |

### Backend:

| Plataforma | Gratis | Soporte PyTorch | Facilidad | Recomendado |
|------------|--------|-----------------|-----------|-------------|
| Railway | ✅ (limitado) | ✅ | ⭐⭐⭐⭐ | ✅ Sí |
| Render | ✅ (limitado) | ✅ | ⭐⭐⭐⭐ | ✅ Sí |
| Google Cloud Run | ✅ (créditos) | ✅ | ⭐⭐⭐ | ✅ Sí (producción) |
| AWS Lambda | ✅ (créditos) | ✅ | ⭐⭐ | Solo si ya usas AWS |
| VPS Manual | ❌ | ✅ | ⭐⭐ | Solo si necesitas control |

---

## 🎯 Recomendación Final

### Para Desarrollo/Pruebas:
- **Frontend**: Vercel (gratis, fácil)
- **Backend**: Railway o Render (gratis, fácil)

### Para Producción:
- **Frontend**: Vercel con dominio personalizado
- **Backend**: Google Cloud Run o VPS (más control, mejor rendimiento)

---

## ⚠️ Consideraciones Importantes

1. **Tamaño del Modelo:**
   - El archivo `best_model.pth` puede ser grande
   - Considera usar Git LFS o almacenamiento externo (S3, Cloud Storage)

2. **CORS:**
   - Asegúrate de configurar correctamente los orígenes permitidos
   - Incluye tanto la URL de desarrollo como producción

3. **Variables de Entorno:**
   - Nunca subas archivos `.env` al repositorio
   - Usa las variables de entorno de la plataforma

4. **SSL/HTTPS:**
   - Todas las plataformas modernas ofrecen SSL automático
   - Asegúrate de que tu backend también use HTTPS

5. **Monitoreo:**
   - Configura alertas para cuando el backend esté caído
   - Monitorea el uso de recursos (especialmente memoria con PyTorch)

---

## 🆘 Solución de Problemas

### El backend no responde:
1. Verifica que el servicio esté ejecutándose
2. Revisa los logs de la plataforma
3. Verifica que el modelo esté en la ruta correcta
4. Asegúrate de que el puerto esté configurado correctamente

### Error de CORS:
1. Verifica que la URL del frontend esté en `allow_origins`
2. Asegúrate de que ambas aplicaciones usen HTTPS en producción

### El modelo no carga:
1. Verifica la ruta del modelo en `predict.py`
2. Asegúrate de que el archivo esté incluido en el despliegue
3. Considera usar almacenamiento externo para archivos grandes

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Railway](https://docs.railway.app)
- [Documentación de FastAPI](https://fastapi.tiangolo.com)
- [Documentación de Next.js](https://nextjs.org/docs)

---

¡Buena suerte con tu despliegue! 🚀

