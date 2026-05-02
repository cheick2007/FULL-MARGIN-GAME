// Import du composant principal du jeu (TradingGame) depuis le dossier components
import TradingGame from '@/components/TradingGame';

// Composant par défaut de la page d'accueil (Home)
// C'est le point d'entrée de notre page unique
export default function Home() {
  return (
    // Balise principale <main> :
    // - w-screen h-screen : Prend toute la largeur et hauteur de l'écran
    // - bg-[#0f0e24] : Couleur de fond sombre (bleu très foncé) pour éviter les flashs blancs
    // - overflow-hidden : Empêche le défilement (scroll) de la page pour une expérience "app"
    <main className="w-screen h-screen bg-[#0f0e24] overflow-hidden">
      {/* Intégration du jeu de trading */}
      <TradingGame />
    </main>
  );
}
