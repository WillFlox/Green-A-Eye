"""
Backend para cargar el modelo PyTorch y hacer predicciones
"""
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import json
import os
from typing import Dict, List, Tuple

# Cargar las clases
def load_classes():
    """Carga las clases desde el archivo JSON"""
    # Obtener el directorio del archivo actual (backend/)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Obtener el directorio base del proyecto (dos niveles arriba desde backend/)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Intentar desde diferentes ubicaciones (prioridad: local, luego parent, luego raíz)
    class_paths = [
        os.path.join(current_dir, 'classes.json'),  # En el mismo directorio que predict.py (backend/)
        'classes.json',  # Directorio actual de trabajo
        os.path.join(base_dir, 'classes.json'),  # Raíz del proyecto (si está disponible)
        '../classes.json',  # Un nivel arriba
        '/app/classes.json',  # En Railway cuando Root Directory es backend
    ]
    
    for path in class_paths:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                classes = json.load(f)
                print(f"Clases cargadas desde: {path}")
                return classes
    
    raise FileNotFoundError(f"No se encontró el archivo classes.json. Buscado en: {class_paths}")

def resnet50(num_classes=38):
    """Crea una instancia de ResNet-50 con el número de clases especificado"""
    model = models.resnet50(weights=None)  # No cargar pesos pre-entrenados
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model

# Cargar el modelo
_model = None
_classes = None
_device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def load_model(model_path: str = None):
    """Carga el modelo PyTorch"""
    global _model, _classes
    
    if _model is None:
        _classes = load_classes()
        _model = resnet50(num_classes=len(_classes))
        
        # Buscar el modelo en diferentes ubicaciones
        if model_path is None:
            # Obtener el directorio del archivo actual (backend/)
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # Obtener el directorio base del proyecto (dos niveles arriba desde backend/)
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            
            model_paths = [
                # En Railway cuando Root Directory es backend, /app es donde está el código
                '/app/dataset/best_model.pth',  # En Railway desde la raíz del proyecto
                '/app/best_model.pth',  # En Railway en la raíz
                # En el mismo directorio que predict.py (backend/)
                os.path.join(current_dir, 'dataset', 'best_model.pth'),  # backend/dataset/best_model.pth
                os.path.join(current_dir, 'best_model.pth'),  # backend/best_model.pth
                # Desde la raíz del proyecto (si está disponible)
                os.path.join(base_dir, 'dataset', 'best_model.pth'),  # dataset/best_model.pth desde raíz
                os.path.join(base_dir, 'best_model.pth'),  # best_model.pth en raíz
                # Relativo al directorio actual de trabajo
                'dataset/best_model.pth',  # Relativo al directorio actual
                '../dataset/best_model.pth',  # Un nivel arriba
                'best_model.pth'  # En directorio actual
            ]
            
            for path in model_paths:
                if os.path.exists(path):
                    model_path = path
                    print(f"Modelo encontrado en: {path}")
                    break
            else:
                raise FileNotFoundError(f"No se encontró el archivo best_model.pth. Buscado en: {model_paths}")
        
        # Verificar que el archivo NO es un puntero de Git LFS
        # Los punteros LFS son archivos pequeños (<1KB) que empiezan con "version https://git-lfs.github.com/spec/v1"
        try:
            file_size = os.path.getsize(model_path)
            if file_size < 1024:  # Menos de 1KB, probablemente es un puntero LFS
                with open(model_path, 'r', encoding='utf-8') as f:
                    first_line = f.readline().strip()
                    if first_line == "version https://git-lfs.github.com/spec/v1":
                        raise ValueError(
                            f"ERROR: El archivo {model_path} es un puntero de Git LFS, no el archivo real.\n"
                            f"El archivo debe descargarse con 'git lfs pull' durante el build.\n"
                            f"Tamaño del archivo: {file_size} bytes (debería ser ~90MB+).\n"
                            f"Verifica que Git LFS esté configurado correctamente en Railway."
                        )
        except (UnicodeDecodeError, OSError):
            # Si no es texto, probablemente es el archivo real, continuar
            pass
        
        # Cargar los pesos
        # PyTorch 2.6+ cambió el valor por defecto de weights_only a True
        # Necesitamos establecerlo en False para cargar modelos antiguos
        checkpoint = torch.load(model_path, map_location=_device, weights_only=False)
        _model.load_state_dict(checkpoint)
        _model.to(_device)
        _model.eval()
        
        print(f"Modelo cargado exitosamente desde {model_path}")
        print(f"Dispositivo: {_device}")
        print(f"Total de clases: {len(_classes)}")
    
    return _model, _classes

# Transformaciones para la imagen
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def predict_image(image_path: str, top_k: int = 5) -> Dict:
    """
    Hace una predicción sobre una imagen
    
    Args:
        image_path: Ruta a la imagen
        top_k: Número de predicciones top a retornar
    
    Returns:
        Diccionario con la predicción principal y todas las predicciones
    """
    global _model, _classes
    
    if _model is None:
        load_model()
    
    # Cargar y preprocesar la imagen
    image = Image.open(image_path).convert('RGB')
    image_tensor = transform(image).unsqueeze(0).to(_device)
    
    # Hacer la predicción
    with torch.no_grad():
        outputs = _model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
    
    # Obtener las top-k predicciones
    top_probs, top_indices = torch.topk(probabilities, k=min(top_k, len(_classes)))
    
    # Formatear resultados
    all_results = []
    for prob, idx in zip(top_probs, top_indices):
        all_results.append({
            "label": _classes[idx.item()],
            "score": prob.item()
        })
    
    # Resultado principal
    prediction = _classes[top_indices[0].item()]
    confidence = top_probs[0].item()
    
    return {
        "prediction": prediction,
        "confidence": confidence,
        "all_results": all_results
    }

def predict_from_bytes(image_bytes: bytes, top_k: int = 5) -> Dict:
    """
    Hace una predicción desde bytes de imagen (útil para API)
    
    Args:
        image_bytes: Bytes de la imagen
        top_k: Número de predicciones top a retornar
    
    Returns:
        Diccionario con la predicción principal y todas las predicciones
    """
    global _model, _classes
    
    if _model is None:
        load_model()
    
    # Convertir bytes a imagen
    from io import BytesIO
    image = Image.open(BytesIO(image_bytes)).convert('RGB')
    image_tensor = transform(image).unsqueeze(0).to(_device)
    
    # Hacer la predicción
    with torch.no_grad():
        outputs = _model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
    
    # Obtener las top-k predicciones
    top_probs, top_indices = torch.topk(probabilities, k=min(top_k, len(_classes)))
    
    # Formatear resultados
    all_results = []
    for prob, idx in zip(top_probs, top_indices):
        all_results.append({
            "label": _classes[idx.item()],
            "score": prob.item()
        })
    
    # Resultado principal
    prediction = _classes[top_indices[0].item()]
    confidence = top_probs[0].item()
    
    return {
        "prediction": prediction,
        "confidence": confidence,
        "all_results": all_results
    }

if __name__ == "__main__":
    # Prueba del modelo
    print("Cargando modelo...")
    model, classes = load_model()
    print(f"\nClases disponibles: {len(classes)}")
    print("\nPrimeras 10 clases:")
    for i, cls in enumerate(classes[:10]):
        print(f"  {i+1}. {cls}")

