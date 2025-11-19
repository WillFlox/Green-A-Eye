"""
API FastAPI para servir el modelo de predicción
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
import os

# Agregar el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from predict import predict_from_bytes, load_model

app = FastAPI(title="Green A-Eye API", version="1.0.0")

# Configurar CORS para permitir requests desde el frontend
# Permite configurar orígenes permitidos mediante variable de entorno
# Formato: "http://localhost:3000,https://tu-dominio.com"
allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
)

allowed_origins_env = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

# Si se establece ALLOWED_ORIGINS="*" permitimos cualquier origen (sin credenciales)
if len(allowed_origins_env) == 1 and allowed_origins_env[0] == "*":
    cors_allow_origins = ["*"]
    cors_allow_credentials = False
else:
    cors_allow_origins = allowed_origins_env
    cors_allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allow_origins,
    allow_credentials=cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar el modelo al iniciar
@app.on_event("startup")
async def startup_event():
    print("Cargando modelo...")
    try:
        load_model()
        print("Modelo cargado exitosamente!")
    except Exception as e:
        print(f"Error al cargar el modelo: {e}")
        raise

@app.get("/")
async def root():
    return {"message": "Green A-Eye API - Detector de Enfermedades en Hojas"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Endpoint para predecir enfermedades en hojas de plantas
    
    Args:
        file: Archivo de imagen (jpg, png, webp)
    
    Returns:
        JSON con la predicción y confianza
    """
    # Validar tipo de archivo
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
    
    try:
        # Leer los bytes de la imagen
        image_bytes = await file.read()
        
        # Hacer la predicción
        result = predict_from_bytes(image_bytes, top_k=5)
        
        return JSONResponse(content=result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la imagen: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

