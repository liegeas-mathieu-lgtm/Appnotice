import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { findNoticePDF } from '../services/searchService';
import { extractTextFromPDF } from '../services/pdfService';
import { analyzeNoticeText, fetchAIResponse, fetchFinalDiagnosis } from '../services/aiAnalyzer';
import { fetchDiagnosticByRef } from '../services/diagnostic';
import { supabase } from '../api/supabase'; // Import pour la sauvegarde

export const ExpertChat = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Bonjour ! Je suis votre expert TechScan. Quel est votre problème de motorisation ou de sécurité ?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

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
      console.log("Analyse Gemini :", aiResponse); // Debug détection

      if (aiResponse.detectedReference) {
        const ref = aiResponse.detectedReference;
        addMessage('bot', `Je détecte le modèle ${ref}. Je vérifie ma base de données...`);
        
        let data = await fetchDiagnosticByRef(ref);
        
        // 2. Si inconnu dans Supabase, on lance la recherche Google
        if (!data) {
          addMessage('bot', `Je ne connais pas encore le ${ref}. Je lance une recherche web pour apprendre sa notice...`);
          const pdfUrl = await findNoticePDF(ref);
          
          if (pdfUrl) {
            addMessage('bot', "Notice trouvée sur le web ! Analyse flash en cours...");
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(pdfUrl)}`;
            const res = await fetch(proxyUrl);
            const blob = await res.blob();
            const text = await extractTextFromPDF(blob);
            
            // Analyse et structuration par Gemini
            const learnedData = await analyzeNoticeText(text);
            console.log("Données apprises :", learnedData);

            // --- SAUVEGARDE DANS SUPABASE ---
            const { data: savedProduct, error } = await supabase
              .from('products')
              .upsert({ 
                model: learnedData.model || ref, 
                brand: learnedData.brand, 
                category: learnedData.category 
              })
              .select()
              .single();

            if (!error && learnedData.error_codes) {
              const codesToInsert = learnedData.error_codes.map(c => ({
                product_id: savedProduct.id,
                code: c.code,
                description: c.description,
                solution_pro: c.solution_pro,
                solution_particulier: c.solution_particulier
              }));
              await supabase.from('error_codes').insert(codesToInsert);
              addMessage('bot', `Le modèle ${ref} a été ajouté à ma base de connaissances pour les prochaines recherches.`);
            }
            data = learnedData;
          } else {
            addMessage('bot', "Impossible de trouver la notice officielle. Je vais essayer de vous répondre avec mes connaissances générales.");
          }
        }
        
        // 3. Réponse finale basée sur les données techniques (locales ou apprises)
        const finalDiagnosis = await fetchFinalDiagnosis(userQuery, data);
        addMessage('bot', finalDiagnosis);
      } else {
        // Trop vague ou simple discussion
        addMessage('bot', aiResponse.text);
      }
    } catch (err) {
      console.error("Erreur ChatExpert:", err);
      addMessage('bot', "Désolé, j'ai rencontré une erreur technique. Pouvez-vous préciser la marque et le modèle ?");
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
          <p className="text-[10px] opacity-80">Apprentissage automatique actif</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-200 p-3 rounded-2xl text-gray-500">
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
          placeholder="Posez votre question (ex: Panne E1 sur FAAC)..."
          className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition-all active:scale-90"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};