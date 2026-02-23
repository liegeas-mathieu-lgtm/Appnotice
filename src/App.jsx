import React, { useState } from 'react';
import { Camera, Search, AlertCircle, X, FileText, UploadCloud } from 'lucide-react';
import { Scanner } from './components/Scanner';
import { Diagnostic } from './components/Diagnostic';
import { AddProductForm } from './components/AddProductForm';
import { NoticeImporter } from './components/NoticeImporter'; // Nouveau composant
import { fetchDiagnosticByRef } from './services/diagnostic';

function App() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' ou 'import'
  const [showScanner, setShowScanner] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFoundRef, setNotFoundRef] = useState(null);
  const [manualSearch, setManualSearch] = useState('');

  const handleScan = async (text) => {
    if (!text) return;
    setLoading(true);
    setNotFoundRef(null);
    setShowScanner(false);
    
    try {
      const result = await fetchDiagnosticByRef(text);
      if (result) {
        setData(result);
        setManualSearch('');
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
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 p-4 text-white shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">TechScan Pro</h1>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-lg mx-auto w-full pb-24">
        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-blue-600 font-bold flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              Analyse en cours...
            </div>
          </div>
        )}

        {/* AFFICHAGE DES ONGLETS */}
        {activeTab === 'scan' ? (
          /* SECTION SCANNER ET RECHERCHE */
          <div className="space-y-6">
            {data ? (
              <Diagnostic data={data} onReset={resetAll} />
            ) : notFoundRef ? (
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
              <div className="space-y-6">
                {/* RECHERCHE MANUELLE */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleScan(manualSearch); }}
                  className="relative flex items-center"
                >
                  <input 
                    type="text"
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    placeholder="Référence (ex: ZLJ24, SLX...)"
                    className="w-full p-4 pl-12 bg-white rounded-2xl shadow-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <Search className="absolute left-4 text-gray-400" size={20} />
                  {manualSearch.length > 0 && (
                    <button type="submit" className="absolute right-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm">OK</button>
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
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">Scanner la plaque</h2>
                  <p className="text-gray-500 mb-8 text-sm">Pointez le cadre rouge vers la référence du moteur.</p>
                  <button 
                    onClick={() => setShowScanner(true)}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Ouvrir le scanner
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* SECTION IMPORTATION DE NOTICE (V2) */
          <div className="animate-in slide-in-from-right duration-300">
            <NoticeImporter onImportSuccess={(extractedData) => {
              setActiveTab('scan');
              setData(extractedData);
            }} />
          </div>
        )}
      </main>

      {/* BARRE DE NAVIGATION BASSE */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-40 pb-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => { resetAll(); setActiveTab('scan'); }}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'scan' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Camera size={24} strokeWidth={activeTab === 'scan' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Scanner</span>
        </button>

        <button 
          onClick={() => { resetAll(); setActiveTab('import'); }}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'import' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <UploadCloud size={24} strokeWidth={activeTab === 'import' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Importer</span>
        </button>
      </div>

      {/* MODAL SCANNER PLEIN ÉCRAN */}
      {showScanner && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          <div className="absolute top-6 right-6 z-[70]">
            <button onClick={() => setShowScanner(false)} className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full">
              <X size={28} />
            </button>
          </div>
          <div className="flex-1">
            <Scanner onScanSuccess={handleScan} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;