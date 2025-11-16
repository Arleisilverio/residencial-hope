import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente do Vite da forma padrão e mais segura
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in the environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);