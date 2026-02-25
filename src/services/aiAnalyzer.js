const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// On utilise l'URL directe de l'API Google (modèle Gemini 3 Flash de 2026)
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

export const analyzeNoticeText = async (extractedText) => {
  if (!API_KEY) throw new Error("Clé API manquante");

  const prompt = `Tu es un expert en maintenance. Analyse ce texte de notice et renvoie UNIQUEMENT un JSON pur.
  Format : {"brand": "...", "model": "...", "category": "...", "error_codes": [{"code": "...", "description": "...", "solution_particulier": "...", "solution_pro": "..."}]}
  Texte : ${extractedText.substring(0, 20000)}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Erreur Analyse:", error);
    throw new Error(`Erreur : ${error.message}`);
  }
};