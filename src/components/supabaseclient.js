import { createClient } from '@supabase/supabase-js';

// Ces variables doivent être configurées dans ton interface Vercel
// TEST TEMPORAIRE (Ne pas laisser en production)
const supabaseUrl = "https://cvxqsvjfvvozdezjrbmq.supabase.co" 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2eHFzdmpmdnZvemRlempyYm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODY1NzEsImV4cCI6MjA4NzM2MjU3MX0.kOJ2KjwSgm0SA1xaugI_62wGFot6HFxR7HS2rC1lTbs"

console.log("Vite est en train de charger l'URL :", import.meta.env.VITE_SUPABASE_URL ? "DÉFINIE" : "VIDE");
export const supabase = createClient(supabaseUrl, supabaseAnonKey);