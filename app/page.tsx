import Classifier from "@/components/Classifier";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center py-8">
      {/* Fondo animado con gradientes */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 animated-gradient opacity-20 dark:opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        
        {/* Partículas flotantes decorativas */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-element" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-element" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-element" style={{ animationDelay: '4s' }} />
        
        {/* Efectos de brillo animados */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10 w-full">
        <Classifier />
      </div>
    </main>
  );
}

