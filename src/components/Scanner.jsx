import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const Scanner = ({ onScanSuccess, onScanError }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 150 }, // Format rectangulaire pour les plaques
    });

    scanner.render(onScanSuccess, onScanError);

    return () => scanner.clear();
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      <div id="reader" className="w-full max-w-md bg-white rounded-lg overflow-hidden"></div>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-6 bg-red-500 text-white px-6 py-2 rounded-full"
      >
        Annuler
      </button>
    </div>
  );
};