"use client";

import { useState, useCallback, ChangeEvent, DragEvent, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, Loader, Info, ChevronLeft, ChevronRight, History, Trash2, Camera, Video, VideoOff } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

// Tipos para la respuesta de predicción
interface PredictionResult {
  label: string;
  score: number;
}

interface PredictionResponse {
  prediction: string;
  confidence: number;
  all_results: PredictionResult[];
}

// Interfaz para el historial de predicciones
interface PredictionHistory {
  id: string;
  imagePreview: string;
  result: PredictionResponse;
  timestamp: number;
}

// URL del API backend (cambiar según tu configuración)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Función para hacer predicción real
async function predictImage(file: File): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error en la predicción: ${response.statusText}`);
  }

  return await response.json();
}

// Traducciones de plantas
const plantTranslations: Record<string, string> = {
  "Apple": "Manzana",
  "Blueberry": "Arándano",
  "Cherry (including sour)": "Cereza",
  "Corn (maize)": "Maíz",
  "Grape": "Uva",
  "Orange": "Naranja",
  "Peach": "Durazno",
  "Pepper, bell": "Pimiento",
  "Potato": "Papa",
  "Raspberry": "Frambuesa",
  "Soybean": "Soja",
  "Squash": "Calabaza",
  "Strawberry": "Fresa",
  "Tomato": "Tomate",
};

// Traducciones de enfermedades
const diseaseTranslations: Record<string, string> = {
  "healthy": "Sana",
  "Apple_scab": "Sarna del Manzano",
  "Black_rot": "Podredumbre Negra",
  "Cedar_apple_rust": "Roya del Manzano",
  "Powdery_mildew": "Oídio",
  "Bacterial_spot": "Mancha Bacteriana",
  "Early_blight": "Tizón Temprano",
  "Late_blight": "Tizón Tardío",
  "Leaf_Mold": "Moho de la Hoja",
  "Septoria_leaf_spot": "Mancha de Septoria",
  "Spider_mites Two-spotted_spider_mite": "Ácaros (Araña Roja)",
  "Target_Spot": "Mancha Objetivo",
  "Tomato_mosaic_virus": "Virus del Mosaico del Tomate",
  "Tomato_Yellow_Leaf_Curl_Virus": "Virus del Enrollamiento Amarillo",
  "Common_rust_": "Roya Común",
  "Northern_Leaf_Blight": "Tizón del Norte",
  "Cercospora_leaf_spot Gray_leaf_spot": "Mancha de Cercospora",
  "Esca_(Black_Measles)": "Yesca (Sarampión Negro)",
  "Leaf_blight_(Isariopsis_Leaf_Spot)": "Tizón de la Hoja",
  "Haunglongbing_(Citrus_greening)": "Huanglongbing (Enverdecimiento)",
  "Leaf_scorch": "Quemadura de la Hoja",
};

// Función para extraer planta y enfermedad de la etiqueta
function parseLabel(label: string): { plant: string; disease: string } {
  const parts = label.split("___");
  if (parts.length !== 2) {
    return { plant: "Desconocida", disease: label };
  }

  let plant = parts[0]
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  let disease = parts[1]
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Aplicar traducciones
  for (const [key, value] of Object.entries(plantTranslations)) {
    if (plant.includes(key)) {
      plant = value;
      break;
    }
  }

  // Buscar traducción de enfermedad
  const diseaseKey = Object.keys(diseaseTranslations).find((key) =>
    parts[1].includes(key)
  );
  if (diseaseKey) {
    disease = diseaseTranslations[diseaseKey];
  } else {
    // Si no hay traducción, formatear el nombre
    disease = disease
      .replace(/\s+/g, " ")
      .trim();
  }

  return { plant, disease };
}

// Función para formatear nombre completo (mantener para compatibilidad)
function formatClassName(label: string): string {
  const { plant, disease } = parseLabel(label);
  return `${plant} - ${disease}`;
}

// Base de datos de información sobre enfermedades
interface DiseaseInfo {
  causes: string[];
  treatment: string[];
  prevention?: string[];
}

const diseaseInfo: Record<string, DiseaseInfo> = {
  "Sana": {
    causes: [],
    treatment: ["La planta está saludable. Continúa con el cuidado regular."],
    prevention: [
      "Mantén un riego adecuado",
      "Proporciona nutrientes balanceados",
      "Inspecciona regularmente las hojas",
      "Mantén buena circulación de aire"
    ]
  },
  "Sarna del Manzano": {
    causes: [
      "Hongo Venturia inaequalis",
      "Condiciones húmedas y frescas en primavera",
      "Hojas infectadas del año anterior",
      "Falta de circulación de aire"
    ],
    treatment: [
      "Aplicar fungicidas preventivos en primavera (azufre, cobre)",
      "Eliminar y destruir hojas infectadas",
      "Podar para mejorar la circulación de aire",
      "Aplicar fungicidas sistémicos si la infección es grave"
    ],
    prevention: [
      "Recoger y destruir hojas caídas en otoño",
      "Podar árboles para mejorar la circulación",
      "Aplicar tratamientos preventivos antes de la brotación"
    ]
  },
  "Podredumbre Negra": {
    causes: [
      "Hongo Guignardia bidwellii",
      "Heridas en frutos o hojas",
      "Alta humedad y temperatura",
      "Frutas dañadas o agrietadas"
    ],
    treatment: [
      "Eliminar y destruir frutos y hojas infectadas",
      "Aplicar fungicidas protectores (mancozeb, captan)",
      "Podar para mejorar la circulación",
      "Evitar heridas en frutos durante el manejo"
    ],
    prevention: [
      "Controlar insectos que causan heridas",
      "Mantener buena higiene en el huerto",
      "Aplicar tratamientos preventivos durante la temporada de crecimiento"
    ]
  },
  "Roya del Manzano": {
    causes: [
      "Hongo Gymnosporangium juniperi-virginianae",
      "Presencia de enebros cercanos (hospedero alternativo)",
      "Condiciones húmedas en primavera",
      "Rocío persistente en las hojas"
    ],
    treatment: [
      "Aplicar fungicidas preventivos en primavera",
      "Eliminar enebros cercanos si es posible",
      "Podar para mejorar la circulación de aire",
      "Aplicar tratamientos con azufre o cobre"
    ],
    prevention: [
      "Eliminar o tratar enebros cercanos",
      "Aplicar fungicidas antes de la aparición de síntomas",
      "Mantener buena circulación de aire"
    ]
  },
  "Oídio": {
    causes: [
      "Hongos del género Erysiphe, Podosphaera",
      "Alta humedad relativa (no necesariamente lluvia)",
      "Temperaturas moderadas (15-25°C)",
      "Falta de circulación de aire"
    ],
    treatment: [
      "Aplicar fungicidas específicos (azufre, bicarbonato de potasio)",
      "Mejorar la circulación de aire mediante poda",
      "Evitar riego por aspersión en las hojas",
      "Aplicar aceite de neem como tratamiento orgánico"
    ],
    prevention: [
      "Plantar con espaciado adecuado",
      "Podar regularmente para mejorar la circulación",
      "Evitar exceso de nitrógeno",
      "Aplicar tratamientos preventivos en condiciones favorables"
    ]
  },
  "Mancha Bacteriana": {
    causes: [
      "Bacteria Xanthomonas spp.",
      "Heridas en hojas o frutos",
      "Alta humedad y temperatura",
      "Salpicaduras de agua contaminada"
    ],
    treatment: [
      "Aplicar productos a base de cobre",
      "Eliminar y destruir partes infectadas",
      "Evitar riego por aspersión",
      "Usar bactericidas específicos si están disponibles"
    ],
    prevention: [
      "Usar semillas certificadas libres de enfermedades",
      "Rotar cultivos",
      "Evitar trabajar las plantas cuando están húmedas",
      "Desinfectar herramientas regularmente"
    ]
  },
  "Tizón Temprano": {
    causes: [
      "Hongo Alternaria solani",
      "Condiciones cálidas y húmedas",
      "Estrés hídrico seguido de lluvia",
      "Hojas viejas y debilitadas"
    ],
    treatment: [
      "Aplicar fungicidas protectores (clorotalonil, mancozeb)",
      "Eliminar hojas infectadas",
      "Mantener riego constante para evitar estrés",
      "Aplicar fungicidas sistémicos si es necesario"
    ],
    prevention: [
      "Rotar cultivos (no plantar solanáceas consecutivamente)",
      "Mantener plantas bien nutridas",
      "Eliminar residuos de cultivos anteriores",
      "Aplicar tratamientos preventivos al inicio de la temporada"
    ]
  },
  "Tizón Tardío": {
    causes: [
      "Hongo Phytophthora infestans",
      "Condiciones frías y húmedas",
      "Rocío persistente en las hojas",
      "Alta humedad relativa"
    ],
    treatment: [
      "Aplicar fungicidas sistémicos inmediatamente (metalaxil, cimoxanil)",
      "Eliminar y destruir todas las partes infectadas",
      "Mejorar el drenaje del suelo",
      "Reducir la humedad alrededor de las plantas"
    ],
    prevention: [
      "Usar variedades resistentes",
      "Aplicar tratamientos preventivos en condiciones favorables",
      "Evitar riego por aspersión",
      "Mantener buena circulación de aire"
    ]
  },
  "Moho de la Hoja": {
    causes: [
      "Hongo Passalora fulva",
      "Alta humedad relativa",
      "Temperaturas moderadas",
      "Falta de circulación de aire"
    ],
    treatment: [
      "Aplicar fungicidas específicos (azoxistrobina, clorotalonil)",
      "Mejorar la circulación de aire mediante poda",
      "Reducir la humedad relativa",
      "Eliminar hojas gravemente infectadas"
    ],
    prevention: [
      "Usar variedades resistentes",
      "Mantener buena circulación de aire",
      "Evitar exceso de nitrógeno",
      "Aplicar tratamientos preventivos"
    ]
  },
  "Mancha de Septoria": {
    causes: [
      "Hongo Septoria lycopersici",
      "Condiciones húmedas",
      "Salpicaduras de agua del suelo",
      "Hojas viejas infectadas"
    ],
    treatment: [
      "Aplicar fungicidas protectores (mancozeb, clorotalonil)",
      "Eliminar hojas infectadas",
      "Evitar riego por aspersión",
      "Aplicar tratamientos preventivos"
    ],
    prevention: [
      "Rotar cultivos",
      "Eliminar residuos de cultivos anteriores",
      "Usar acolchado para evitar salpicaduras",
      "Mantener plantas bien espaciadas"
    ]
  },
  "Ácaros (Araña Roja)": {
    causes: [
      "Ácaros Tetranychus urticae",
      "Condiciones secas y cálidas",
      "Falta de depredadores naturales",
      "Plantas estresadas"
    ],
    treatment: [
      "Aplicar acaricidas específicos (abamectina, aceite de neem)",
      "Aumentar la humedad relativa",
      "Usar jabón insecticida",
      "Introducir depredadores naturales (ácaros fitoseidos)"
    ],
    prevention: [
      "Mantener alta humedad relativa",
      "Inspeccionar regularmente las plantas",
      "Evitar exceso de nitrógeno",
      "Mantener plantas bien hidratadas"
    ]
  },
  "Mancha Objetivo": {
    causes: [
      "Hongo Corynespora cassiicola",
      "Alta humedad y temperatura",
      "Heridas en las hojas",
      "Residuos de cultivos infectados"
    ],
    treatment: [
      "Aplicar fungicidas protectores (clorotalonil, azoxistrobina)",
      "Eliminar hojas infectadas",
      "Mejorar la circulación de aire",
      "Aplicar tratamientos preventivos"
    ],
    prevention: [
      "Eliminar residuos de cultivos",
      "Rotar cultivos",
      "Mantener buena circulación de aire",
      "Evitar heridas en las plantas"
    ]
  },
  "Virus del Mosaico del Tomate": {
    causes: [
      "Virus ToMV (Tomato Mosaic Virus)",
      "Transmisión por contacto",
      "Herramientas contaminadas",
      "Semillas infectadas"
    ],
    treatment: [
      "No hay tratamiento curativo",
      "Eliminar y destruir plantas infectadas inmediatamente",
      "Desinfectar todas las herramientas",
      "Usar variedades resistentes en el futuro"
    ],
    prevention: [
      "Usar semillas certificadas",
      "Desinfectar herramientas regularmente",
      "Lavar manos antes de trabajar con plantas",
      "Eliminar plantas infectadas rápidamente"
    ]
  },
  "Virus del Enrollamiento Amarillo": {
    causes: [
      "Virus TYLCV (Tomato Yellow Leaf Curl Virus)",
      "Transmisión por mosca blanca (Bemisia tabaci)",
      "Plantas infectadas cercanas",
      "Falta de control de insectos"
    ],
    treatment: [
      "No hay tratamiento curativo",
      "Eliminar plantas infectadas",
      "Controlar mosca blanca con insecticidas",
      "Usar barreras físicas (mallas)"
    ],
    prevention: [
      "Controlar mosca blanca desde el inicio",
      "Usar variedades resistentes",
      "Eliminar plantas hospederas de mosca blanca",
      "Usar mallas protectoras"
    ]
  },
  "Roya Común": {
    causes: [
      "Hongo Puccinia sorghi",
      "Condiciones húmedas y frescas",
      "Presencia de hospederos alternativos",
      "Alta densidad de plantas"
    ],
    treatment: [
      "Aplicar fungicidas protectores (azoxistrobina, tebuconazol)",
      "Eliminar hojas gravemente infectadas",
      "Mejorar la circulación de aire",
      "Aplicar tratamientos preventivos"
    ],
    prevention: [
      "Usar variedades resistentes",
      "Rotar cultivos",
      "Mantener espaciado adecuado",
      "Aplicar tratamientos preventivos en primavera"
    ]
  },
  "Tizón del Norte": {
    causes: [
      "Hongo Exserohilum turcicum",
      "Condiciones cálidas y húmedas",
      "Rocío persistente",
      "Alta densidad de plantas"
    ],
    treatment: [
      "Aplicar fungicidas sistémicos (azoxistrobina, propiconazol)",
      "Eliminar hojas infectadas",
      "Mejorar la circulación de aire",
      "Aplicar tratamientos preventivos"
    ],
    prevention: [
      "Usar variedades resistentes",
      "Rotar cultivos",
      "Mantener espaciado adecuado",
      "Eliminar residuos de cultivos"
    ]
  },
  "Mancha de Cercospora": {
    causes: [
      "Hongo Cercospora zeae-maydis",
      "Condiciones cálidas y húmedas",
      "Alta humedad relativa",
      "Residuos de cultivos infectados"
    ],
    treatment: [
      "Aplicar fungicidas protectores (clorotalonil, azoxistrobina)",
      "Eliminar hojas infectadas",
      "Mejorar la circulación de aire",
      "Aplicar tratamientos preventivos"
    ],
    prevention: [
      "Rotar cultivos",
      "Eliminar residuos de cultivos",
      "Mantener espaciado adecuado",
      "Aplicar tratamientos preventivos"
    ]
  },
  "Yesca (Sarampión Negro)": {
    causes: [
      "Hongo Phaeomoniella chlamydospora",
      "Heridas en la vid",
      "Condiciones de estrés",
      "Material de propagación infectado"
    ],
    treatment: [
      "No hay tratamiento curativo efectivo",
      "Podar y eliminar partes infectadas",
      "Mejorar las condiciones de crecimiento",
      "Aplicar fungicidas preventivos en heridas"
    ],
    prevention: [
      "Usar material de propagación certificado",
      "Evitar heridas en la vid",
      "Desinfectar herramientas de poda",
      "Mantener plantas bien nutridas"
    ]
  },
  "Tizón de la Hoja": {
    causes: [
      "Hongo Isariopsis griseola",
      "Condiciones húmedas",
      "Alta humedad relativa",
      "Residuos de cultivos infectados"
    ],
    treatment: [
      "Aplicar fungicidas protectores (mancozeb, clorotalonil)",
      "Eliminar hojas infectadas",
      "Mejorar la circulación de aire",
      "Aplicar tratamientos preventivos"
    ],
    prevention: [
      "Rotar cultivos",
      "Eliminar residuos de cultivos",
      "Mantener buena circulación de aire",
      "Aplicar tratamientos preventivos"
    ]
  },
  "Huanglongbing (Enverdecimiento)": {
    causes: [
      "Bacteria Candidatus Liberibacter",
      "Transmisión por psílido asiático de los cítricos",
      "Material de propagación infectado",
      "Falta de control de insectos vectores"
    ],
    treatment: [
      "No hay tratamiento curativo",
      "Eliminar árboles infectados para prevenir propagación",
      "Controlar psílidos con insecticidas",
      "Usar material de propagación certificado"
    ],
    prevention: [
      "Controlar psílidos desde el inicio",
      "Usar material de propagación certificado",
      "Inspeccionar regularmente los árboles",
      "Eliminar árboles infectados inmediatamente"
    ]
  },
  "Quemadura de la Hoja": {
    causes: [
      "Bacteria Xylella fastidiosa",
      "Transmisión por insectos chupadores",
      "Heridas en las plantas",
      "Condiciones de estrés hídrico"
    ],
    treatment: [
      "No hay tratamiento curativo efectivo",
      "Eliminar partes gravemente infectadas",
      "Controlar insectos vectores",
      "Mantener plantas bien hidratadas"
    ],
    prevention: [
      "Controlar insectos vectores",
      "Usar material de propagación certificado",
      "Mantener plantas bien hidratadas",
      "Evitar heridas en las plantas"
    ]
  }
};

// Función para obtener información de la enfermedad
function getDiseaseInfo(disease: string): DiseaseInfo | null {
  // Buscar coincidencia exacta primero
  if (diseaseInfo[disease]) {
    return diseaseInfo[disease];
  }
  
  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(diseaseInfo)) {
    if (disease.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(disease.toLowerCase())) {
      return value;
    }
  }
  
  // Información genérica si no se encuentra
  return {
    causes: ["Información específica no disponible para esta enfermedad"],
    treatment: [
      "Consultar con un especialista en fitopatología",
      "Aplicar prácticas generales de manejo de enfermedades",
      "Eliminar partes infectadas",
      "Mejorar condiciones de crecimiento"
    ],
    prevention: [
      "Mantener buena higiene en el cultivo",
      "Inspeccionar regularmente las plantas",
      "Aplicar tratamientos preventivos",
      "Mantener plantas bien nutridas e hidratadas"
    ]
  };
}

export default function Classifier() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // Estados para detección en tiempo real
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCaptureTimeRef = useRef<number>(0);
  const previousFrameRef = useRef<ImageData | null>(null);

  // Cargar historial desde localStorage al iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem("predictionHistory");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      }
    }
  }, []);

  // Verificar estado del API al cargar
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
          setApiStatus("online");
        } else {
          setApiStatus("offline");
        }
      } catch (error) {
        setApiStatus("offline");
      }
    };

    checkApiStatus();
    // Verificar cada 10 segundos
    const interval = setInterval(checkApiStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Resetear índice al abrir/cerrar historial
  useEffect(() => {
    if (showHistory && history.length > 0) {
      setCurrentIndex(0);
    }
  }, [showHistory, history.length]);

  // Manejar teclas para navegar el carrusel
  useEffect(() => {
    if (!showHistory) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        rotateHistory("left");
      } else if (e.key === "ArrowRight") {
        rotateHistory("right");
      } else if (e.key === "Escape") {
        setShowHistory(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showHistory, history.length]);

  // Manejar deslizamiento táctil
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      rotateHistory("right");
    } else if (isRightSwipe) {
      rotateHistory("left");
    }
  };

  // Manejar la carga de archivos
  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen válido (jpg, png, webp)");
      return;
    }

    setImageFile(file);
    setResult(null);

    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Manejar input de archivo
  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  // Manejar drag and drop
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  // Remover imagen
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
  };

  // Analizar imagen
  const analyzeImage = async () => {
    if (!imageFile || !imagePreview) return;

    setIsAnalyzing(true);
    try {
      const prediction = await predictImage(imageFile);
      setResult(prediction);
      
      // Guardar en historial
      const newHistoryItem: PredictionHistory = {
        id: Date.now().toString(),
        imagePreview,
        result: prediction,
        timestamp: Date.now(),
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 50); // Máximo 50 predicciones
      setHistory(updatedHistory);
      localStorage.setItem("predictionHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error al analizar:", error);
      alert(
        "Hubo un error al analizar la imagen. Asegúrate de que el servidor backend esté ejecutándose en http://localhost:8000"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Eliminar del historial
  const removeFromHistory = (id: string) => {
    setHistory((prevHistory) => {
      const updatedHistory = prevHistory.filter((item) => item.id !== id);

      // Actualizar almacenamiento
      if (updatedHistory.length > 0) {
        localStorage.setItem("predictionHistory", JSON.stringify(updatedHistory));
      } else {
        localStorage.removeItem("predictionHistory");
      }

      // Ajustar índice del carrusel
      if (updatedHistory.length === 0) {
        setShowHistory(false);
        setCurrentIndex(0);
      } else {
        setCurrentIndex((prevIndex) =>
          prevIndex >= updatedHistory.length ? updatedHistory.length - 1 : prevIndex
        );
      }

      return updatedHistory;
    });
  };

  // Limpiar todo el historial
  const clearHistory = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar todo el historial? Esta acción no se puede deshacer.")) {
      setHistory([]);
      localStorage.removeItem("predictionHistory");
      setShowHistory(false);
    }
  };

  // Navegar historial giratorio
  const rotateHistory = (direction: "left" | "right") => {
    if (history.length === 0) return;
    
    if (direction === "left") {
      setCurrentIndex((prev) => (prev - 1 + history.length) % history.length);
    } else {
      setCurrentIndex((prev) => (prev + 1) % history.length);
    }
  };

  // Navegar historial (mantener para compatibilidad)
  const scrollHistory = (direction: "left" | "right") => {
    rotateHistory(direction);
  };

  // Activar/desactivar modo tiempo real
  const toggleRealTimeMode = async () => {
    if (isRealTimeMode) {
      // Desactivar modo tiempo real
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsRealTimeMode(false);
      setIsDetecting(false);
      setVideoReady(false);
      // Limpiar vista previa si estaba en modo tiempo real
      if (imagePreview && imageFile?.name.startsWith("capture-")) {
        setImagePreview(null);
        setImageFile(null);
        setResult(null);
      }
    } else {
      // Activar modo tiempo real
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment", // Cámara trasera en móviles
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        setStream(mediaStream);
        setIsRealTimeMode(true);
        
        // Reiniciar frame anterior
        previousFrameRef.current = null;
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        alert("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
      }
    }
  };

  // Detección de movimiento mejorada
  const detectMotion = (): boolean => {
    if (!videoRef.current || !canvasRef.current) return false;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return false;
    
    // Configurar canvas con las dimensiones del video
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    
    // Dibujar frame actual en el canvas
    ctx.drawImage(video, 0, 0, width, height);
    
    // Obtener datos de la imagen actual
    const currentFrame = ctx.getImageData(0, 0, width, height);
    const currentData = currentFrame.data;
    
    // Si no hay frame anterior, guardar este y retornar false
    if (!previousFrameRef.current) {
      previousFrameRef.current = currentFrame;
      return false;
    }
    
    // Comparar con frame anterior
    const previousData = previousFrameRef.current.data;
    let totalDiff = 0;
    let changedPixels = 0;
    const threshold = 30; // Umbral de diferencia para considerar un píxel como "cambiado"
    
    // Muestrear píxeles para detectar cambios (cada 20 píxeles para mejor rendimiento)
    const sampleRate = 20;
    for (let i = 0; i < currentData.length; i += sampleRate * 4) {
      const r1 = currentData[i];
      const g1 = currentData[i + 1];
      const b1 = currentData[i + 2];
      const r2 = previousData[i];
      const g2 = previousData[i + 1];
      const b2 = previousData[i + 2];
      
      // Calcular diferencia de color
      const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      totalDiff += diff;
      
      if (diff > threshold) {
        changedPixels++;
      }
    }
    
    const pixelCount = currentData.length / (sampleRate * 4);
    const avgDiff = totalDiff / pixelCount;
    const changeRatio = changedPixels / pixelCount;
    
    // Guardar frame actual para la próxima comparación
    previousFrameRef.current = currentFrame;
    
    // Detectar si hay suficiente movimiento y contenido en la imagen
    // Requiere: diferencia promedio > 15 y al menos 5% de píxeles cambiados
    return avgDiff > 15 && changeRatio > 0.05;
  };

  // Iniciar detección continua
  const startDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    detectionIntervalRef.current = setInterval(() => {
      if (detectMotion()) {
        // Esperar al menos 2 segundos entre capturas
        const now = Date.now();
        if (now - lastCaptureTimeRef.current > 2000) {
          captureAndAnalyze();
          lastCaptureTimeRef.current = now;
        }
      }
    }, 2000); // Verificar cada 2 segundos
  };

  // Capturar frame y analizar
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    // Configurar canvas
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Capturar frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir canvas a blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      // Convertir blob a File
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setImagePreview(preview);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
      
      // Analizar automáticamente
      setIsDetecting(true);
      setIsAnalyzing(true);
      
      try {
        const prediction = await predictImage(file);
        setResult(prediction);
        
        // Guardar en historial
        const newHistoryItem: PredictionHistory = {
          id: Date.now().toString(),
          imagePreview: canvas.toDataURL("image/jpeg", 0.8),
          result: prediction,
          timestamp: Date.now(),
        };
        
        const updatedHistory = [newHistoryItem, ...history].slice(0, 50);
        setHistory(updatedHistory);
        localStorage.setItem("predictionHistory", JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Error al analizar:", error);
      } finally {
        setIsAnalyzing(false);
        setIsDetecting(false);
      }
    }, "image/jpeg", 0.8);
  };

  // Efecto para manejar el stream del video
  useEffect(() => {
    if (stream && videoRef.current && isRealTimeMode) {
      const video = videoRef.current;
      video.srcObject = stream;
      
      const handleCanPlay = async () => {
        try {
          await video.play();
          setVideoReady(true);
          // Esperar un momento para que el video se estabilice antes de iniciar detección
          setTimeout(() => {
            if (isRealTimeMode) {
              startDetection();
            }
          }, 1000);
        } catch (error) {
          console.error("Error al reproducir video:", error);
          setVideoReady(false);
        }
        video.removeEventListener("canplay", handleCanPlay);
      };
      
      const handleLoadedMetadata = () => {
        // Asegurar que el video tenga dimensiones válidas
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setVideoReady(true);
          video.play().catch((error) => {
            console.error("Error al reproducir video:", error);
            setVideoReady(false);
          });
        }
      };
      
      const handlePlaying = () => {
        setVideoReady(true);
      };
      
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("playing", handlePlaying);
      
      // Intentar reproducir inmediatamente
      video.play().catch((error) => {
        console.error("Error al reproducir video:", error);
        setVideoReady(false);
      });
      
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("playing", handlePlaying);
        setVideoReady(false);
      };
    } else if (!stream && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream, isRealTimeMode]);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [stream]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-green-700 via-green-500 to-emerald-400 bg-clip-text text-transparent">
          Green A-Eye
        </h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-600 dark:text-gray-400 text-lg"
        >
        Detecta la planta y su estado de salud o enfermedad
        </motion.p>
      </motion.div>

      {/* Botones de control */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        {/* Botón de modo tiempo real */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggleRealTimeMode}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2",
            isRealTimeMode
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRealTimeMode ? (
            <>
              <VideoOff className="w-5 h-5" />
              <span>Detener Detección</span>
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              <span>Detección en Tiempo Real</span>
            </>
          )}
        </motion.button>

        {/* Botón para mostrar/ocultar historial */}
        {history.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowHistory(!showHistory)}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <History className="w-5 h-5" />
            <span>Historial ({history.length})</span>
          </motion.button>
        )}
      </div>

      {/* Vista de tiempo real */}
      <AnimatePresence>
        {isRealTimeMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl bg-black"
          >
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-96 object-cover"
                style={{ backgroundColor: "#000" }}
                onError={(e) => {
                  console.error("Error en el video:", e);
                  setVideoReady(false);
                }}
              />
              
              {/* Indicador de carga del video */}
              {!videoReady && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
                    <p className="text-white text-sm">Iniciando cámara...</p>
                  </div>
                </div>
              )}
              
              {/* Overlay de detección */}
              {isDetecting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Loader className="w-5 h-5 animate-spin" />
                    Detectando y analizando...
                  </motion.div>
                </motion.div>
              )}
              
              {/* Indicador de modo activo */}
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                />
                En Vivo
              </div>
              
              {/* Botón de captura manual */}
              <motion.button
                onClick={captureAndAnalyze}
                disabled={isAnalyzing}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Camera className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </motion.button>
            </div>
            
            {/* Canvas oculto para procesamiento */}
            <canvas ref={canvasRef} className="hidden" />
            
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-900">
              La detección automática capturará imágenes cuando detecte movimiento. También puedes usar el botón de cámara para capturar manualmente.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historial de predicciones - Modal giratorio */}
      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <>
            {/* Overlay de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40"
            />
            
            {/* Modal giratorio */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 180 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div 
                className="relative w-full max-w-6xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Encabezado flotante */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="absolute top-4 left-0 right-0 z-50 flex items-center justify-center px-4"
                >
                  <div className="inline-flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
                    <h2 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                      Historial de Predicciones
                    </h2>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={clearHistory}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Limpiar Todo</span>
                      </motion.button>
                      <motion.button
                        onClick={() => setShowHistory(false)}
                        className="p-1.5 sm:p-2 bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-all shadow-md"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Contenedor transparente del carrusel */}
                <div className="relative pt-20 pb-6 sm:pb-8">
                  {/* Contador flotante */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-6"
                  >
                    <p className="text-sm text-gray-200 dark:text-gray-300 bg-black/20 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full inline-block">
                      {currentIndex + 1} de {history.length}
                    </p>
                  </motion.div>

                  {/* Carrusel 3D giratorio */}
                  <div 
                    className="relative h-[500px] sm:h-[600px] perspective-1000"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="relative w-full h-full">
                      {history.map((item, index) => {
                        const offset = index - currentIndex;
                        const absOffset = Math.abs(offset);
                        const isActive = offset === 0;
                        
                        // Calcular posición y rotación para efecto 3D
                        const rotateY = offset * 45; // Rotación en grados
                        const translateZ = isActive ? 80 : -200; // La tarjeta activa se acerca un poco
                        const scale = isActive ? 1 : 0.7;
                        const opacity = absOffset > 2 ? 0.15 : 1 - absOffset * 0.25;
                        const zIndex = isActive ? 30 : 20 - absOffset; // Asegurar que la activa quede siempre encima
                        
                        return (
                          <motion.div
                            key={item.id}
                            className="absolute inset-0 flex items-center justify-center"
                            initial={false}
                            animate={{
                              rotateY: `${rotateY}deg`,
                              z: translateZ,
                              scale,
                              opacity,
                              x: offset * 220, // Separar más las tarjetas laterales
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 100,
                              damping: 20,
                            }}
                            style={{
                              transformStyle: "preserve-3d",
                              backfaceVisibility: "hidden",
                              zIndex,
                            }}
                          >
                            <motion.div
                              className={cn(
                                "w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border-2 overflow-hidden relative group cursor-pointer",
                                isActive 
                                  ? "border-purple-500 dark:border-purple-400" 
                                  : "border-gray-200 dark:border-gray-700"
                              )}
                              whileHover={isActive ? { scale: 1.05, y: -10 } : {}}
                              onClick={() => isActive && setCurrentIndex(index)}
                            >
                              {/* Imagen */}
                              <div className="relative h-64 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                <img
                                  src={item.imagePreview}
                                  alt="Predicción"
                                  className="w-full h-full object-cover"
                                />
                                <motion.button
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromHistory(item.id);
                                  }}
                                  className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>

                              {/* Información */}
                              <div className="p-6">
                                <div className="mb-4">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Planta
                                  </p>
                                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                                    {parseLabel(item.result.prediction).plant}
                                  </p>
                                </div>
                                <div className="mb-4">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Estado
                                  </p>
                                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                                    {parseLabel(item.result.prediction).disease}
                                  </p>
                                </div>
                                <div className="mb-4">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Confianza
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.result.confidence * 100}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className="h-full bg-gradient-to-r from-green-500 to-green-600"
                                      />
                                    </div>
                                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300 min-w-[50px] text-right">
                                      {Math.round(item.result.confidence * 100)}%
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {new Date(item.timestamp).toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Controles de navegación */}
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <motion.button
                      onClick={() => rotateHistory("left")}
                      className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 transition-all"
                      whileHover={{ scale: 1.1, x: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    
                    {/* Indicadores de posición */}
                    <div className="flex gap-2">
                      {history.slice(0, Math.min(10, history.length)).map((_, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            index === currentIndex
                              ? "bg-purple-600 dark:bg-purple-400 w-8"
                              : "bg-gray-300/80 dark:bg-gray-600/80"
                          )}
                          whileHover={{ scale: 1.2 }}
                        />
                      ))}
                    </div>

                    <motion.button
                      onClick={() => rotateHistory("right")}
                      className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 transition-all"
                      whileHover={{ scale: 1.1, x: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                  </div>

                  {/* Instrucciones flotantes */}
                 
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Indicador de estado del API */}
      <AnimatePresence>
      {apiStatus === "offline" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-4 p-4 bg-yellow-100/80 dark:bg-yellow-900/40 border-2 border-yellow-400 dark:border-yellow-700 rounded-xl shadow-lg backdrop-blur-sm"
          >
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ El servidor backend no está disponible. Asegúrate de ejecutar el backend en http://localhost:8000
          </p>
          </motion.div>
      )}
      {apiStatus === "online" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 p-4 bg-green-100/80 dark:bg-green-900/40 border-2 border-green-400 dark:border-green-700 rounded-xl shadow-lg backdrop-blur-sm"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-green-800 dark:text-green-200 font-medium flex items-center gap-2"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✅
              </motion.span>
              Conectado al servidor de predicción
            </motion.p>
          </motion.div>
      )}
      </AnimatePresence>

      {/* Dropzone - solo mostrar si no está en modo tiempo real */}
      {!imagePreview && !isRealTimeMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden",
            isDragging
              ? "border-green-500 bg-green-50/80 dark:bg-green-950/30 scale-105 shadow-2xl shadow-green-500/50"
              : "border-gray-300 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:scale-105 hover:shadow-xl"
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => document.getElementById("file-input")?.click()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isDragging && (
            <div className="absolute inset-0 shimmer-effect" />
          )}
          <motion.div
            animate={isDragging ? { y: [-5, 5, -5] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
        >
            <UploadCloud className={cn(
              "w-16 h-16 mx-auto mb-4 transition-colors duration-300",
              isDragging 
                ? "text-green-500" 
                : "text-gray-400 dark:text-gray-600"
            )} />
          </motion.div>
          <p className="text-lg mb-2 text-gray-700 dark:text-gray-300 font-semibold">
            Arrastra y suelta una imagen aquí
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            o haz clic para seleccionar un archivo
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
            Formatos: JPG, PNG, WEBP
          </p>
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileInputChange}
            className="hidden"
          />
        </motion.div>
      )}

      {/* Vista previa de imagen */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="relative"
          >
            <motion.div 
              className="relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-800"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.img
                src={imagePreview}
                alt="Vista previa"
                className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
              <motion.button
                onClick={removeImage}
                className="absolute top-3 right-3 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg backdrop-blur-sm"
                aria-label="Remover imagen"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Botón de análisis */}
            {!result && (
              <motion.button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className={cn(
                  "w-full mt-6 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden",
                  isAnalyzing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-green-500/50"
                )}
                whileHover={!isAnalyzing ? { scale: 1.05, y: -2 } : {}}
                whileTap={!isAnalyzing ? { scale: 0.98 } : {}}
              >
                {!isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                )}
                {isAnalyzing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <span>Analizar Hoja</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tarjeta de resultados */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="mt-6 p-6 sm:p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 relative overflow-hidden"
          >
            {/* Efecto de brillo decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/20 rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -z-0" />
            
            <div className="relative z-10">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
              >
              Resultado del Análisis
              </motion.h2>

            <div className="space-y-6">
              {/* Planta */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  Planta:
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">
                  {parseLabel(result.prediction).plant}
                </p>
              </motion.div>

              {/* Enfermedad */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  Estado/Enfermedad:
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400">
                  {parseLabel(result.prediction).disease}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                  Confianza:
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence * 100}%` }}
                      transition={{ duration: 1, delay: 0.6, type: "spring" }}
                      className="h-full bg-gradient-to-r from-green-500 via-green-400 to-green-500 relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="text-2xl font-bold text-gray-800 dark:text-gray-100 min-w-[60px] text-right"
                  >
                    {Math.round(result.confidence * 100)}%
                  </motion.span>
                </div>
              </motion.div>

              {/* Popover con detalles */}
              <Popover.Root>
                <Popover.Trigger asChild>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
                  >
                    <Info className="w-5 h-5" />
                    Ver Detalles
                  </motion.button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-5 w-96 max-h-[80vh] overflow-y-auto z-50"
                    sideOffset={5}
                  >
                    {(() => {
                      const { disease } = parseLabel(result.prediction);
                      const info = getDiseaseInfo(disease);
                      
                        return (
                        <div className="space-y-4">
                          <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-gray-100 border-b-2 border-gray-200 dark:border-gray-700 pb-2">
                                    {disease}
                          </h3>
                          
                          {info && (
                            <>
                              {/* Causas */}
                              {info.causes.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                                    <span>🔍</span>
                                    Causas
                                  </h4>
                                  <ul className="space-y-1.5 ml-6">
                                    {info.causes.map((cause, idx) => (
                                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 list-disc">
                                        {cause}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Tratamiento */}
                              {info.treatment.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                                    <span>💊</span>
                                    Tratamiento
                                  </h4>
                                  <ul className="space-y-1.5 ml-6">
                                    {info.treatment.map((treatment, idx) => (
                                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 list-disc">
                                        {treatment}
                                      </li>
                                    ))}
                                  </ul>
                              </div>
                              )}
                              
                              {/* Prevención */}
                              {info.prevention && info.prevention.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                                    <span>🛡️</span>
                                    Prevención
                                  </h4>
                                  <ul className="space-y-1.5 ml-6">
                                    {info.prevention.map((prevention, idx) => (
                                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 list-disc">
                                        {prevention}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                          </div>
                        );
                    })()}
                    <Popover.Arrow className="fill-white dark:fill-gray-800" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              {/* Botón para analizar otra imagen */}
              <motion.button
                onClick={removeImage}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
              >
                Analizar Otra Imagen
              </motion.button>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

