export const analyzeNoticeText = async (extractedText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Clé API manquante dans Vercel.");
  }

  // ON TENTE LA VERSION V1 (STABLE) AU LIEU DE V1BETA
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: "Extrait les pannes de ce texte et réponds en JSON pur. Format: {\"marque\":\"\", \"reference\":\"\", \"type\":\"\", \"pannes\":[{\"code\":\"\", \"label\":\"\", \"solution\":\"\"}]} \n\n Texte : " + extractedText.substring(0, 10000)
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Si la V1 renvoie encore 404, on tente automatiquement la V1BETA
    if (response.status === 404) {
      const urlBeta = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const responseBeta = await fetch(urlBeta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!responseBeta.ok) throw new Error(`Erreur API ${responseBeta.status}`);
      const data = await responseBeta.json();
      return JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, ""));
    }

    if (!response.ok) {
      throw new Error(`Erreur API ${response.status}`);
    }

    const data = await response.json();
    let resultText = data.candidates[0].content.parts[0].text;
    
    // Nettoyage au cas où l'IA met des balises ```json
    resultText = resultText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(resultText);

  } catch (error) {
    throw new Error(`Échec : ${error.message}. Vérifiez que le modèle Gemini 1.5 Flash est activé pour cette clé.`);
  }
};