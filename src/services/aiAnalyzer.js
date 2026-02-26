export const fetchAIResponse = async (userQuery, history) => {
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
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    // --- LE CORRECTIF ICI ---
    if (!data.candidates || data.candidates.length === 0) {
      console.error("Réponse Gemini vide ou bloquée:", data);
      return { 
        text: "Je réfléchis un peu trop... Pouvez-vous reformuler votre question ou donner la marque ?", 
        detectedReference: null 
      };
    }

    const rawText = data.candidates[0].content.parts[0].text;
    return JSON.parse(cleanGeminiResponse(rawText));
    
  } catch (err) {
    console.error("Erreur fetchAIResponse:", err);
    return { text: "Désolé, ma connexion avec le cerveau IA a été coupée. Quelle est la marque de votre moteur ?", detectedReference: null };
  }
};