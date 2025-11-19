# 🚀 Pasos Después de Git Init

Ya hiciste `git init`, `git add .` y `git commit`. Ahora necesitas subir tu código a un repositorio remoto para poder desplegarlo.

## 📋 Pasos Siguientes

### 1. Crear Repositorio en GitHub (Recomendado)

1. **Ve a GitHub:**
   - Abre [github.com](https://github.com) en tu navegador
   - Inicia sesión (o crea una cuenta si no tienes)

2. **Crear nuevo repositorio:**
   - Haz clic en el botón "+" (arriba a la derecha)
   - Selecciona "New repository"
   - Nombre: `green-a-eye` (o el que prefieras)
   - Descripción: "Aplicación de detección de enfermedades en plantas usando IA"
   - **NO marques** "Initialize with README" (ya tienes archivos)
   - **NO marques** "Add .gitignore" (ya tienes uno)
   - **NO marques** "Choose a license" (por ahora)
   - Haz clic en "Create repository"

3. **GitHub te mostrará comandos, pero usa estos:**

### 2. Configurar Git LFS (IMPORTANTE - Para los modelos)

Antes de hacer push, configura Git LFS para los modelos grandes:

```powershell
# Instalar Git LFS (si no lo tienes)
# Descarga desde: https://git-lfs.github.com/

# Inicializar Git LFS
git lfs install

# Verificar que funciona
git lfs version
```

### 3. Conectar con GitHub y Hacer Push

```powershell
# Navegar al directorio del proyecto
cd "C:\Users\HP\Desktop\Green A-Eye"

# Agregar el repositorio remoto (reemplaza TU-USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU-USUARIO/green-a-eye.git

# Verificar que se agregó correctamente
git remote -v

# Cambiar a la rama main (si estás en master)
git branch -M main

# Hacer push (Git LFS manejará los modelos automáticamente)
git push -u origin main
```

**Nota:** GitHub te pedirá autenticación. Puedes usar:
- Tu usuario y contraseña (si tienes 2FA, necesitarás un token)
- O mejor: un Personal Access Token (más seguro)

### 4. Crear Personal Access Token (Si es necesario)

Si GitHub te pide autenticación:

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Haz clic en "Generate new token (classic)"
3. Nombre: "Green A-Eye"
4. Selecciona scope: `repo` (acceso completo a repositorios)
5. Genera el token
6. **Copia el token** (solo se muestra una vez)
7. Úsalo como contraseña cuando Git te pida autenticación

## ✅ Después del Push

Una vez que tu código esté en GitHub, puedes desplegar:

### Opción A: Desplegar Frontend en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Haz clic en "Add New Project"
4. Selecciona tu repositorio `green-a-eye`
5. Vercel detectará automáticamente Next.js
6. **IMPORTANTE:** Agrega variable de entorno:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `http://localhost:8000` (por ahora, lo cambiarás después)
7. Haz clic en "Deploy"
8. Espera a que termine el despliegue

### Opción B: Desplegar Backend Primero

Si quieres desplegar el backend primero (recomendado):

1. Ve a [railway.app](https://railway.app) o [render.com](https://render.com)
2. Conecta tu cuenta de GitHub
3. Crea un nuevo proyecto desde tu repositorio
4. Configura:
   - Root Directory: `/backend`
   - Start Command: `uvicorn api:app --host 0.0.0.0 --port $PORT`
   - Variables de entorno:
     - `ALLOWED_ORIGINS`: URL de tu frontend (la configurarás después)
5. Una vez desplegado, copia la URL del backend
6. Actualiza `NEXT_PUBLIC_API_URL` en Vercel con esa URL

## 🔍 Verificar que Todo Está Bien

Después del push, verifica:

```powershell
# Ver el estado
git status

# Ver los archivos rastreados con Git LFS
git lfs ls-files

# Ver el último commit
git log --oneline -1
```

## ⚠️ Problemas Comunes

### Error: "remote origin already exists"
```powershell
# Eliminar el remoto existente
git remote remove origin

# Agregar el correcto
git remote add origin https://github.com/TU-USUARIO/green-a-eye.git
```

### Error: "authentication failed"
- Verifica que el token sea correcto
- O usa SSH en lugar de HTTPS

### Los modelos no se suben con Git LFS
```powershell
# Verificar que Git LFS está instalado
git lfs version

# Re-rastrear los archivos
git lfs track "*.pth"
git lfs track "*.pkl"
git add .gitattributes
git add dataset/best_model.pth
git commit -m "Agregar modelos con Git LFS"
git push
```

## 📝 Resumen de Comandos

```powershell
# 1. Configurar Git LFS
git lfs install

# 2. Agregar remoto (reemplaza TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/green-a-eye.git

# 3. Cambiar a main
git branch -M main

# 4. Hacer push
git push -u origin main
```

¡Listo! Después de esto, tu código estará en GitHub y podrás desplegarlo. 🚀

