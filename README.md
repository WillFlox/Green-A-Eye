# Green A-Eye 🌿👁️

## Identificador de Plantas y Enfermedades

Aplicación web completa que utiliza inteligencia artificial (CNN ResNet-50) para:
- **Identificar la planta** de la hoja
- **Detectar enfermedades específicas** (38 clases diferentes)

## 🚀 Tecnologías Utilizadas

### Frontend
- **Framework**: Next.js 15.1.0 (App Router)
- **Librería UI**: React 19.0.0
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 3.4.1
- **Componentes UI**: Radix UI (Popover)
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

### Backend
- **Framework**: FastAPI
- **ML Framework**: PyTorch 2.0+
- **Modelo**: ResNet-50 entrenado con 38 clases
- **Procesamiento**: torchvision, PIL

## 📋 Características

- ✅ **Identificación de plantas**: Detecta de qué planta es la hoja
- ✅ **Detección de enfermedades**: Identifica 38 enfermedades específicas
- ✅ Interfaz de arrastrar y soltar para cargar imágenes
- ✅ Vista previa animada de la imagen cargada
- ✅ **Predicción real con modelo PyTorch entrenado**
- ✅ Visualización clara separando planta y enfermedad
- ✅ Visualización de resultados con barra de confianza
- ✅ Popover con desglose detallado de top 5 predicciones
- ✅ Diseño responsive (mobile-first)
- ✅ Soporte para modo oscuro
- ✅ Animaciones fluidas con Framer Motion

## 🎯 Plantas y Enfermedades Detectadas (38 clases)

El modelo puede identificar la planta y su estado/enfermedad. Soporta múltiples plantas:

### Manzana (Apple)
- Sarna del Manzano (Apple Scab)
- Podredumbre Negra (Black Rot)
- Roya del Manzano (Cedar Apple Rust)
- Sana

### Maíz (Corn)
- Mancha de Cercospora
- Roya Común
- Tizón del Norte
- Sana

### Tomate (Tomato)
- Mancha Bacteriana
- Tizón Temprano
- Tizón Tardío
- Moho de la Hoja
- Mancha de Septoria
- Ácaros (Araña Roja)
- Mancha Objetivo
- Virus del Mosaico
- Virus del Enrollamiento Amarillo
- Sana

### Y muchas más en: Uva, Papa, Pimiento, Durazno, Fresa, etc.

## 🛠️ Instalación y Configuración

### 1. Frontend (Next.js)

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en [http://localhost:3000](http://localhost:3000)

### 2. Backend (Python/FastAPI)

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor API
python api.py
```

El backend estará disponible en [http://localhost:8000](http://localhost:8000)

### 3. Estructura de Archivos Requerida

Asegúrate de tener esta estructura:

```
Green A-Eye/
├── dataset/
│   └── best_model.pth          # Modelo PyTorch entrenado
├── classes.json                 # Lista de 38 clases
├── backend/
│   ├── api.py
│   ├── predict.py
│   └── requirements.txt
└── [archivos del frontend Next.js]
```

## 📦 Scripts Disponibles

### Frontend
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

### Backend
- `python api.py` - Inicia el servidor FastAPI
- `uvicorn api:app --reload` - Inicia con recarga automática

## 🔧 Configuración del API

Si el backend está en una URL diferente, configura la variable de entorno:

```bash
# En .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

O modifica directamente en `components/Classifier.tsx`:

```typescript
const API_URL = "http://tu-servidor:8000";
```

## 📡 API Endpoints

### `GET /`
Información básica del API

### `GET /health`
Verificar el estado del servidor

### `POST /predict`
Hacer una predicción sobre una imagen

**Request:**
- Content-Type: `multipart/form-data`
- Body: Archivo de imagen (file)

**Response:**
```json
{
  "prediction": "Tomato___Early_blight",
  "confidence": 0.95,
  "all_results": [
    {"label": "Tomato___Early_blight", "score": 0.95},
    {"label": "Tomato___Late_blight", "score": 0.03},
    ...
  ]
}
```

## 🎨 Características de la Interfaz

- **Dropzone interactivo**: Arrastra y suelta o haz clic para seleccionar
- **Vista previa animada**: La imagen aparece con animación suave
- **Indicador de carga**: Muestra el progreso durante el análisis
- **Resultados visuales**: Barra de confianza animada
- **Popover de detalles**: Muestra las top 5 predicciones con porcentajes
- **Modo oscuro**: Soporte automático según preferencias del sistema
- **Responsive**: Funciona perfectamente en móviles y tablets

## 🔮 Modelos Disponibles

El proyecto incluye dos modelos:

1. **`best_model.pth`** (PyTorch) - **38 clases específicas** ✅ **EN USO**
2. **`cnn_model.pkl`** (Keras) - ~5 clases generales (no usado actualmente)

## 📄 Licencia

Este proyecto es parte de Green A-Eye.

