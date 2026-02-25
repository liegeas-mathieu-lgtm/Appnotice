import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeNoticeText = async (extractedText) => {
  if (!API_KEY) throw new Error("Clé API manquante dans les variables d'environnement");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Tu es un expert en dépannage d'automatismes. 
    Analyse cette notice et extrait les pannes au format JSON pur.
    
    Format : {"brand": "...", "model": "...", "category": "...", "error_codes": [{"code": "...", "description": "...", "solution_particulier": "...", "solution_pro": "..."}]}
    
    Texte : ${extractedText.substring(0, 20000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // On nettoie les balises markdown
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Texte reçu de Gemini (non-JSON):", text);
      throw new Error("L'IA n'a pas renvoyé un format JSON valide.");
    }

  } catch (error) {
    // ICI : On renvoie l'erreur réelle de Google pour la voir dans tes logs
    console.error("Détail Erreur Gemini:", error);
    throw new Error(`Erreur Gemini : ${error.message}`);
  }
};