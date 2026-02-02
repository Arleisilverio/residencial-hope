import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { AppLog } from '../../types';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal, Trash2, Loader2, RefreshCw, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Erro ao buscar logs:', error);
      toast.error('Não foi possível carregar os logs. Verifique se a tabela app_logs foi criada.');
    } else {
      setLogs(data as AppLog[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const clearLogs = async () => {
    if (!window.confirm('Tem certeza que deseja apagar todos os logs?')) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('app_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo
    
    if (error) {
      toast.error('Erro ao limpar logs.');
      setLoading(false);
    } else {
      toast.success('Histórico de logs limpo!');
      setLogs([]);
      setLoading(false);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error': return <span className="flex items-center text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><AlertCircle className="w-3 h-3 mr-1" /> Erro</span>;
      case 'warning': return <span className="flex items-center text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><AlertTriangle className="w-3 h-3 mr-1" /> Aviso</span>;
      default: return <span className="flex items-center text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><Info className="w-3 h-3 mr-1" /> Info</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>
          <div className="flex space-x-2">
            <button 
              onClick={fetchLogs} 
              disabled={loading}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={clearLogs} 
              disabled={loading || logs.length === 0}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" 
              title="Limpar Logs"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
          <Terminal className="w-8 h-8 mr-3 text-slate-500" />
          Logs de Execução
        </h1>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          {loading && logs.length === 0 ? (
            <div className="p-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
              <p className="mt-4 text-slate-500">Buscando registros...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-20 text-center">
              <Info className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Nenhum log registrado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nível</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Origem</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mensagem</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd/MM/yy HH:mm:ss', { locale: ptBR })}
                      </td>
                      <td className="p-4">{getLevelBadge(log.level)}</td>
                      <td className="p-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">{log.source}</td>
                      <td className="p-4 text-xs text-slate-800 dark:text-slate-200 font-medium">{log.message}</td>
                      <td className="p-4 text-[11px] text-slate-500 max-w-xs truncate">
                        {log.details ? (
                          <button 
                            onClick={() => alert(JSON.stringify(log.details, null, 2))}
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            Ver JSON
                          </button>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogsPage;