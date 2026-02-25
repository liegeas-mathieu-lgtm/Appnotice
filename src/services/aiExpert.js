import { findNoticePDF } from './searchService';
import { extractTextFromPDF } from './pdfService';
import { analyzeNoticeText } from './aiAnalyzer';

export const learnNewModel = async (reference) => {
  try {
    // 1. Trouver l'URL du PDF
    const pdfUrl = await findNoticePDF(reference);

   // Utilitaire pour télécharger un PDF malgré le blocage CORS
const downloadPDF = async (url) => {
  // On utilise un proxy public pour le développement (à remplacer en prod)
  const proxy = "https://corsproxy.io/?"; 
  const response = await fetch(proxy + encodeURIComponent(url));
  
  if (!response.ok) throw new Error("Impossible de récupérer le fichier PDF");
  
  const blob = await response.blob();
  return new File([blob], "notice_auto.pdf", { type: "application/pdf" });
};

    // 3. Extraire le texte (utilise ton pdfService existant)
    const text = await extractTextFromPDF(file);

    // 4. Analyser avec Gemini
    const structuredData = await analyzeNoticeText(text);

    // 5. Ici, tu appelles ta logique de sauvegarde Supabase
    // (Comme dans ton NoticeImporter.jsx)
    
    return structuredData;
  } catch (error) {
    console.error("Échec de l'apprentissage automatique:", error);
    throw error;
  }
};