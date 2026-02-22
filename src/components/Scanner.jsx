import React, { useEffect } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

export const Scanner = ({ onScanSuccess }) => {
  const scannerId = "reader";

  useEffect(() => {
    // Configuration optimisée
    const config = {
      fps: 20, // Plus d'images par seconde pour plus de réactivité
      qrbox: { width: 280, height: 150 }, // Zone de scan rectangulaire (mieux pour du texte)
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true, // Ajoute un bouton lampe de poche si dispo
    };

    const scanner = new Html5QrcodeScanner(scannerId, config, false);

    scanner.render(
      (decodedText) => {
        // Nettoyage rapide du texte scanné
        const cleanText = decodedText.trim().replace(/[^a-zA-Z0-9]/g, '');
        if (cleanText.length > 3) {
          scanner.clear(); // Arrête le scan dès qu'on a un truc sérieux
          onScanSuccess(cleanText);
        }
      },
      (error) => {
        // On ignore les erreurs de lecture continue pour ne pas polluer la console
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Erreur nettoyage scanner", err));
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-blue-600 shadow-2xl">
        <div id={scannerId}></div>
      </div>
      
      <div className="mt-8 px-6 text-center">
        <p className="text-white font-medium mb-2">Placez la référence dans le cadre</p>
        <p className="text-gray-400 text-xs">Évitez les reflets et restez bien parallèle à la plaque</p>
      </div>

      {/* Style CSS pour masquer les éléments inutiles de la librairie et styliser le cadre */}
      <style>{`
        #reader { border: none !important; }
        #reader__dashboard { background: white !important; padding: 10px !important; }
        #reader__camera_selection { padding: 8px; border-radius: 8px; margin-bottom: 10px; width: 100%; }
        #reader img { display: none; }
        #reader__status_span { font-size: 12px; color: #666; }
        button { 
          background-color: #2563eb !important; 
          color: white !important; 
          border: none !important; 
          padding: 10px 20px !important; 
          border-radius: 10px !important;
          font-weight: bold !important;
          margin: 5px !important;
        }
      `}</style>
    </div>
  );
};