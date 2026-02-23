export const analyzeNoticeText = async (extractedText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Clé API manquante dans Vercel (VITE_GEMINI_API_KEY)");
  }

  // URL de l'API en direct (sans passer par le SDK qui bug)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google API ${response.status}: ${errorData.error?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    return JSON.parse(resultText);

  } catch (error) {
    console.error("Erreur radicale :", error);
    throw new Error(`Échec final : ${error.message}`);
  }
};