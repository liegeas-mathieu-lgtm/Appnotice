import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeNoticeText = async (extractedText) => {
  if (!API_KEY) throw new Error("Clé API manquante");

  try {
    // Appel du modèle Gemini 2.0 Flash (la version ultra-rapide de nouvelle génération)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Tu es un expert en maintenance. Analyse ce texte et renvoie un JSON pur.
    Format : {"brand": "...", "model": "...", "category": "...", "error_codes": [{"code": "...", "description": "...", "solution_particulier": "...", "solution_pro": "..."}]}
    
    Texte : ${extractedText.substring(0, 20000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Nettoyage et parsing
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);

  } catch (error) {
    console.error("Détail Erreur Gemini:", error);
    throw new Error(`Erreur avec Gemini 2.0 : ${error.message}`);
  }
};