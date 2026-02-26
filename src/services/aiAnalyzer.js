export const fetchAIResponse = async (userQuery, history) => {
  // Correction de l'URL pour utiliser un modèle stable
  const STABLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const prompt = `
  Tu es TechScan Expert, un assistant de dépannage en automatismes.
  HISTORIQUE : ${JSON.stringify(history.slice(-5))}
  MESSAGE : "${userQuery}"

  TACHE : 
  1. Si l'utilisateur mentionne une référence technique (ex: BX74, 455D, Robus), extrais-la dans "detectedReference". Sinon null.
  2. Si le message est vague, pose une question pour la marque ou le symptôme.

  RENVOIE UNIQUEMENT UN JSON PUR :
  {
    "text": "Ta réponse ici",
    "detectedReference": "REF_OU_NULL"
  }`;

  try {
    const response = await fetch(STABLE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    // --- LOGS CRITIQUES POUR LE DEBUG ---
    if (data.error) {
      console.error("❌ ERREUR API GOOGLE :", data.error.message);
      return { 
        text: `Erreur technique Google : ${data.error.message}`, 
        detectedReference: null 
      };
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("⚠️ RÉPONSE INCOMPLÈTE :", data);
      return { 
        text: "L'IA n'a pas pu générer de réponse. Réessayez avec une référence précise.", 
        detectedReference: null 
      };
    }

    // Extraction sécurisée
    const rawText = data.candidates[0].content.parts[0].text;
    return JSON.parse(cleanGeminiResponse(rawText));
    
  } catch (err) {
    console.error("🔥 CRASH TOTAL fetchAIResponse:", err);
    return { 
      text: "Désolé, connexion perdue. Vérifiez votre clé API dans Vercel.", 
      detectedReference: null 
    };
  }
};