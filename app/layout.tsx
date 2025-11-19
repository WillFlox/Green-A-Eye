import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Green A-Eye | Identificador de Plantas y Enfermedades",
  description: "Identifica la planta y detecta enfermedades en hojas usando inteligencia artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

