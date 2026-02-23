export const analyzeNoticeText = async (extractedText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé API absente dans Vercel.");

  // On essaie le modèle 2.0 Flash qui est le standard actuel pour les développeurs
  const modelName = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: `Tu es un expert en maintenance. Analyse ce texte et renvoie UNIQUEMENT un JSON pur.
        Format : {"marque": "...", "reference": "...", "type": "...", "pannes": [{"code": "...", "label": "...", "solution": "..."}]}
        Texte : ${extractedText.substring(0, 15000)}`
      }]
    }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      // Si le 2.0 renvoie 404, on tente le 1.5-flash par sécurité
      if (response.status === 404) {
         const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
         const fallbackRes = await fetch(fallbackUrl, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(payload)
         });
         const fallbackData = await fallbackRes.json();
         if (!fallbackRes.ok) throw new Error("Aucun modèle Gemini trouvé (404).");
         return JSON.parse(fallbackData.candidates[0].content.parts[0].text);
      }
      throw new Error(data.error?.message || "Erreur API");
    }

    return JSON.parse(data.candidates[0].content.parts[0].text);

  } catch (error) {
    console.error("Erreur d'analyse:", error);
    throw new Error(`Échec : ${error.message}`);
  }
};