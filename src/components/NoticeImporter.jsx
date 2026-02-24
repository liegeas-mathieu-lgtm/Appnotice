import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { extractTextFromPDF } from '../services/pdfService';
import { analyzeNoticeText } from '../services/aiAnalyzer';
import { supabase } from '../supabaseClient'; // Vérifie que ton client est bien ici

export const NoticeImporter = ({ onImportSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const addLog = (message) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: message }]);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError("Veuillez sélectionner un fichier PDF valide.");
      return;
    }

    setLoading(true);
    setError(null);
    setLogs([]);
    addLog("Fichier reçu : " + file.name);

    try {
      // ÉTAPE 1 : Upload vers Supabase Storage
      addLog("Sauvegarde dans le bucket 'notices'...");
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notices')
        .upload(fileName, file);

      if (uploadError) throw new Error("Erreur Storage : " + uploadError.message);
      addLog("Fichier sauvegardé avec succès.");

      // ÉTAPE 2 : Extraction du texte
      addLog("Extraction du texte technique...");
      const text = await extractTextFromPDF(file);
      if (!text || text.length < 100) throw new Error("Le PDF semble vide ou illisible.");
      addLog(`Texte extrait (${text.length} caractères).`);

      // ÉTAPE 3 : Analyse IA Gemini 3 Flash
      addLog("Analyse intelligente par Gemini 3 Flash...");
      const result = await analyzeNoticeText(text);
      
      addLog("Analyse terminée !");
      
      // On attend 1.5s pour que l'utilisateur voit le succès avant de basculer
      setTimeout(() => {
        onImportSuccess(result);
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message);
      addLog("ERREUR : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
      <div className="text-center mb-8">
        <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="text-blue-600" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Importer une notice</h2>
        <p className="text-gray-500 text-sm mt-1">L'IA Gemini 3 va apprendre les pannes de ce PDF</p>
      </div>

      {/* Zone d'upload */}
      {!loading && (
        <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileText className="text-gray-400 group-hover:text-blue-500 mb-2" size={32} />
            <p className="text-sm text-gray-500 font-medium">Cliquer pour choisir le PDF</p>
          </div>
          <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
        </label>
      )}

      {/* Logs et Progression */}
      {(loading || logs.length > 0) && (
        <div className="mt-6 space-y-3">
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-[10px] sm:text-xs text-green-400 h-40 overflow-y-auto shadow-inner">
            {logs.map((log, i) => (
              <div key={i} className="mb-1 flex gap-2">
                <span className="text-gray-500">[{log.time}]</span>
                <span>{log.msg}</span>
              </div>
            ))}
            {loading && <div className="animate-pulse flex items-center gap-2 mt-2">
              <Loader2 className="animate-spin" size={12} />
              Traitement en cours...
            </div>}
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="shrink-0" size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Succès final */}
      {!loading && logs.some(l => l.msg.includes("terminée")) && (
        <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 font-bold animate-bounce">
          <CheckCircle2 size={24} />
          Chargement du diagnostic...
        </div>
      )}
    </div>
  );
};