import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBAQBVV_-lcre9olKJre4l3xfdyvNZgSiY");

export const analyzeNoticeText = async (extractedText) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Tu es un expert en motorisation de portail. Analyse ce texte de notice technique.
    Extraits les informations suivantes au format JSON pur :
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
    const text = result.response.text().replace(/```json|```/g, "");
    return JSON.parse(text);
  } catch (error) {
    console.error("Erreur IA:", error);
    return null;
  }
};