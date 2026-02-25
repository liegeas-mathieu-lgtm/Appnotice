import * as pdfjs from 'pdfjs-dist';

// On utilise la version .js standard plutôt que .mjs pour Samsung Internet
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // On force l'utilisation de la version standard
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useWorkerFetch: true, 
      isEvalSupported: false
    });
    
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Erreur extraction PDF détaillée:", error);
    throw new Error("Erreur lecture PDF: " + error.message);
  }
};