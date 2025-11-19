# Backend API - Green A-Eye

Backend en Python con FastAPI para servir el modelo de predicción de enfermedades en hojas.

## 📋 Requisitos

- Python 3.8 o superior
- PyTorch 2.0+
- torchvision 0.15+

## 🚀 Instalación

1. Instala las dependencias:

```bash
cd backend
pip install -r requirements.txt
```

## ▶️ Ejecución

1. Asegúrate de que el archivo `best_model.pth` esté en `dataset/best_model.pth`
2. Asegúrate de que el archivo `classes.json` esté en el directorio raíz del proyecto
3. Ejecuta el servidor:

```bash
python api.py
```

O usando uvicorn directamente:

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en `http://localhost:8000`

## 📡 Endpoints

### GET `/`
Información básica del API

### GET `/health`
Verificar el estado del servidor

### POST `/predict`
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

## 🔧 Configuración

Puedes cambiar la URL del API en el frontend editando la variable de entorno:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

O modificando directamente en `components/Classifier.tsx`:

```typescript
const API_URL = "http://tu-servidor:8000";
```

