import { createClient } from '@supabase/supabase-js';

// --- CÓDIGO DE DIAGNÓSTICO ---
// Vamos imprimir no console do navegador todas as variáveis de ambiente que o Vite está vendo.
console.log('Variáveis de ambiente carregadas pelo Vite:', import.meta.env);
// -----------------------------

// Lê as variáveis de ambiente do Vite da forma padrão e mais segura
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Mensagem de erro mais detalhada
  console.error('ERRO: VITE_SUPABASE_URL não foi encontrada. Valor:', supabaseUrl);
  console.error('ERRO: VITE_SUPABASE_ANON_KEY não foi encontrada. Valor:', supabaseAnonKey);
  throw new Error("As chaves do Supabase não foram carregadas. Verifique se o arquivo .env existe na raiz do projeto e se as variáveis começam com 'VITE_'.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);