import { createClient } from '@supabase/supabase-js';

// NOTA: A abordagem padrão de usar variáveis de ambiente (import.meta.env) não funcionou
// neste ambiente. Para garantir que a aplicação funcione, estamos definindo as chaves
// diretamente aqui. Esta não é uma prática recomendada para projetos em produção.

const supabaseUrl = 'https://cijhhohosmmvbednsapf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpamhob2hvc21tdmJlZG5zYXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjAyMDUsImV4cCI6MjA3NDY5NjIwNX0.KQsXtPydEpJTm9UKGln1O0IUzwylL41CkUCU_pBPZrY';

if (!supabaseUrl || !supabaseAnonKey) {
  // Esta verificação é mantida por segurança, mas não deve mais falhar.
  throw new Error("As chaves do Supabase não estão definidas no código.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);