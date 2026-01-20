import TradingGame from '@/components/TradingGame';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0e24] text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-[#161530] border-b border-gray-800">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">⚡</span>
          </div>
          <span className="text-xl font-bold tracking-tight">FullMargin</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#" className="flex px-4 py-2 bg-[#6d28d9] text-white rounded-full hover:bg-[#5b21b6] transition">Accueil</a>
          <a href="#" className="hover:text-white transition">À propos</a>
          <a href="#" className="hover:text-white transition">Tarifs</a>
          <a href="#" className="hover:text-white transition">Mes outils ▾</a>
          <a href="#" className="hover:text-white transition">Boutiques ▾</a>
          <a href="#" className="hover:text-white transition">Communautés ▾</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-white">🔍</button>
          <button className="p-2 text-gray-400 hover:text-white">🔔</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">

        <div className="text-center mb-10 w-full max-w-4xl">
          <span className="inline-block px-3 py-1 bg-[#1e1d3d] text-xs font-semibold rounded-full mb-4 border border-purple-500/30">L'excellence</span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Full Margin — <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Le jeu du trader</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Entraînez vos réflexes psychologiques. Évitez les banques, parcourez les bougies, et ne vous faites pas liquider.
          </p>
        </div>

        {/* Game Container */}
        <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(109,40,217,0.3)] border border-gray-800 bg-[#161530]">
          <TradingGame />
        </div>

        <div className="mt-12 text-center">
          <button className="px-8 py-4 bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold rounded-full text-lg shadow-lg hover:shadow-purple-500/50 transition transform hover:-translate-y-1">
            Commencer maintenant
          </button>
        </div>

      </div>
    </main>
  );
}
