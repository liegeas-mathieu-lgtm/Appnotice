import { createClient } from '@supabase/supabase-js';

// Ces variables doivent être configurées dans ton interface Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
console.log("Vite est en train de charger l'URL :", import.meta.env.VITE_SUPABASE_URL ? "DÉFINIE" : "VIDE");
export const supabase = createClient(supabaseUrl, supabaseAnonKey);