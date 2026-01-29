import { supabase } from './supabase';

export const logToApp = async (
  level: 'info' | 'error' | 'warning', 
  source: string, 
  message: string, 
  details?: any
) => {
  // Sempre loga no console para debug imediato no navegador
  console.log(`[${level.toUpperCase()}] ${source}: ${message}`, details);
  
  try {
    // Tenta salvar na tabela app_logs do Supabase
    const { error } = await supabase.from('app_logs').insert({
      level,
      source,
      message,
      details
    });
    
    if (error) {
      console.warn('Falha ao persistir log no banco de dados:', error.message);
    }
  } catch (e) {
    // Falha silenciosa se a tabela ainda não existir
  }
};