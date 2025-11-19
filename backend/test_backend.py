"""
Script de prueba para verificar que el backend puede cargar correctamente
"""
import sys
import os

print("=" * 60)
print("PRUEBA DE CARGA DEL BACKEND")
print("=" * 60)
print()

# Verificar archivos necesarios
print("1. Verificando archivos necesarios...")
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

classes_path = os.path.join(base_dir, 'classes.json')
model_paths = [
    os.path.join(base_dir, 'dataset', 'best_model.pth'),
    os.path.join(base_dir, 'best_model.pth'),
]

print(f"   Buscando classes.json en: {classes_path}")
if os.path.exists(classes_path):
    print("   [OK] classes.json encontrado")
else:
    print("   [ERROR] classes.json NO encontrado")

print(f"   Buscando best_model.pth...")
model_found = False
for path in model_paths:
    if os.path.exists(path):
        print(f"   [OK] best_model.pth encontrado en: {path}")
        model_found = True
        break

if not model_found:
    print("   [ERROR] best_model.pth NO encontrado en ninguna ubicacion")

print()

# Verificar dependencias
print("2. Verificando dependencias Python...")
dependencies = ['torch', 'torchvision', 'fastapi', 'PIL', 'uvicorn']
missing = []

for dep in dependencies:
    try:
        if dep == 'PIL':
            __import__('PIL')
        else:
            __import__(dep)
        print(f"   [OK] {dep} instalado")
    except ImportError:
        print(f"   [ERROR] {dep} NO instalado")
        missing.append(dep)

if missing:
    print(f"\n   Instala las dependencias faltantes con:")
    print(f"   pip install {' '.join(missing)}")

print()

# Intentar cargar el modelo
print("3. Intentando cargar el modelo...")
try:
    from predict import load_model
    print("   Cargando modelo...")
    model, classes = load_model()
    print(f"   [OK] Modelo cargado exitosamente!")
    print(f"   [OK] Total de clases: {len(classes)}")
except Exception as e:
    print(f"   [ERROR] Error al cargar el modelo: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 60)
print("PRUEBA COMPLETADA")
print("=" * 60)

