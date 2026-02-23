import { supabase } from '../supabaseClient'; // Vérifie le chemin de ton client Supabase

export const uploadNotice = async (file) => {
  try {
    // Créer un nom de fichier unique pour éviter les doublons
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.current()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('notices')
      .upload(filePath, file);

    if (error) throw error;

    // Récupérer l'URL publique si tu en as besoin plus tard
    const { data: { publicUrl } } = supabase.storage
      .from('notices')
      .getPublicUrl(filePath);

    return { filePath, publicUrl };
  } catch (error) {
    console.error('Erreur Upload Supabase:', error.message);
    throw error;
  }
};