import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const analyzeNoticeText = async (extractedText) => {
  if (!apiKey) return { marque: "Erreur", reference: "Clé manquante", pannes: [] };

  // On tente d'abord la version la plus stable
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `Extraits les infos suivantes en JSON pur :
    { "marque": "", "reference": "", "type": "", "pannes": [{"code": "", "label": "", "solution": ""}] }
    Texte : ${extractedText.substring(0, 10000)}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Erreur avec Flash, essai avec Pro...", error);
    
    // DEUXIÈME CHANCE : Si Flash échoue, on tente Gemini Pro
    try {
      const backupModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await backupModel.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, "").trim();
      return JSON.parse(text);
    } catch (err2) {
      console.error("Échec total IA:", err2);
      return { marque: "Erreur IA", reference: "Problème de quota ou modèle", pannes: [] };
    }
  }
};