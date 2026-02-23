import React from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export const NoticeImporter = ({ onImportSuccess }) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100 animate-in fade-in duration-500">
      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <UploadCloud className="text-green-600" size={40} />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Importer une notice</h2>
      <p className="text-gray-500 mb-8 text-sm">
        Sélectionnez un PDF pour que l'IA remplisse automatiquement la fiche moteur.
      </p>

      <label className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:bg-green-700 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center gap-1">
  <div className="flex items-center gap-2">
    <FileText size={20} />
    <span>Sélectionner la notice</span>
  </div>
  <span className="text-[10px] opacity-80 uppercase tracking-tighter">(PDF uniquement)</span>
  <input 
    type="file" 
    className="hidden" 
    accept="application/pdf"
    onChange={(e) => processNotice(e.target.files[0])} 
  />
</label>
    </div>
  );
};