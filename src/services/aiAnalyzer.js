const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// On utilise le modèle stable 1.5-flash
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const cleanGeminiResponse = (text) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// --- FONCTION 1 : CHAT IA ---
export const fetchAIResponse = async (userQuery, history) => {
  const prompt = `Tu es TechScan Expert. Réponds au format JSON: {"text": "...", "detectedReference": "..."}. Message: ${userQuery}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const rawText = data.candidates[0].content.parts[0].text;
    return JSON.parse(cleanGeminiResponse(rawText));
  } catch (err) {
    console.error("Erreur fetchAIResponse:", err);
    return { text: "Désolé, problème de connexion IA.", detectedReference: null };
  }
};

// --- FONCTION 2 : DIAGNOSTIC FINAL ---
export const fetchFinalDiagnosis = async (userQuery, technicalData) => {
  const prompt = `Tu es TechScan Expert. Problème: ${userQuery}. Données techniques: ${JSON.stringify(technicalData)}. Donne une solution étape par étape.`;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    return "Erreur lors du diagnostic technique.";
  }
};

// --- FONCTION 3 : ANALYSE DE NOTICE (Celle qui manquait !) ---
export const analyzeNoticeText = async (extractedText) => {
  const prompt = `Tu es un expert en maintenance. Analyse ce texte et renvoie UNIQUEMENT un JSON pur :
  {"brand": "...", "model": "...", "category": "...", "error_codes": [{"code": "...", "description": "...", "solution_particulier": "...", "solution_pro": "..."}]}
  Texte: ${extractedText.substring(0, 20000)}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    return JSON.parse(cleanGeminiResponse(rawText));
  } catch (err) {
    console.error("Erreur analyzeNoticeText:", err);
    throw new Error("Échec de l'analyse de la notice.");
  }
};