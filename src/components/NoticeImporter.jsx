import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { analyzeNoticeText } from '../services/aiAnalyzer';
import { Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';

// VERSION CORRIGÉE DU WORKER : Utilisation du format ESM (.mjs) plus stable
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const NoticeImporter = ({ onImportSuccess }) => {
  const [status, setStatus] = useState('idle'); 
  const [debugText, setDebugText] = useState(''); 
  const [extractedData, setExtractedData] = useState(null);

  const processNotice = async (file) => {
    if (!file) return;

    // Vérification de l'extension pour contourner les bugs mobiles
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    if (!isPDF) {
      alert("Veuillez sélectionner un fichier PDF valide.");
      return;
    }

    setStatus('extracting');
    setDebugText('Chargement du moteur de lecture PDF...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Chargement du document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      const pagesToRead = Math.min(pdf.numPages, 6); // On lit les 6 premières pages

      for (let i = 1; i <= pagesToRead; i++) {
        setDebugText(`Lecture de la page ${i}/${pagesToRead}...`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        fullText += strings.join(" ") + "\n";
      }

      // Vérification si le texte est lisible
      if (fullText.trim().length < 20) {
        throw new Error("Impossible de lire le texte. Le PDF est peut-être un scan (image).");
      }

      setDebugText(`Analyse intelligente par l'IA...`);
      setStatus('analyzing');

      // Envoi à l'IA Gemini
      const result = await analyzeNoticeText(fullText);

      if (result && (result.marque || result.pannes)) {
        setExtractedData(result);
        setStatus('success');
      } else {
        throw new Error("L'IA n'a pas trouvé de codes d'erreurs dans ce document.");
      }
    } catch (err) {
      console.error(err);
      // On affiche l'erreur dans la zone de log pour comprendre le blocage
      setDebugText(`ERREUR : ${err.message}`);
      setStatus('idle');
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-center">
        {status === 'idle' && (
          <label className="cursor-pointer block">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-blue-600" />
            </div>
            <span className="font-bold text-gray-700">Choisir une notice PDF</span>
            <p className="text-xs text-gray-400 mt-1">L'IA extraira marque, réf et pannes</p>
            {/* On utilise accept="*" pour forcer l'ouverture du gestionnaire de fichiers sur mobile */}
            <input 
              type="file" 
              className="hidden" 
              accept="*" 
              onChange={(e) => processNotice(e.target.files[0])} 
            />
          </label>
        )}

        {(status === 'extracting' || status === 'analyzing') && (
          <div className="py-4">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
            <p className="text-sm font-medium text-gray-600">{debugText}</p>
          </div>
        )}

        {status === 'success' && extractedData && (
          <div className="text-left animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 text-green-600 mb-4 font-bold">
              <CheckCircle size={20} /> Analyse réussie !
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl text-sm space-y-2 mb-4 border border-blue-100">
              <p><strong>Marque :</strong> {extractedData.marque}</p>
              <p><strong>Modèle :</strong> {extractedData.reference}</p>
              <p><strong>Type :</strong> {extractedData.type}</p>
              <p className="text-blue-600 font-bold italic">
                {extractedData.pannes?.length || 0} pannes détectées
              </p>
            </div>
            <button 
              onClick={() => onImportSuccess(extractedData)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200"
            >
              Importer dans ma base
            </button>
          </div>
        )}
      </div>

      {/* ZONE DE DEBUG VISUELLE */}
      {debugText && status !== 'success' && (
        <div className="bg-gray-900 text-green-400 p-3 rounded-xl text-[10px] font-mono border border-gray-700">
          <span className="opacity-50">Log:</span> {debugText}
        </div>
      )}
    </div>
  );
};