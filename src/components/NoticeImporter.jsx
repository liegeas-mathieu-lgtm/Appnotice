import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { analyzeNoticeText } from '../services/aiAnalyzer';
import { Loader2, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

// Configuration du Worker via CDN stable (Legacy pour compatibilité mobile)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

export const NoticeImporter = ({ onImportSuccess }) => {
  const [status, setStatus] = useState('idle'); 
  const [debugLog, setDebugLog] = useState(''); 
  const [extractedData, setExtractedData] = useState(null);

  const addLog = (msg) => {
    setDebugLog(prev => prev + "\n> " + msg);
  };

  const processNotice = async (file) => {
    if (!file) return;
    
    setDebugLog("--- Nouvelle Analyse ---");
    setStatus('extracting');
    addLog(`Fichier reçu : ${file.name}`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      addLog("Chargement du moteur PDF...");
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        disableFontFace: true 
      });
      
      const pdf = await loadingTask.promise;
      addLog(`PDF chargé : ${pdf.numPages} pages.`);
      
      let fullText = "";
      const maxPages = Math.min(pdf.numPages, 6);

      for (let i = 1; i <= maxPages; i++) {
        addLog(`Lecture page ${i}...`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(" ") + " ";
      }

      if (fullText.trim().length < 50) {
        throw new Error("Le PDF semble vide ou est une image scannée.");
      }

      addLog("Envoi à l'IA Gemini...");
      setStatus('analyzing');

      const result = await analyzeNoticeText(fullText);
      
      setExtractedData(result);
      setStatus('success');
      addLog("Analyse terminée avec succès !");

    } catch (err) {
      console.error(err);
      addLog(`ERREUR CRITIQUE : ${err.message}`);
      setStatus('idle');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-center">
        {status === 'idle' && (
          <label className="cursor-pointer block">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-blue-600" />
            </div>
            <span className="font-bold text-gray-800">Importer une notice PDF</span>
            <input 
              type="file" 
              className="hidden" 
              accept="*" 
              onChange={(e) => processNotice(e.target.files[0])} 
            />
          </label>
        )}

        {(status === 'extracting' || status === 'analyzing') && (
          <div className="py-8">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="font-bold text-gray-700 animate-pulse">
              {status === 'extracting' ? 'Lecture du document...' : 'Analyse IA en cours...'}
            </p>
          </div>
        )}

        {status === 'success' && extractedData && (
          <div className="text-left space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <CheckCircle size={24} /> Notice décryptée
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-sm"><strong>Marque :</strong> {extractedData.marque}</p>
              <p className="text-sm"><strong>Modèle :</strong> {extractedData.reference}</p>
              <p className="text-blue-600 font-bold mt-2">{extractedData.pannes?.length || 0} pannes trouvées</p>
            </div>
            <button 
              onClick={() => onImportSuccess(extractedData)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold"
            >
              Ajouter au Catalogue
            </button>
          </div>
        )}
      </div>

      {/* ZONE DE DEBUG LOGS */}
      <div className="mt-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 flex items-center gap-1">
          <AlertTriangle size={10} /> Journal Système (Debug)
        </p>
        <div className="bg-black text-green-400 p-4 rounded-2xl text-[11px] font-mono h-48 overflow-y-auto shadow-inner border border-gray-800">
          {debugLog.split('\n').map((line, i) => (
            <div key={i} className="mb-1">{line}</div>
          ))}
          {status === 'analyzing' && <div className="animate-pulse">_</div>}
        </div>
      </div>
    </div>
  );
};