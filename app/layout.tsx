// Importation du type Metadata de Next.js pour le SEO (titre, description...)
import type { Metadata } from "next";
// Importation des polices Google (Geist et Geist Mono) optimisées par Next.js
import { Geist, Geist_Mono } from "next/font/google";
// Importation du fichier de styles globaux (CSS)
import "./globals.css";

// Configuration de la police sans-serif (Geist Sans)
const geistSans = Geist({
  variable: "--font-geist-sans", // Nom de la variable CSS personnalisée
  subsets: ["latin"], // Sous-ensemble de caractères (latin)
});

// Configuration de la police monospace (Geist Mono)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // Nom de la variable CSS personnalisée
  subsets: ["latin"], // Sous-ensemble de caractères (latin)
});

// Métadonnées de l'application (affichées dans les onglets du navigateur et moteurs de recherche)
export const metadata: Metadata = {
  title: "TP HIT | Trading Protocol Survival", 
  description: "Survivez à la haute volatilité du marché. Le jeu de trading hardcore ultime.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TP HIT",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

// Composant Racine (RootLayout) qui enveloppe toutes les pages de l'application
export default function RootLayout({
  children, // Les composants enfants (ici, notre page.tsx)
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Structure HTML de base
    <html lang="en">
      {/* 
        Le corps (body) de la page :
        - Applique les variables de police (geistSans, geistMono)
        - antialiased : Lissage des polices pour un meilleur rendu
        - overflow-hidden : Empêche le scroll global au niveau du body
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
      >
        {/* Affiche le contenu de la page active */}
        {children}
      </body>
    </html>
  );
}
