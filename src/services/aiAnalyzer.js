import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const analyzeNoticeText = async (extractedText) => {
  if (!apiKey) {
    throw new Error("La clé API (VITE_GEMINI_API_KEY) n'est pas configurée dans Vercel.");
  }

  // Utilisation de gemini-1.5-flash (le plus rapide et compatible)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Tu es un expert en motorisation de portail. Analyse ce texte de notice technique.
    Extraits les informations suivantes au format JSON pur uniquement :
    {
      "marque": "NOM DE LA MARQUE",
      "reference": "MODELE EXACT",
      "type": "Coulissant ou Battant ou Garage",
      "pannes": [
        {"code": "CODE", "label": "SIGNIFICATION", "solution": "REPARATION"}
      ]
    }
    Texte de la notice : ${extractedText.substring(0, 15000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Nettoyage pour ne garder que le JSON
    const startJson = text.indexOf('{');
    const endJson = text.lastIndexOf('}');
    if (startJson !== -1 && endJson !== -1) {
      text = text.substring(startJson, endJson + 1);
    }

    return JSON.parse(text);
  } catch (error) {
    // On propage l'erreur réelle pour qu'elle soit affichée dans le Log de l'interface
    throw new Error(`Google AI Error: ${error.message}`);
  }
};