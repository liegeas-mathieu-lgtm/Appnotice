import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const Scanner = ({ onScanSuccess }) => {
  const scannerId = "reader";
  const [liveText, setLiveText] = useState(""); // Pour l'affichage en temps réel

  useEffect(() => {
    const config = {
      fps: 20,
      qrbox: { width: 280, height: 150 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
    };

    const scanner = new Html5QrcodeScanner(scannerId, config, false);

    scanner.render(
      (decodedText) => {
        // 1. On affiche ce qu'on voit en temps réel
        setLiveText(decodedText);

        // 2. Nettoyage pour la validation
        const cleanText = decodedText.trim().replace(/[^a-zA-Z0-9]/g, '');
        
        // 3. Si le texte semble valide (plus de 3 caractères), on valide
        if (cleanText.length >= 4) {
          scanner.clear();
          onScanSuccess(cleanText);
        }
      },
      (error) => {
        // Optionnel : on peut aussi afficher les erreurs de lecture partielle ici
        // mais ça risque de clignoter trop vite.
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Erreur nettoyage", err));
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black">
      {/* Zone de lecture temps réel */}
      <div className="absolute top-20 left-0 right-0 px-6 z-10">
        <div className="bg-blue-600/80 backdrop-blur-md border border-blue-400 p-3 rounded-xl shadow-lg">
          <p className="text-blue-100 text-[10px] uppercase font-bold mb-1">Lecture en direct :</p>
          <p className="text-white font-mono text-lg min-h-[1.5rem] break-all">
            {liveText || "En attente de texte..."}
          </p>
        </div>
      </div>

      {/* Caméra */}
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-blue-600 shadow-2xl relative">
        <div id={scannerId}></div>
      </div>
      
      <div className="mt-8 px-6 text-center">
        <p className="text-white font-medium mb-2">Visez la référence</p>
        <div className="flex gap-2 justify-center">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-gray-400 text-xs">Analyse OCR active</p>
        </div>
      </div>

      <style>{`
        #reader { border: none !important; }
        #reader__dashboard { background: white !important; padding: 10px !important; }
        #reader img { display: none; }
        button { 
          background-color: #2563eb !important; 
          color: white !important; 
          border: none !important; 
          padding: 10px 20px !important; 
          border-radius: 10px !important;
          font-weight: bold !important;
        }
      `}</style>
    </div>
  );
};