import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { Loader2, Camera } from 'lucide-react';

export const Scanner = ({ onScanSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [liveText, setLiveText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 1. Démarrer la caméra
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment", width: { ideal: 1280 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert("Erreur caméra : " + err.message);
      }
    }
    startCamera();

    // 2. Boucle d'analyse (toutes les 1.5 secondes pour ne pas faire ramer le tel)
    const interval = setInterval(() => {
      captureAndRecognize();
    }, 1500);

    return () => {
      clearInterval(interval);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndRecognize = async () => {
    if (!videoRef.current || isProcessing) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Dessiner l'image de la caméra sur un canvas invisible
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    setIsProcessing(true);
    try {
      // Analyse de l'image par l'IA
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
        logger: m => console.log(m)
      });

      // Nettoyage : on ne garde que les lettres et chiffres
      const cleanText = text.replace(/[^a-zA-Z0-9]/g, '').trim();
      setLiveText(cleanText);

      // Si on trouve une référence de plus de 4 caractères
      if (cleanText.length >= 4) {
        onScanSuccess(cleanText);
      }
    } catch (err) {
      console.error("Erreur OCR:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black relative">
      {/* Retour texte en direct */}
      <div className="absolute top-10 left-0 right-0 px-6 z-20">
        <div className="bg-blue-600/90 backdrop-blur-md p-4 rounded-2xl border border-blue-400 shadow-2xl">
          <p className="text-blue-100 text-[10px] uppercase font-bold mb-1 flex items-center gap-2">
            {isProcessing && <Loader2 size={12} className="animate-spin" />}
            Analyse du texte en cours...
          </p>
          <p className="text-white font-mono text-xl h-8 overflow-hidden">
            {liveText || "Visez la plaque..."}
          </p>
        </div>
      </div>

      {/* Flux Vidéo */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        {/* Cadre de visée visuel */}
        <div className="absolute inset-0 border-[40px] border-black/50 flex items-center justify-center">
          <div className="w-64 h-32 border-2 border-blue-400 rounded-lg relative">
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-white"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-white"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-white"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-white"></div>
          </div>
        </div>
      </div>

      {/* Canvas caché pour l'analyse */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};