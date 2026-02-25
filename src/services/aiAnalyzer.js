// On utilise UNIQUEMENT le SDK officiel stable
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeNoticeText = async (extractedText) => {
  if (!API_KEY) throw new Error("Clé API manquante");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Tu es un expert en dépannage d'automatismes. 
      Analyse cette notice technique et extrait les informations au format JSON.

      FORMAT :
      {
        "brand": "Marque",
        "model": "Modèle",
        "category": "Type (Portail, Garage, etc.)",
        "error_codes": [
          {
            "code": "Code",
            "description": "Signification",
            "solution_particulier": "Action client",
            "solution_pro": "Action technicien"
          }
        ]
      }

      Texte : ${extractedText.substring(0, 25000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Erreur Gemini:", error);
    throw new Error("L'IA n'a pas pu analyser le document.");
  }
};