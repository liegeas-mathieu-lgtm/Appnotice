const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Utilitaire pour nettoyer la réponse de Gemini (souvent entourée de ```json ... ```)
const cleanGeminiResponse = (text) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// --- FONCTION 1 : ANALYSE DE LA CONVERSATION (CHAT) ---
export const fetchAIResponse = async (userQuery, history) => {
  const prompt = `
  Tu es TechScan Expert, un assistant de dépannage en automatismes.
  HISTORIQUE : ${JSON.stringify(history.slice(-5))}
  MESSAGE : "${userQuery}"

  TACHE : 
  1. Si l'utilisateur mentionne une référence technique (ex: BX74, 455D, Robus, Supramatic), extrais-la dans "detectedReference" (uniquement le modèle, ex: "455D"). Si aucune référence, mets null.
  2. Si le message est trop vague, pose une question courte pour connaître la marque ou le symptôme exact.
  3. Réponds de manière technique mais accessible.

  RENVOIE UNIQUEMENT UN JSON PUR (SANS TEXTE AUTOUR) :
  {
    "text": "Ta réponse à l'utilisateur ici",
    "detectedReference": "NOM_DU_MODELE_OU_NULL"
  }`;

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
    console.error("Erreur fetchAIResponse:", err);
    return { text: "Je n'ai pas bien compris. Pouvez-vous préciser la marque et le modèle de votre matériel ?", detectedReference: null };
  }
};

// --- FONCTION 2 : DIAGNOSTIC FINAL (AVEC DONNÉES TECHNIQUES) ---
export const fetchFinalDiagnosis = async (userQuery, technicalData) => {
  const prompt = `
  Tu es TechScan Expert. Tu dois résoudre ce problème : "${userQuery}"
  EN UTILISANT CES DONNÉES TECHNIQUES ISSUES DE LA NOTICE : ${JSON.stringify(technicalData)}

  CONSIGNES :
  1. Identifie la solution exacte dans les "error_codes" si possible.
  2. Explique étape par étape quoi vérifier (cellules, condensateur, fin de course...).
  3. Rappelle de couper le courant 230V avant d'ouvrir le capot si une manipulation électrique est nécessaire.
  4. Si tu ne trouves pas la panne exacte, suggère de débrayer le moteur pour vérifier la mécanique.

  Réponse courte, structurée et technique.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("Erreur fetchFinalDiagnosis:", err);
    return "Je rencontre une difficulté à analyser les données de la notice. Vérifiez visuellement les branchements de vos cellules et l'alimentation.";
  }
};

// --- FONCTION 3 : ANALYSE DE NOTICE POUR AUTO-APPRENTISSAGE ---
export const analyzeNoticeText = async (extractedText) => {
  const prompt = `Tu es un expert en maintenance. Analyse ce texte de notice technique et transforme-le en données structurées.
  
  Format de réponse attendu (JSON PUR UNIQUEMENT) :
  {
    "brand": "Marque (ex: CAME)",
    "model": "Modèle exact (ex: BX74)",
    "category": "Portail/Garage/Alarme",
    "error_codes": [
      {
        "code": "Code erreur (ex: E1)",
        "description": "Description du problème",
        "solution_particulier": "Action simple pour l'utilisateur",
        "solution_pro": "Action technique pour installateur"
      }
    ]
  }

  Texte de la notice : ${extractedText.substring(0, 20000)}`;

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
    throw new Error("Impossible de structurer les données de la notice.");
  }
};