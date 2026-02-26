const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// UTILISE CE MODÈLE PRÉCIS (Le plus compatible)
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const cleanGeminiResponse = (text) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const fetchAIResponse = async (userQuery, history) => {
  const prompt = `Tu es TechScan Expert. Analyse : "${userQuery}". 
  Réponds UNIQUEMENT en JSON : {"text": "ta réponse", "detectedReference": "la_ref_ou_null"}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    // LOG DE SÉCURITÉ : Affiche l'erreur réelle de Google dans ta console
    if (data.error) {
      console.error("❌ ERREUR API GOOGLE :", data.error.message);
      return { text: "Erreur de configuration API : " + data.error.message, detectedReference: null };
    }

    // VÉRIFICATION DES CANDIDATS
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("⚠️ RÉPONSE INCOMPLÈTE :", data);
      return { text: "L'IA n'est pas disponible pour le moment.", detectedReference: null };
    }

    const rawText = data.candidates[0].content.parts[0].text;
    return JSON.parse(cleanGeminiResponse(rawText));

  } catch (err) {
    console.error("🔥 ERREUR CRITIQUE :", err);
    return { text: "Désolé, une erreur est survenue.", detectedReference: null };
  }
};