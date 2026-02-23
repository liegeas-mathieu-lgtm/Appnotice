export const analyzeNoticeText = async (extractedText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé API absente.");

  // URL de secours ultime : le modèle 1.5-flash est le seul garanti stable 
  // même si tu as accès au 3.0 via l'interface.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: "Analyse ce texte et renvoie le JSON de la marque et des pannes : " + extractedText.substring(0, 10000)
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
      // SI ENCORE 404, on affiche la liste des modèles DISPONIBLES pour TA clé
      if (response.status === 404) {
        throw new Error("Modèle introuvable. Allez dans Google AI Studio et créez une clé spécifiquement pour 'Gemini 1.5 Flash'.");
      }
      throw new Error(data.error?.message || "Erreur inconnue");
    }

    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);

  } catch (error) {
    throw new Error(error.message);
  }
};