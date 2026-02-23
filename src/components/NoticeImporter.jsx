import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { analyzeNoticeText } from '../services/aiAnalyzer';
import { Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';

// IMPORTANT : Configuration du Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const NoticeImporter = ({ onImportSuccess }) => {
  const [status, setStatus] = useState('idle'); // idle, extracting, analyzing, success
  const [debugText, setDebugText] = useState(''); // Pour voir ce qui est extrait
  const [extractedData, setExtractedData] = useState(null);

  const processNotice = async (file) => {
    setStatus('extracting');
    setDebugText('Lecture du fichier...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      // On lit les 5 premières pages (souvent suffisant pour les erreurs)
      for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        fullText += strings.join(" ") + "\n";
        setDebugText(`Extraction page ${i}/${Math.min(pdf.numPages, 5)}...`);
      }

      if (fullText.trim().length < 10) {
        throw new Error("Le PDF semble vide ou est une image (scan). L'extraction de texte a échoué.");
      }

      setDebugText(`Analyse par l'IA en cours... (${fullText.substring(0, 100)}...)`);
      setStatus('analyzing');

      // 2. Appel à l'IA Gemini
      const result = await analyzeNoticeText(fullText);

      if (result) {
        setExtractedData(result);
        setStatus('success');
      } else {
        throw new Error("L'IA n'a pas pu structurer les données.");
      }
    } catch (err) {
      console.error(err);
      setDebugText(`Erreur : ${err.message}`);
      setStatus('idle');
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
            <input type="file" className="hidden" accept="*" onChange={(e) => processNotice(e.target.files[0])} />
          </label>
        )}

        {(status === 'extracting' || status === 'analyzing') && (
          <div className="py-4">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
            <p className="text-sm font-medium text-gray-600">{debugText}</p>
          </div>
        )}

        {status === 'success' && extractedData && (
          <div className="text-left animate-in fade-in">
            <div className="flex items-center gap-2 text-green-600 mb-4 font-bold">
              <CheckCircle size={20} /> Analyse terminée !
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl text-sm space-y-2 mb-4">
              <p><strong>Marque :</strong> {extractedData.marque}</p>
              <p><strong>Réf :</strong> {extractedData.reference}</p>
              <p><strong>Pannes trouvées :</strong> {extractedData.pannes?.length || 0}</p>
            </div>
            <button 
              onClick={() => onImportSuccess(extractedData)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
            >
              Valider et Enregistrer
            </button>
          </div>
        )}
      </div>

      {/* ZONE DE LOGS (Optionnel pour voir si ça avance) */}
      {debugText && status !== 'success' && (
        <div className="bg-gray-800 text-green-400 p-3 rounded-xl text-[10px] font-mono overflow-hidden">
          {debugText}
        </div>
      )}
    </div>
  );
};