import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { Loader2, AlertTriangle } from 'lucide-react';

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
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment", width: { ideal: 1280 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play();
        }
      } catch (err) {
        setError("Accès caméra refusé ou non supporté.");
      }
    }
    startCamera();

    const interval = setInterval(() => { captureAndRecognize(); }, 1200);

    return () => {
      clearInterval(interval);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const captureAndRecognize = async () => {
    if (!videoRef.current || isProcessing || videoRef.current.paused) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // ZONE DE CAPTURE RÉDUITE (Petit rectangle pour les petites refs)
    const captureWidth = 400; 
    const captureHeight = 120; // Plus fin pour ne prendre qu'une ligne
    const sx = (video.videoWidth - captureWidth) / 2;
    const sy = (video.videoHeight - captureHeight) / 2;

    canvas.width = captureWidth;
    canvas.height = captureHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, sx, sy, captureWidth, captureHeight, 0, 0, captureWidth, captureHeight);

    setIsProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
      const rawText = text.toUpperCase().replace(/\s+/g, '');
      
      // Filtre : au moins 2 lettres suivies de chiffres
      const match = rawText.match(/[A-Z]{2,}[0-9]{2,}/);

      if (match) {
        setLiveText(match[0]);
        onScanSuccess(match[0]);
      } else {
        setLiveText(rawText.substring(0, 12));
      }
    } catch (err) {} finally {
      setIsProcessing(false);
    }
  };

  if (error) return <div className="bg-black h-full flex items-center justify-center text-white p-6"><AlertTriangle className="mr-2 text-red-500"/> {error}</div>;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black relative overflow-hidden">
      {/* Bandeau de lecture en haut */}
      <div className="absolute top-12 left-0 right-0 px-8 z-30">
        <div className="bg-blue-600/90 backdrop-blur-md p-3 rounded-xl border border-blue-400 shadow-xl text-center">
          <p className="text-white font-mono text-lg tracking-[0.2em]">
            {liveText || "ALIGNER LE CODE"}
          </p>
        </div>
      </div>

      <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

      {/* OVERLAY DE VISÉE PRÉCISE */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Assombrissement extérieur */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Cadre de visée étroit */}
        <div className="w-64 h-20 border-2 border-white/50 rounded-lg relative z-20 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
          {/* Coins lumineux */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-blue-500"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-blue-500"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-blue-500"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-blue-500"></div>

          {/* BARRE DE SCAN ROUGE ANIMÉE */}
          <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_red] animate-scanline"></div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scanline {
          position: absolute;
          animation: scanline 2s linear infinite;
        }
      `}</style>
    </div>
  );
};