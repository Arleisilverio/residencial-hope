import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente injetadas pelo Vite
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in the environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);