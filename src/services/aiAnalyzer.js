export const analyzeNoticeText = async (extractedText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé API absente.");

  // On utilise le modèle 1.5-flash qui est le plus compatible avec le format JSON forcé
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: "Analyse ce texte et renvoie UNIQUEMENT un JSON pur (pas de texte avant ou après). Format: {\"marque\": \"\", \"reference\": \"\", \"type\": \"\", \"pannes\": [{\"code\": \"\", \"label\": \"\", \"solution\": \"\"}]} \n\n Texte : " + extractedText.substring(0, 15000)
      }]
    }],
    generationConfig: {
      temperature: 0.1,
      // CORRECTION : On utilise la syntaxe exacte attendue par l'API
      response_mime_type: "application/json"
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
      throw new Error(data.error?.message || "Erreur de configuration API");
    }

    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);

  } catch (error) {
    console.error("Détail erreur:", error);
    throw new Error(`Analyse impossible : ${error.message}`);
  }
};