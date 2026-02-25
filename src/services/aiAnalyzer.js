import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeNoticeText = async (extractedText) => {
  if (!API_KEY) throw new Error("Clé API manquante");

  try {
    // Utilisation du nom de modèle complet pour éviter la 404
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Extraire les pannes au format JSON pur.
    Format : {"brand": "...", "model": "...", "category": "...", "error_codes": [{"code": "...", "description": "...", "solution_particulier": "...", "solution_pro": "..."}]}
    Texte : ${extractedText.substring(0, 20000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Détail Erreur Gemini:", error);
    throw new Error(`Erreur Gemini : ${error.message}`);
  }
};