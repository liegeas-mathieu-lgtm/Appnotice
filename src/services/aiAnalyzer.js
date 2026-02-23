export const analyzeNoticeText = async (extractedText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // L'URL la plus simple possible que Google accepte partout
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: "Analyse ce texte et donne les pannes en JSON : " + extractedText.substring(0, 10000)
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Si ça fait encore 404, c'est que le nom du modèle est refusé
      const err = await response.json();
      throw new Error(`Code ${response.status} : ${err.error?.message || 'Modèle non trouvé'}`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json|```/g, "").trim();
    return JSON.parse(text);

  } catch (error) {
    throw new Error(error.message);
  }
};