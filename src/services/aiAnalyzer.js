export const analyzeNoticeText = async (extractedText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé API absente.");

  // On utilise l'alias 'latest' qui pointe vers le modèle actif de ton compte
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: "Tu es un assistant technique. Analyse ce texte et réponds UNIQUEMENT par un objet JSON respectant ce format : {\"marque\": \"\", \"reference\": \"\", \"type\": \"\", \"pannes\": [{\"code\": \"\", \"label\": \"\", \"solution\": \"\"}]}. Voici le texte : " + extractedText.substring(0, 10000)
      }]
    }]
    // On a supprimé generationConfig pour éviter toute erreur de champ inconnu
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Erreur API");
    }

    let resultText = data.candidates[0].content.parts[0].text;
    
    // Nettoyage manuel du JSON au cas où Gemini ajoute des balises ```json
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(resultText);

  } catch (error) {
    throw new Error(`Erreur : ${error.message}`);
  }
};