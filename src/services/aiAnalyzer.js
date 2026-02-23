import { GoogleGenerativeAI } from "@google/generative-ai";

// On récupère la clé depuis les variables d'environnement de Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const analyzeNoticeText = async (extractedText) => {
  // Sécurité si la clé est manquante
  if (!apiKey) {
    console.error("Clé API manquante ! Configurez VITE_GEMINI_API_KEY");
    return { marque: "Erreur", reference: "Clé API non configurée", pannes: [] };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Tu es un expert en motorisation de portail. Analyse ce texte de notice technique.
    Extraits les informations suivantes au format JSON pur (sans texte avant ou après) :
    {
      "marque": "NOM DE LA MARQUE",
      "reference": "MODELE EXACT",
      "type": "Coulissant ou Battant ou Garage",
      "pannes": [
        {"code": "CODE", "label": "SIGNIFICATION", "solution": "REPARATION"}
      ]
    }
    Si tu ne trouves pas une info, mets "Inconnu".
    Texte de la notice : ${extractedText.substring(0, 20000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Nettoyage du JSON (au cas où Gemini ajoute du Markdown)
    const startJson = text.indexOf('{');
    const endJson = text.lastIndexOf('}');
    
    if (startJson !== -1 && endJson !== -1) {
      text = text.substring(startJson, endJson + 1);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Erreur IA:", error);
    return { 
      marque: "Erreur", 
      reference: "Analyse impossible", 
      pannes: [] 
    };
  }
};