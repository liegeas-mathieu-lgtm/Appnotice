import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { findNoticePDF } from '../services/searchService';
import { extractTextFromPDF } from '../services/pdfService';
import { analyzeNoticeText, fetchAIResponse, fetchFinalDiagnosis } from '../services/aiAnalyzer';
import { fetchDiagnosticByRef } from '../services/diagnostic';

export const ExpertChat = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Bonjour ! Je suis votre expert TechScan. Quel est votre problème de motorisation ou de sécurité ?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    addMessage('user', userQuery);
    setLoading(true);

    try {
      // 1. Analyse de l'intention par Gemini
      const aiResponse = await fetchAIResponse(userQuery, messages);
      
      if (aiResponse.detectedReference) {
        addMessage('bot', `Je détecte le modèle ${aiResponse.detectedReference}. Je vérifie ma base de données...`);
        
        let data = await fetchDiagnosticByRef(aiResponse.detectedReference);
        
        // 2. Si inconnu, on lance la recherche Google
        if (!data) {
          addMessage('bot', "Référence inconnue. Je lance une recherche web pour apprendre sa notice...");
          const pdfUrl = await findNoticePDF(aiResponse.detectedReference);
          
          if (pdfUrl) {
            addMessage('bot', "Notice trouvée ! Analyse flash en cours...");
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(pdfUrl)}`;
            const res = await fetch(proxyUrl);
            const blob = await res.blob();
            const text = await extractTextFromPDF(blob);
            data = await analyzeNoticeText(text);
            
            addMessage('bot', `Apprentissage terminé pour le modèle ${data.model}.`);
          } else {
            addMessage('bot', "Je n'ai pas trouvé de notice pour ce modèle. Je vais essayer de vous aider avec mes connaissances générales.");
          }
        }
        
        // 3. Réponse finale basée sur les données techniques
        const finalDiagnosis = await fetchFinalDiagnosis(userQuery, data);
        addMessage('bot', finalDiagnosis);
      } else {
        // Trop vague, l'IA pose des questions
        addMessage('bot', aiResponse.text);
      }
    } catch (err) {
      console.error(err);
      addMessage('bot', "Désolé, j'ai rencontré une erreur. Pouvez-vous préciser la marque et le modèle ?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
        <Bot size={24} />
        <div>
          <h2 className="font-bold text-sm">Assistant Expert TechScan</h2>
          <p className="text-[10px] opacity-80">Spécialiste Portail, Garage & Alarme</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white shadow-sm border border-gray-200 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-200 p-3 rounded-2xl">
              <Loader2 className="animate-spin" size={16} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Décrivez la panne ou donnez une réf..."
          className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};