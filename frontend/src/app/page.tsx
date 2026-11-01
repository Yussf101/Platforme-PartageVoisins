import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div 
        className="relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      >
        {/* Overlay pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl drop-shadow-sm">
            <span className="block">Partagez plus,</span>
            <span className="block text-primary-600">achetez moins.</span>
          </h1>
          <p className="mt-4 max-w-md mx-auto text-base text-gray-700 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl font-medium">
            Rejoignez vos voisins pour prêter, donner ou louer des objets du quotidien. 
            Économisez de l'argent et protégez la planète.
          </p>
          <div className="mt-10 max-w-md mx-auto flex justify-center md:mt-12">
            <div className="rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <Link
                href="/items"
                className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                🔍 Commencer à chercher
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Comment ça marche Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Comment ça marche ?</h2>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Carte 1 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Trouver un objet</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Cherchez ce dont vous avez besoin autour de chez vous grâce à notre carte interactive.
                    </p>
                  </div>
                </div>
              </div>

              {/* Carte 2 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Réserver et discuter</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Envoyez une demande au propriétaire. Une conversation sécurisée s'ouvre automatiquement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Carte 3 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Gagner des badges</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Rendez l'objet et obtenez des scores de confiance. Cumulez des badges selon le CO2 économisé !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
