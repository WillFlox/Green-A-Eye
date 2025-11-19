# ⚙️ Configurar Variables de Entorno en Vercel

Esta guía rápida te muestra cómo configurar las variables de entorno en Vercel para que tu frontend se conecte al backend desplegado en la nube.

## 🎯 Paso a Paso

### Paso 1: Acceder a la Configuración del Proyecto

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Selecciona tu proyecto "Green A-Eye"
3. Ve a la pestaña **Settings** (Configuración)

### Paso 2: Ir a Environment Variables

1. En el menú lateral, haz clic en **Environment Variables**
2. Verás una lista de todas las variables de entorno del proyecto

### Paso 3: Agregar la Variable del API

1. Haz clic en **Add New** (Agregar Nueva)
2. Completa el formulario:
   - **Key (Nombre)**: `NEXT_PUBLIC_API_URL`
   - **Value (Valor)**: La URL de tu backend desplegado
     - Si usaste Railway: `https://tu-backend.up.railway.app`
     - Si usaste Render: `https://tu-backend.onrender.com`
     - O la URL que te haya dado la plataforma
   - **Environments (Ambientes)**: 
     - ✅ Production (Producción)
     - ✅ Preview (Vista Previa)
     - ✅ Development (Desarrollo)

3. Haz clic en **Save** (Guardar)

### Paso 4: Verificar la Variable

Asegúrate de que la variable aparezca en la lista con estos ambientes seleccionados:
- Production
- Preview  
- Development

### Paso 5: Redesplegar la Aplicación

⚠️ **IMPORTANTE**: Después de agregar o modificar variables de entorno, debes redesplegar:

1. Ve a la pestaña **Deployments** (Despliegues)
2. Encuentra el último despliegue
3. Haz clic en los **tres puntos** (...) a la derecha
4. Selecciona **Redeploy** (Redesplegar)
5. Confirma el redespliegue

### ✅ ¡Listo!

Después del redespliegue, tu aplicación usará la nueva URL del backend. Espera unos minutos mientras se completa el redespliegue.

---

## 🔍 Verificar que Funciona

### En el navegador:

1. Ve a tu aplicación en Vercel
2. Abre la consola del navegador (F12 → Console)
3. Busca errores relacionados con el API
4. El mensaje de error del backend debería desaparecer

### Probar una predicción:

1. Sube una imagen en la aplicación
2. Haz clic en "Analizar Hoja"
3. Debería funcionar sin problemas

---

## 📝 Formato de la URL

Asegúrate de que la URL:
- ✅ Comience con `https://`
- ✅ No termine con una barra `/`
- ✅ Sea accesible públicamente

**Ejemplos correctos:**
- `https://green-a-eye-backend.up.railway.app`
- `https://green-a-eye-backend.onrender.com`

**Ejemplos incorrectos:**
- `http://green-a-eye-backend.up.railway.app` (debe ser https)
- `https://green-a-eye-backend.up.railway.app/` (no debe terminar en /)
- `green-a-eye-backend.up.railway.app` (falta https://)

---

## 🆘 Solución de Problemas

### La variable no funciona después del redespliegue

1. Verifica que hayas hecho **Redeploy** (no solo guardado la variable)
2. Espera 2-3 minutos para que se complete el despliegue
3. Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)

### Error de CORS en la consola

1. Verifica que en el backend hayas configurado `ALLOWED_ORIGINS` con la URL de Vercel
2. Asegúrate de incluir la URL exacta (con `https://`)

### El mensaje de error del backend sigue apareciendo

1. Verifica que la URL del backend sea correcta y accesible
2. Abre la URL directamente en el navegador: `https://tu-backend.com/health`
3. Deberías ver: `{"status":"healthy"}`
4. Si no ves eso, el backend no está funcionando correctamente

---

## 📚 Más Información

- [Documentación de Vercel - Variables de Entorno](https://vercel.com/docs/concepts/projects/environment-variables)
- Ver también: `DESPLIEGUE_BACKEND_CLOUD.md` para desplegar el backend

