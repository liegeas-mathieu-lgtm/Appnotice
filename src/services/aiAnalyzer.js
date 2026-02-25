import { GoogleGenAI } from "@google/genai";

// Récupération de la clé depuis les variables d'environnement
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialisation du SDK Gemini 3 (Version 2026)
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeNoticeText = async (extractedText) => {
  if (!API_KEY) {
    throw new Error("Clé API manquante dans Vercel (VITE_GEMINI_API_KEY)");
  }

  try {
    const response = await ai.models.generateContent({
      // Utilisation du modèle spécifique 2026
      model: "gemini-3-flash-preview", 
      contents: `Tu es un expert en dépannage d'automatismes. 
Analyse cette notice technique et extrait les informations structurées pour une base de données.

CONSIGNES DE FORMATAGE :
1. "brand" : Le nom de la marque.
2. "model" : Le nom du modèle précis.
3. "category" : Type d'appareil (Portail, Garage, etc.).
4. "error_codes" : Un tableau contenant TOUTES les pannes trouvées avec :
   - "code" : Le code erreur ou symptôme (ex: E1, LED clignote 2 fois).
   - "description" : Ce que signifie l'erreur.
   - "solution_particulier" : Action simple pour l'utilisateur final.
   - "solution_pro" : Action technique pour le dépanneur (mesures, réglages).

RENVOIE UNIQUEMENT UN OBJET JSON PUR.

Texte : ${extractedText.substring(0, 25000)}`,
      config: {
        thinkingLevel: "medium", 
        temperature: 0.1, // Plus bas pour plus de précision sur les codes
      }
    });

    // Récupération du texte de réponse
    const resultText = response.text;

    // Nettoyage rigoureux pour ne garder que le JSON (enlève les balises ```json)
    const cleanJson = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedData = JSON.parse(cleanJson);

    // Normalisation pour NoticeImporter.jsx
    // On s'assure que si l'IA utilise d'autres noms, on les remplace par ceux attendus
    return {
      brand: parsedData.brand || parsedData.marque,
      model: parsedData.model || parsedData.reference,
      category: parsedData.category || parsedData.type || "Automatisme",
      error_codes: parsedData.error_codes || parsedData.pannes || []
    };

  } catch (error) {
    console.error("Erreur lors de l'appel à Gemini 3 :", error);
    throw new Error(`Erreur Gemini 3 : ${error.message}`);
  }
};