export const Scanner = ({ onScanSuccess }) => {
const captureAndRecognize = async () => {
    if (!videoRef.current || isProcessing) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    // 1. On définit une zone de capture précise (le rectangle central)
    // On prend le centre de la vidéo
    const captureWidth = 600; 
    const captureHeight = 300;
    const sx = (video.videoWidth - captureWidth) / 2;
    const sy = (video.videoHeight - captureHeight) / 2;

    canvas.width = captureWidth;
    canvas.height = captureHeight;

    // On ne dessine que le centre dans le canvas pour l'IA
    ctx.drawImage(video, sx, sy, captureWidth, captureHeight, 0, 0, captureWidth, captureHeight);

    setIsProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
      
      // 1. On nettoie les espaces et on met tout en majuscules
      const rawText = text.toUpperCase().replace(/\s+/g, '');

      // 2. LE FILTRE MAGIQUE (Regex)
      // On cherche une séquence qui commence par des lettres (ex: SLX) 
      // et se termine par des chiffres (ex: 1524)
      const match = rawText.match(/[A-Z]{2,}[0-9]{3,}/);

      if (match) {
        const cleanRef = match[0]; // On ne prend QUE le morceau qui correspond au pattern
        setLiveText(cleanRef);
        
        // Si on a trouvé une référence propre, on l'envoie
        onScanSuccess(cleanRef);
      } else {
        // Optionnel : afficher un aperçu tronqué si rien n'est trouvé
        setLiveText(rawText.substring(0, 10) + "..."); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
}