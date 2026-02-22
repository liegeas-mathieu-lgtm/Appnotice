import React, { useState } from 'react';
import { Camera, Search, AlertCircle } from 'lucide-react';
import { Scanner } from './components/Scanner';
import { Diagnostic } from './components/Diagnostic';
import { AddProductForm } from './components/AddProductForm'; // Import du nouveau composant
import { fetchDiagnosticByRef } from './services/diagnostic';

function App() {
  const [showScanner, setShowScanner] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFoundRef, setNotFoundRef] = useState(null); // Stocke la réf inconnue

  const handleScan = async (text) => {
    setLoading(true);
    setNotFoundRef(null); // On réinitialise si on fait une nouvelle recherche
    try {
      const result = await fetchDiagnosticByRef(text);
      console.log("Données reçues de Supabase :", result);
      
      if (result) {
        setData(result);
      } else {
        // Au lieu d'une simple alerte, on active le formulaire d'ajout
        setNotFoundRef(text);
      }
    } catch (e) {
      console.error("Détail de l'erreur :", e);
      alert("Erreur de connexion : " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setData(null);
    setNotFoundRef(null);
    setShowScanner(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-600 p-4 text-white shadow-md">
        <h1 className="text-xl font-bold text-center">TechScan Web</h1>
      </nav>

      <main className="p-6 max-w-lg mx-auto">
        {loading && <div className="text-center py-10 text-blue-600 font-semibold">Analyse en cours...</div>}

        {/* 1. Affichage du Diagnostic si trouvé */}
        {data ? (
          <Diagnostic data={data} onReset={resetAll} />
        ) : (
          <>
            {/* 2. Affichage du formulaire d'ajout si NON trouvé */}
            {notFoundRef ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 flex items-center gap-3 text-orange-800">
                  <AlertCircle size={24} />
                  <p className="text-sm font-medium">Modèle "{notFoundRef}" inconnu dans la base.</p>
                </div>
                
                <AddProductForm 
                  initialRef={notFoundRef} 
                  onCancel={resetAll}
                  onComplete={(newProd) => {
                    setNotFoundRef(null);
                    setData(newProd); // Affiche la fiche du produit créé
                  }}
                />
              </div>
            ) : (
              /* 3. Menu principal (Scanner / Test) */
              <div className="flex flex-col items-center mt-10">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center w-full">
                  <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera className="text-blue-600" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Scanner une notice</h2>
                  <p className="text-gray-500 mb-8">Pointez votre caméra vers la plaque signalétique ou l'écran LCD.</p>
                  
                  <button 
                    onClick={() => setShowScanner(true)}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition"
                  >
                    Ouvrir la caméra
                  </button>

                  <button 
                    onClick={() => handleScan('MODELE_INCONNU_123')}
                    className="w-full mt-6 text-gray-400 text-sm hover:text-blue-600 transition"
                  >
                    Tester l'ajout d'un nouveau produit
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showScanner && <Scanner onScanSuccess={handleScan} />}
    </div>
  );
}

export default App;