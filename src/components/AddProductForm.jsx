import React, { useState } from 'react';
import { supabase } from '../api/supabase';
import { Save, X, Book, Tag, Factory, Info } from 'lucide-react';

export const AddProductForm = ({ initialRef, onComplete, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    model_name: initialRef || '',
    brand_name: '',
    category: 'Coulissant',
    manual_url: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Gérer la marque (Trouver l'ID ou créer la marque)
      let brandId = null;
      if (formData.brand_name) {
        const { data: brandData } = await supabase
          .from('brands')
          .select('id')
          .ilike('name', formData.brand_name)
          .maybeSingle();

        if (brandData) {
          brandId = brandData.id;
        } else {
          const { data: newBrand } = await supabase
            .from('brands')
            .insert([{ name: formData.brand_name.toUpperCase() }])
            .select()
            .single();
          brandId = newBrand.id;
        }
      }

      // 2. Insérer le produit
      const { data: product, error } = await supabase
        .from('products')
        .insert([{ 
            model_name: formData.model_name, 
            brand_id: brandId,
            reference_pattern: formData.model_name.toUpperCase().replace(/\s+/g, ''),
            category: formData.category,
            manual_url: formData.manual_url,
            notes: formData.notes
        }])
        .select(`*, brands(name)`)
        .single();

      if (error) throw error;
      
      alert("Fiche produit créée avec succès !");
      onComplete(product);
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Nouvelle Fiche</h3>
        <button onClick={onCancel} className="p-2 bg-gray-100 rounded-full text-gray-500">
          <X size={20}/>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Modèle */}
        <div>
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Modèle / Référence</label>
          <div className="flex items-center bg-gray-50 rounded-xl px-3 border border-gray-100">
            <Tag size={18} className="text-gray-400" />
            <input 
              className="flex-1 p-3 bg-transparent outline-none text-gray-700"
              value={formData.model_name}
              onChange={(e) => setFormData({...formData, model_name: e.target.value})}
              placeholder="ex: Robus 400"
              required
            />
          </div>
        </div>

        {/* Champ Marque */}
        <div>
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Marque</label>
          <div className="flex items-center bg-gray-50 rounded-xl px-3 border border-gray-100">
            <Factory size={18} className="text-gray-400" />
            <input 
              className="flex-1 p-3 bg-transparent outline-none text-gray-700"
              value={formData.brand_name}
              onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
              placeholder="ex: NICE, CAME, BFT..."
            />
          </div>
        </div>

        {/* Sélecteur Catégorie */}
        <div>
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Type de moteur</label>
          <select 
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none text-gray-700"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="Coulissant">Coulissant</option>
            <option value="Battant">Battant</option>
            <option value="Garage">Porte de garage</option>
            <option value="Barrière">Barrière levante</option>
            <option value="Rideau">Rideau métallique</option>
          </select>
        </div>

        {/* URL Notice */}
        <div>
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Lien PDF Notice</label>
          <div className="flex items-center bg-gray-50 rounded-xl px-3 border border-gray-100">
            <Book size={18} className="text-gray-400" />
            <input 
              className="flex-1 p-3 bg-transparent outline-none text-gray-700"
              value={formData.manual_url}
              onChange={(e) => setFormData({...formData, manual_url: e.target.value})}
              placeholder="https://..."
            />
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50 mt-4"
        >
          <Save size={20} />
          {loading ? "Enregistrement..." : "Créer la fiche produit"}
        </button>
      </form>
    </div>
  );
};