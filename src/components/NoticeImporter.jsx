import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { analyzeNoticeText } from '../services/aiAnalyzer';
import { Loader2, FileText, CheckCircle } from 'lucide-react';

// --- NOUVELLE MÉTHODE LOCALE POUR LE WORKER ---
// On importe le worker comme une URL gérée par Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const NoticeImporter = ({ onImportSuccess }) => {
  const [status, setStatus] = useState('idle'); 
  const [debugText, setDebugText] = useState(''); 
  const [extractedData, setExtractedData] = useState(null);

  const processNotice = async (file) => {
    if (!file) return;

    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    if (!isPDF) {
      alert("Veuillez sélectionner un fichier PDF valide.");
      return;
    }

    setStatus('extracting');
    setDebugText('Initialisation du moteur local...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Chargement du document avec gestion d'erreur spécifique au worker
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        // Ces options aident à la stabilité sur mobile
        disableFontFace: true,
        verbosity: 0 
      });

      const pdf = await loadingTask.promise;
      
      let fullText = "";
      const pagesToRead = Math.min(pdf.numPages, 6); 

      for (let i = 1; i <= pagesToRead; i++) {
        setDebugText(`Extraction du texte : Page ${i}/${pagesToRead}...`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        fullText += strings.join(" ") + "\n";
      }

      if (fullText.trim().length < 20) {
        throw new Error("Le texte extrait est trop court. Est-ce un scan ?");
      }

      setDebugText(`Analyse IA par Gemini...`);
      setStatus('analyzing');

      const result = await analyzeNoticeText(fullText);

      if (result) {
        setExtractedData(result);
        setStatus('success');
      } else {
        throw new Error("L'IA n'a pas renvoyé de résultat valide.");
      }
    } catch (err) {
      console.error(err);
      setDebugText(`ERREUR : ${err.message}`);
      setStatus('idle');
      alert("Problème lors de la lecture : " + err.message);
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
            <span className="font-bold text-gray-700">Importer une notice PDF</span>
            <p className="text-xs text-gray-400 mt-1">L'IA va extraire les données</p>
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
              <CheckCircle size={20} /> Notice analysée !
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl text-sm space-y-2 mb-4">
              <p><strong>Marque :</strong> {extractedData.marque}</p>
              <p><strong>Modèle :</strong> {extractedData.reference}</p>
              <p className="text-blue-700 font-bold">
                {extractedData.pannes?.length || 0} pannes identifiées
              </p>
            </div>
            <button 
              onClick={() => onImportSuccess(extractedData)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg"
            >
              Ajouter au catalogue
            </button>
          </div>
        )}
      </div>

      {debugText && status !== 'success' && (
        <div className="bg-black text-green-500 p-3 rounded-xl text-[10px] font-mono border border-gray-800">
          {debugText}
        </div>
      )}
    </div>
  );
};