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
      
      // 2. LOGIQUE DE FILTRAGE : On sépare les mots
      // On cherche un mot qui a au moins 3 caractères et contient des chiffres/lettres
      const words = text.split(/\s+/); 
      const potentialRef = words.find(w => w.length >= 4 && /[0-9]/.test(w));

      if (potentialRef) {
        const cleanRef = potentialRef.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        setLiveText(cleanRef);
        
        // Si la référence est stable, on valide
        if (cleanRef.length >= 4) {
           onScanSuccess(cleanRef);
        }
      } else {
        setLiveText("Viser la référence...");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };