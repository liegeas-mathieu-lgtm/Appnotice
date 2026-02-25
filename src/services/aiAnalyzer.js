import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeNoticeText = async (extractedText) => {
  if (!API_KEY) throw new Error("Clé API manquante");

  try {
    // Utilisation du nom exact selon la mise à jour du 21 janvier 2026
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `Tu es un expert en maintenance. Analyse ce texte et renvoie un JSON pur.
    Format : {"brand": "...", "model": "...", "category": "...", "error_codes": [{"code": "...", "description": "...", "solution_particulier": "...", "solution_pro": "..."}]}
    
    Texte : ${extractedText.substring(0, 25000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Nettoyage Markdown
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);

  } catch (error) {
    console.error("Détail Erreur Gemini 3:", error);
    // On affiche l'erreur spécifique pour savoir si c'est encore un problème de nom
    throw new Error(`Erreur Gemini 3 : ${error.message}`);
  }
};