# Dockerfile para Green A-Eye Backend
FROM python:3.11-slim

# Instalar dependencias del sistema necesarias para PyTorch
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requirements primero (para cachear la instalación)
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código del backend
COPY . .

# Copiar modelo y clases desde el directorio raíz
# Nota: Estos archivos deben estar disponibles en el contexto de build
COPY ../dataset/best_model.pth /app/dataset/best_model.pth
COPY ../classes.json /app/classes.json

# Exponer puerto
EXPOSE 8000

# Variable de entorno para el puerto (algunas plataformas lo requieren)
ENV PORT=8000

# Comando de inicio
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]

