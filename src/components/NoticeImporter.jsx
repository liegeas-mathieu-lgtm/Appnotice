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

      <label className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:bg-green-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2">
        <FileText size={20} />
        Choisir le fichier PDF
       <input 
  type="file" 
  className="hidden" 
  /* On enlève tout ce qui ressemble à une image pour forcer le sélecteur de documents */
  accept="application/pdf"
  /* Désactive toute tentative d'ouverture directe de la caméra */
  capture={false} 
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérification de sécurité pour être sûr que c'est un PDF
      if (file.type !== "application/pdf") {
        alert("Veuillez sélectionner un fichier PDF uniquement.");
        return;
      }
      processNotice(file);
    }
  }} 
/>
      </label>
    </div>
  );
};