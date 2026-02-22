import { supabase } from '../api/supabase';

export const fetchDiagnosticByRef = async (reference) => {
  // On nettoie la recherche (pas d'espaces, tout en majuscules)
  const cleanRef = reference.replace(/\s+/g, '').toUpperCase();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      manual_url,
      brands ( name ),
      error_codes ( 
        code, 
        description, 
        solution_pro, 
        solution_particulier 
      )
    `)
    .ilike('reference_pattern', `%${cleanRef}%`)
    .maybeSingle();

  if (error) throw error;
  return data;
};