export const analyzeNoticeText = async (extractedText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé API absente dans Vercel.");

  // Liste des modèles à tester par ordre de probabilité en 2026
  const modelsToTest = [
    "gemini-2.0-flash",       // Le standard stable
    "gemini-1.5-flash",       // Le prédécesseur universel
    "gemini-1.5-flash-8b"     // Le modèle ultra-léger (souvent le seul en gratuit)
  ];

  const payload = {
    contents: [{
      parts: [{
        text: "Analyse ce texte et renvoie le JSON (marque, reference, pannes) : " + extractedText.substring(0, 10000)
      }]
    }],
    generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
  };

  // On boucle sur les modèles jusqu'à ce qu'un fonctionne
  for (const model of modelsToTest) {
    try {
      console.log(`Tentative avec le modèle : ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);
      }
      
      if (response.status !== 404) {
        // Si c'est une autre erreur que 404 (ex: 429 quota), on s'arrête
        const errData = await response.json();
        throw new Error(errData.error?.message || "Erreur API");
      }
    } catch (e) {
      if (model === modelsToTest[modelsToTest.length - 1]) throw e;
      // Sinon on continue la boucle
    }
  }

  throw new Error("Aucun modèle disponible sur votre compte Google AI.");
};