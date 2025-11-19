# 📦 Copiar Modelo a Backend - Solución Simple para Railway

Esta guía te explica cómo copiar el modelo `best_model.pth` al directorio `backend/` para que esté disponible cuando Railway usa Root Directory como `backend`.

## 🎯 ¿Por qué mover el modelo a backend/?

Cuando Railway usa Root Directory como `backend`, solo tiene acceso a archivos dentro de `backend/`. Si `best_model.pth` está en `dataset/best_model.pth` en la raíz, Railway no puede acceder a él.

**Solución simple**: Copiar el modelo a `backend/` para que siempre esté disponible.

## 📋 Pasos para Copiar el Modelo

### Paso 1: Descargar el archivo real de Git LFS (si usas Git LFS)

Si tu modelo está en Git LFS, primero necesitas descargarlo localmente:

```bash
# Asegúrate de que Git LFS esté instalado
git lfs install

# Descargar el archivo real de Git LFS
git lfs pull

# O descargar un archivo específico
git lfs pull --include="dataset/best_model.pth"
```

### Paso 2: Copiar el modelo a backend/

**Opción A: Si el archivo está en `dataset/best_model.pth`:**
```bash
# Windows (PowerShell)
Copy-Item "dataset\best_model.pth" -Destination "backend\best_model.pth" -Force

# Linux/Mac
cp dataset/best_model.pth backend/best_model.pth
```

**Opción B: Si el archivo está en la raíz como `best_model.pth`:**
```bash
# Windows (PowerShell)
Copy-Item "best_model.pth" -Destination "backend\best_model.pth" -Force

# Linux/Mac
cp best_model.pth backend/best_model.pth
```

### Paso 3: Verificar que se copió correctamente

```bash
# Verificar que el archivo existe
ls -la backend/best_model.pth

# O en Windows
dir backend\best_model.pth
```

### Paso 4: Agregar al repositorio con Git LFS

Si usas Git LFS (recomendado para archivos >50MB):

```bash
# Agregar el archivo con Git LFS
git add backend/best_model.pth

# Verificar que Git LFS lo está manejando
git lfs ls-files

# Deberías ver: backend/best_model.pth (LFS)
```

### Paso 5: Hacer commit y push

```bash
git add .gitattributes backend/best_model.pth
git commit -m "Agregar best_model.pth a backend/ para Railway"
git push
```

## ✅ Verificar que Funciona

Después de hacer push y redesplegar en Railway:

1. Los logs de Railway deberían mostrar que el modelo se encuentra
2. El backend debería iniciar correctamente
3. No deberías ver el error "No se encontró el archivo best_model.pth"

## 🔄 Alternativa: Usar el nixpacks.toml para Copiar Automáticamente

Si prefieres NO copiar el archivo al repositorio, puedes configurar `nixpacks.toml` para que copie el archivo durante el build. El archivo `nixpacks.toml` en la raíz ya está configurado para hacer esto.

**Importante**: Para que esto funcione, necesitas:
1. Cambiar el Root Directory en Railway a `.` (raíz) en lugar de `backend`
2. El archivo debe estar disponible en la raíz del repositorio (con Git LFS)

## 📊 Comparación de Opciones

| Opción | Pros | Contras | Recomendado |
|--------|------|---------|-------------|
| Copiar a `backend/` | ✅ Simple<br>✅ Funciona siempre<br>✅ No depende de Root Directory | ⚠️ Duplica el archivo en el repo | ✅ **Sí** |
| Copiar en build (nixpacks.toml) | ✅ No duplica archivo<br>✅ Mantiene estructura original | ⚠️ Requiere Root Directory = raíz<br>⚠️ Depende de Git LFS | ⚠️ Solo si Root Directory = raíz |

## 🎯 Recomendación

**Para Railway con Root Directory = `backend`**: Copia el modelo a `backend/best_model.pth`

**Para Railway con Root Directory = `.` (raíz)**: Puedes mantener el modelo en `dataset/best_model.pth` y usar `nixpacks.toml` para copiarlo durante el build

---

¡Buena suerte! 🚀

