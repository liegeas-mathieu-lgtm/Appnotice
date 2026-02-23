export const analyzeNoticeText = async (extractedText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) throw new Error("Clé manquante dans Vercel.");

  // Changement de modèle : on passe sur 'gemini-pro' (plus ancien mais très stable)
  // L'URL v1beta est celle qui a le plus de chances de fonctionner
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: "Donne moi la marque et le modèle du portail décrit dans ce texte au format JSON : " + extractedText.substring(0, 5000)
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.status === 404) {
      // Si gemini-pro fait aussi 404, on tente l'URL simplifiée sans version
      throw new Error("L'API Google refuse l'accès au modèle. Vérifiez que Gemini est activé sur aistudio.google.com");
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Google dit : ${data.error.message}`);
    }

    const resultText = data.candidates[0].content.parts[0].text;
    
    // On renvoie un objet simple pour tester si ça passe
    return {
      marque: "Détection en cours...",
      reference: resultText.substring(0, 50),
      pannes: []
    };

  } catch (error) {
    throw new Error(error.message);
  }
};