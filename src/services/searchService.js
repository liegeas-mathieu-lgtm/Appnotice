const SEARCH_KEY = import.meta.env.VITE_GOOGLE_SEARCH_KEY;
const CX_ID = import.meta.env.VITE_GOOGLE_CX_ID;

/**
 * Cherche une notice PDF sur le web via Google Custom Search
 */
export const findNoticePDF = async (reference) => {
  if (!SEARCH_KEY || !CX_ID) {
    throw new Error("Clés Google Search manquantes dans l'environnement.");
  }

  // Requête ultra-précise pour éviter les faux positifs
  const query = `filetype:pdf notice technique installation dépannage "${reference}"`;
  
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.append('key', SEARCH_KEY);
  url.searchParams.append('cx', CX_ID);
  url.searchParams.append('q', query);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    if (!data.items || data.items.length === 0) {
      return null;
    }

    // On récupère le lien du premier PDF
    const bestMatch = data.items[0].link;
    console.log("🎯 PDF trouvé :", bestMatch);
    return bestMatch;
    
  } catch (error) {
    console.error("Erreur Search API:", error);
    throw error;
  }
};