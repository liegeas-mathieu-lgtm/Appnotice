export const analyzeNoticeText = async (extractedText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé API absente dans Vercel.");

  // URL mise à jour pour le modèle Gemini 3 Flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: `Tu es un expert en maintenance industrielle. Analyse ce texte technique et extrait les informations suivantes en JSON pur :
        {
          "marque": "NOM",
          "reference": "MODELE",
          "type": "Coulissant/Battant/Garage",
          "pannes": [{"code": "CODE", "label": "DESCRIPTION", "solution": "ACTION"}]
        }
        Texte : ${extractedText.substring(0, 20000)}`
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
      throw new Error(`Erreur API ${response.status} : ${data.error?.message || 'Modèle non supporté'}`);
    }

    // Extraction directe de la réponse JSON de Gemini 3
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);

  } catch (error) {
    console.error("Erreur Gemini 3:", error);
    throw new Error(`Échec de l'analyse : ${error.message}`);
  }
};