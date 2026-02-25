const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

// --- FONCTION 1 : ANALYSE DE LA CONVERSATION (CHAT) ---
export const fetchAIResponse = async (userQuery, history) => {
  const prompt = `
  Tu es TechScan Expert, un assistant de dépannage en automatismes (CAME, NICE, SOMFY...).
  HISTORIQUE : ${JSON.stringify(history.slice(-5))}
  MESSAGE : "${userQuery}"

  TACHE : 
  1. Si l'utilisateur donne une référence (ex: BX74, 455D, Robus 600), extrais-la dans "detectedReference".
  2. Si c'est trop vague, pose une question pour connaître la marque ou le symptôme.
  3. Réponds toujours de manière technique et rassurante.

  RENVOIE UNIQUEMENT UN JSON :
  {
    "text": "Ta réponse à l'utilisateur ici",
    "detectedReference": "LA_REF_OU_NULL"
  }`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const cleanJson = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    return { text: "Je n'ai pas bien compris. Quelle est la marque de votre matériel ?", detectedReference: null };
  }
};

// --- FONCTION 2 : DIAGNOSTIC FINAL (AVEC DONNÉES NOTICE) ---
export const fetchFinalDiagnosis = async (userQuery, technicalData) => {
  const prompt = `
  Tu es TechScan Expert. Tu dois résoudre ce problème : "${userQuery}"
  EN UTILISANT CES DONNÉES TECHNIQUES : ${JSON.stringify(technicalData)}

  CONSIGNES :
  1. Identifie la solution exacte dans les "error_codes" si possible.
  2. Explique étape par étape quoi vérifier (cellules, condensateur, fin de course...).
  3. Rappelle de couper le courant 230V avant d'ouvrir le capot.
  4. Si tu ne trouves pas, suggère une vérification mécanique (débrayage).

  Réponse courte et structurée (max 150 mots).`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    return "Une erreur est survenue lors du diagnostic. Vérifiez vos branchements.";
  }
};

// --- FONCTION 3 : ANALYSE DE NOTICE (EXISTANTE MAIS MISE À JOUR) ---
export const analyzeNoticeText = async (extractedText) => {
  const prompt = `Tu es un expert. Analyse ce texte de notice et renvoie UNIQUEMENT un JSON pur.
  Format : {"brand": "...", "model": "...", "category": "...", "error_codes": [{"code": "...", "description": "...", "solution_particulier": "...", "solution_pro": "..."}]}
  Texte : ${extractedText.substring(0, 20000)}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  const textResponse = data.candidates[0].content.parts[0].text;
  return JSON.parse(textResponse.replace(/```json/g, "").replace(/```/g, "").trim());
};