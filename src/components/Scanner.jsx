import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { Loader2, X, AlertTriangle } from 'lucide-react';

export const Scanner = ({ onScanSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [liveText, setLiveText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        // Demande l'accès à la caméra arrière avec une bonne résolution
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // On attend que la vidéo soit prête pour lancer l'analyse
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      } catch (err) {
        console.error("Erreur caméra:", err);
        setError("Impossible d'accéder à la caméra. Vérifiez les autorisations HTTPS.");
      }
    }

    startCamera();

    const interval = setInterval(() => {
      captureAndRecognize();
    }, 1500);

    return () => {
      clearInterval(interval);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndRecognize = async () => {
    if (!videoRef.current || isProcessing || videoRef.current.paused) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    // On définit la zone de capture (le rectangle central)
    const captureWidth = 600; 
    const captureHeight = 300;
    
    // Calcul des coordonnées pour centrer la capture
    const sx = (video.videoWidth - captureWidth) / 2;
    const sy = (video.videoHeight - captureHeight) / 2;

    canvas.width = captureWidth;
    canvas.height = captureHeight;

    ctx.drawImage(video, sx, sy, captureWidth, captureHeight, 0, 0, captureWidth, captureHeight);

    setIsProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
      const rawText = text.toUpperCase().replace(/\s+/g, '');
      
      // Filtre : cherche au moins 2 lettres suivies de 3 chiffres
      const match = rawText.match(/[A-Z]{2,}[0-9]{3,}/);

      if (match) {
        setLiveText(match[0]);
        onScanSuccess(match[0]);
      } else {
        // Affiche un aperçu du texte brut pour aider l'utilisateur
        setLiveText(rawText.substring(0, 15));
      }
    } catch (err) {
      console.error("Erreur OCR:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-6 text-center">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <p className="text-white font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black relative overflow-hidden">
      {/* Bandeau de lecture */}
      <div className="absolute top-10 left-0 right-0 px-6 z-20">
        <div className="bg-blue-600/90 backdrop-blur-md p-4 rounded-2xl border border-blue-400 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            {isProcessing && <Loader2 size={14} className="animate-spin text-white" />}
            <p className="text-blue-100 text-[10px] uppercase font-bold">Analyse en direct</p>
          </div>
          <p className="text-white font-mono text-xl h-8 overflow-hidden tracking-wider">
            {liveText || "Viser la plaque..."}
          </p>
        </div>
      </div>

      {/* Flux Vidéo en plein écran */}
      <video 
        ref={videoRef} 
        playsInline 
        muted
        className="w-full h-full object-cover"
      />

      {/* Overlay de visée */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-72 h-36 border-2 border-blue-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
            {/* Coins blancs pour le design */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};