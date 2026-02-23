import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("TA_CLE_ICI");

export const analyzeNoticeText = async (extractedText) => {
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
    Texte de la notice : ${extractedText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Nettoyage ultra-robuste du Markdown que Gemini ajoute parfois
    text = text.replace(/```json/g, "")
               .replace(/```/g, "")
               .trim();

    console.log("Texte nettoyé envoyé au parseur :", text); // Pour vérifier dans la console
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Erreur IA (Analyse ou Parsing):", error);
    // On retourne un objet vide structuré pour éviter de faire planter le composant
    return { marque: "Erreur", reference: "Analyse échouée", pannes: [] };
  }
};