import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const analyzeNoticeText = async (extractedText) => {
  if (!apiKey) return { marque: "Erreur", reference: "Clé manquante", pannes: [] };

  // On utilise "gemini-1.5-flash" qui est le plus flexible
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    // On baisse les filtres de sécurité pour éviter les faux positifs sur des termes techniques
    generationConfig: {
      temperature: 0.1, // Plus précis, moins créatif
    }
  });

  // Prompt ultra-court pour économiser les jetons (tokens)
  const prompt = `Extrait les pannes de ce texte technique. 
    Réponds UNIQUEMENT en JSON :
    { "marque": "...", "reference": "...", "type": "...", "pannes": [{"code": "...", "label": "...", "solution": "..."}] }
    Texte : ${extractedText.substring(0, 8000)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    // Nettoyage manuel si Gemini bave
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const cleanJson = text.substring(jsonStart, jsonEnd + 1);
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Erreur IA:", error);
    
    // Si c'est un problème de quota, on prévient l'utilisateur
    if (error.message?.includes("429")) {
      return { marque: "Trop de requêtes", reference: "Attendre 1 min", pannes: [] };
    }
    
    return { marque: "Erreur IA", reference: error.message?.substring(0, 30), pannes: [] };
  }
};