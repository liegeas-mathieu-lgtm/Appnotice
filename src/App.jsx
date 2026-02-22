import React, { useState } from 'react';
import { Camera, Search, AlertCircle, X } from 'lucide-react';
import { Scanner } from './components/Scanner';
import { Diagnostic } from './components/Diagnostic';
import { AddProductForm } from './components/AddProductForm';
import { fetchDiagnosticByRef } from './services/diagnostic';

function App() {
  const [showScanner, setShowScanner] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFoundRef, setNotFoundRef] = useState(null);
  const [manualSearch, setManualSearch] = useState(''); // État pour la barre de recherche

  const handleScan = async (text) => {
    if (!text) return;
    setLoading(true);
    setNotFoundRef(null);
    setShowScanner(false); // On ferme le scanner dès qu'on a un texte
    
    try {
      const result = await fetchDiagnosticByRef(text);
      if (result) {
        setData(result);
        setManualSearch(''); // On vide la recherche si trouvé
      } else {
        setNotFoundRef(text);
      }
    } catch (e) {
      console.error("Erreur :", e);
      alert("Erreur de connexion : " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setData(null);
    setNotFoundRef(null);
    setShowScanner(false);
    setManualSearch('');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-600 p-4 text-white shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">TechScan Web</h1>
      </nav>

      <main className="p-6 max-w-lg mx-auto">
        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-blue-600 font-bold flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              Recherche en cours...
            </div>
          </div>
        )}

        {/* 1. Affichage du Diagnostic */}
        {data ? (
          <Diagnostic data={data} onReset={resetAll} />
        ) : (
          <>
            {/* 2. Formulaire d'ajout si non trouvé */}
            {notFoundRef ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 flex items-center gap-3 text-orange-800">
                  <AlertCircle size={24} />
                  <p className="text-sm font-medium">Modèle "{notFoundRef}" inconnu.</p>
                </div>
                <AddProductForm 
                  initialRef={notFoundRef} 
                  onCancel={resetAll}
                  onComplete={(newProd) => {
                    setNotFoundRef(null);
                    setData(newProd);
                  }}
                />
              </div>
            ) : (
              /* 3. Menu principal : Recherche + Caméra */
              <div className="space-y-6">
                
                {/* BARRE DE RECHERCHE MANUELLE */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleScan(manualSearch); }}
                  className="relative flex items-center"
                >
                  <input 
                    type="text"
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    placeholder="Taper une référence (ex: ZLJ24)"
                    className="w-full p-4 pl-12 bg-white rounded-2xl shadow-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                  <Search className="absolute left-4 text-gray-400" size={20} />
                  {manualSearch.length > 0 && (
                    <button 
                      type="submit"
                      className="absolute right-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
                    >
                      OK
                    </button>
                  )}
                </form>

                <div className="flex items-center gap-4 text-gray-300">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs font-bold text-gray-400">OU</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* BOUTON CAMERA */}
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100">
                  <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera className="text-blue-600" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">Scanner une plaque</h2>
                  <p className="text-gray-500 mb-8 text-sm">Pointez votre caméra vers la référence imprimée sur le moteur.</p>
                  
                  <button 
                    onClick={() => setShowScanner(true)}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Ouvrir la caméra
                  </button>
                </div>

                <p className="text-center text-gray-400 text-xs mt-4">
                  Note : L'écriture manuscrite n'est pas supportée. Utilisez la recherche manuelle.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL SCANNER (Plein écran pour faciliter le scan) */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="p-4 flex justify-end">
            <button onClick={() => setShowScanner(false)} className="text-white p-2">
              <X size={30} />
            </button>
          </div>
          <div className="flex-1 relative">
            <Scanner onScanSuccess={handleScan} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;