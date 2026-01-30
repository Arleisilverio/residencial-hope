import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Wrench, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Complaint {
  id: string;
  category: string;
  description: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

const statusMap = {
  new: { label: 'Solicitado', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  in_progress: { label: 'Em Manutenção', color: 'text-blue-600 bg-blue-100', icon: Wrench },
  resolved: { label: 'Concluído', color: 'text-green-600 bg-green-100', icon: CheckCircle },
};

const categoryMap: { [key: string]: string } = {
  hidraulica: 'Hidráulica',
  eletrica: 'Elétrica',
  estrutura: 'Estrutura',
  outros: 'Outros',
  reparo: 'Manutenção IA',
  message: 'Mensagem',
};

const RepairHistory: React.FC = () => {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRepairs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setRepairs(data as Complaint[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRepairs();
    
    // Escuta mudanças (status atualizado pelo admin)
    const channel = supabase
      .channel('tenant-repairs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'complaints',
        filter: `tenant_id=eq.${user?.id}`
      }, () => {
        fetchRepairs();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchRepairs, user?.id]);

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;

  if (repairs.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg mt-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center border-b dark:border-slate-700 pb-3">
        <Wrench className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" />
        Minhas Solicitações
      </h2>
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {repairs.map((repair) => {
          const status = statusMap[repair.status];
          const StatusIcon = status.icon;
          return (
            <div key={repair.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {categoryMap[repair.category] || repair.category} • {format(new Date(repair.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
                <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{repair.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RepairHistory;