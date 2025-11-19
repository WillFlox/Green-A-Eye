# 📦 Configurar Git LFS para Modelos

Los modelos de tu proyecto (`best_model.pth` ~92MB) son demasiado grandes para Git normal. Git LFS (Large File Storage) es la solución recomendada.

## 🚀 Pasos para Configurar Git LFS

### 1. Instalar Git LFS

**Windows:**
- Descarga desde: https://git-lfs.github.com/
- O usa Chocolatey: `choco install git-lfs`

**macOS:**
```bash
brew install git-lfs
```

**Linux:**
```bash
sudo apt install git-lfs  # Ubuntu/Debian
# o
sudo yum install git-lfs  # CentOS/RHEL
```

### 2. Inicializar Git LFS en tu repositorio

```bash
# Inicializar Git LFS
git lfs install

# Verificar que funciona
git lfs version
```

### 3. Rastrear los archivos de modelos

```bash
# Ya está configurado en .gitattributes, pero puedes verificar:
git lfs track "*.pth"
git lfs track "*.pkl"

# Ver qué archivos están siendo rastreados
git lfs ls-files
```

### 4. Agregar los archivos normalmente

```bash
# Agregar .gitattributes (si no está ya)
git add .gitattributes

# Agregar los modelos (Git LFS los manejará automáticamente)
git add dataset/best_model.pth
git add best_model.pth  # Si existe en la raíz
git add cnn_model.pkl   # Si quieres incluirlo

# Verificar que Git LFS los está manejando
git lfs ls-files
```

### 5. Hacer commit

```bash
git commit -m "Agregar modelos con Git LFS"
git push
```

## ✅ Verificar que Funciona

Después de hacer push, verifica en GitHub que los archivos muestran "Stored with Git LFS" en lugar del tamaño real.

## 🔄 Para Otros Desarrolladores

Cuando alguien clone el repositorio, Git LFS descargará automáticamente los archivos grandes:

```bash
git clone TU-REPOSITORIO
# Los archivos .pth y .pkl se descargarán automáticamente
```

## ⚠️ Si NO Quieres Usar Git LFS

Si prefieres incluir los modelos directamente (no recomendado para archivos >50MB):

1. Edita `.gitignore` y descomenta:
   ```gitignore
   *.pth
   *.pkl
   !dataset/best_model.pth
   !best_model.pth
   ```

2. Elimina `.gitattributes` o comenta las líneas relacionadas

3. Agrega los archivos normalmente:
   ```bash
   git add -f dataset/best_model.pth
   ```

## 📊 Comparación

| Método | Tamaño en Repo | Velocidad Clone | Recomendado |
|--------|----------------|-----------------|-------------|
| Git Normal | 92 MB | Lento | ❌ No |
| Git LFS | ~1 KB (puntero) | Rápido | ✅ Sí |
| Almacenamiento Externo | 0 MB | Depende | ✅ Para producción |

## 🎯 Recomendación

**Usa Git LFS** para los modelos en el repositorio. Es la mejor práctica para archivos >50MB.

