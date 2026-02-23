import { GoogleGenAI } from "@google/genai";

// Récupération de la clé depuis les variables d'environnement de Vercel
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialisation du nouveau SDK Gemini 3
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeNoticeText = async (extractedText) => {
  if (!API_KEY) {
    throw new Error("Clé API manquante dans Vercel (VITE_GEMINI_API_KEY)");
  }

  try {
    const response = await ai.models.generateContent({
      // Utilisation du modèle spécifique 2026
      model: "gemini-3-flash-preview", 
      // Dans aiAnalyzer.js, modifie le texte envoyé à Gemini :
contents: `Tu es un expert en dépannage de portails motorisés. 
Analyse attentivement cette notice technique. 
1. Identifie la marque et le modèle.
2. Cherche tous les codes erreurs, les clignotements de LED ou les tableaux de diagnostic.
3. Renvoie un JSON pur. Si tu ne trouves pas de codes précis, liste les opérations d'entretien ou de sécurité mentionnées.

Format : {"marque": "...", "reference": "...", "type": "...", "pannes": [{"code": "...", "label": "...", "solution": "..."}]}

Texte : ${extractedText.substring(0, 25000)}`,
      config: {
        // Activation du nouveau moteur de réflexion de Gemini 3
        thinkingLevel: "medium", 
        temperature: 0.2,
      }
    });

    // Dans le nouveau SDK, la réponse se récupère ainsi
    const resultText = response.text;

    // Nettoyage pour ne garder que le JSON
    const cleanJson = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Erreur lors de l'appel à Gemini 3 :", error);
    throw new Error(`Erreur Gemini 3 : ${error.message}`);
  }
};