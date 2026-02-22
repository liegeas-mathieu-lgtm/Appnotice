import React from 'react';
import { AlertTriangle, Wrench, User, FileText, ChevronLeft } from 'lucide-react';

export const Diagnostic = ({ data, onReset }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
    {/* En-tête avec bouton retour */}
    <div className="flex items-center gap-4 mb-6">
      <button onClick={onReset} className="p-2 hover:bg-gray-100 rounded-full">
        <ChevronLeft size={24} />
      </button>
      <div>
        <span className="text-xs font-bold uppercase text-blue-600">{data.brands?.name}</span>
        <h1 className="text-2xl font-bold text-gray-900">{data.model_name}</h1>
      </div>
    </div>

    {/* Liste des erreurs */}
    <div className="space-y-4">
      {data.error_codes?.map((err, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 font-mono font-bold text-lg mb-2">
            <AlertTriangle size={18} />
            {err.code}
          </div>
          <p className="text-gray-600 font-medium mb-4">{err.description}</p>
          
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
              <p className="flex items-center gap-1 text-xs font-bold text-blue-700 mb-1">
                <Wrench size={14} /> SOLUTION EXPERT (PRO)
              </p>
              <p className="text-sm text-blue-900">{err.solution_pro}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* --- BOUTON NOTICE PDF --- */}
    {data.manual_url ? (
      <div className="mt-8">
        <a 
          href={data.manual_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          <FileText size={20} />
          Ouvrir la notice PDF
        </a>
        <p className="text-center text-gray-400 text-xs mt-3">
          Lien officiel constructeur
        </p>
      </div>
    ) : (
      <div className="mt-8 p-4 bg-gray-100 rounded-xl text-center text-gray-500 text-sm italic">
        Aucune notice PDF disponible pour ce modèle.
      </div>
    )}
  </div>
);