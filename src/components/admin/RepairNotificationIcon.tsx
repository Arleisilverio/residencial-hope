import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, X, Loader2, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Button } from '../ui/Button';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Definindo um tipo simples para a notificação de reclamação
interface ComplaintNotification {
  id: string;
  apartment_number: number;
  category: string;
  description: string;
  tenant_id: string;
  tenant_name: string;
}

const categoryMap: { [key: string]: string } = {
    hidraulica: 'Hidráulica',
    eletrica: 'Elétrica',
    estrutura: 'Estrutura',
    outros: 'Outros',
};

const RepairNotificationIcon: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Removendo useNavigate pois não será mais usado

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    // Busca APENAS reclamações com status 'new'
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        id,
        apartment_number,
        category,
        description,
        tenant_id,
        tenant:profiles(full_name)
      `)
      .eq('status', 'new') // Filtra apenas por 'new'
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Falha ao carregar reclamações pendentes.');
      setComplaints([]);
    } else {
      const formattedData: ComplaintNotification[] = data.map(c => {
        // Supabase retorna a junção como um array, mesmo que seja um único registro
        const tenantProfile = Array.isArray(c.tenant) ? c.tenant[0] : c.tenant;
        
        return {
          id: c.id,
          apartment_number: c.apartment_number,
          category: c.category,
          description: c.description,
          tenant_id: c.tenant_id,
          tenant_name: tenantProfile?.full_name || 'Inquilino Desconhecido',
        };
      });
      setComplaints(formattedData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Escuta em tempo real por novas reclamações
  useEffect(() => {
    const channel = supabase
      .channel('complaints-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaints',
          filter: 'status=eq.new'
        },
        () => {
          fetchComplaints();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints',
        },
        (payload) => {
            // Se o status for alterado para 'resolved', atualizamos a lista
            if (payload.new.status === 'resolved') {
                setComplaints(prev => prev.filter(c => c.id !== payload.new.id));
            } else {
                // Para outros updates, recarregamos (ex: se o status voltar para 'new')
                fetchComplaints();
            }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchComplaints]);

  // Removendo handleNavigate

  const handleMarkAsResolved = async (complaintId: string, aptNumber: number) => {
    // Atualização otimista da UI
    setComplaints(prev => prev.filter(c => c.id !== complaintId));

    const toastId = toast.loading(`Marcando Kit ${String(aptNumber).padStart(2, '0')} como resolvido...`);

    // 1. Atualiza o status para 'resolved'
    const { error } = await supabase
      .from('complaints')
      .update({ status: 'resolved' }) // Novo status 'resolved'
      .eq('id', complaintId);

    if (error) {
      toast.error('Erro ao marcar como resolvido.', { id: toastId });
      // Reverte a atualização otimista em caso de erro
      fetchComplaints();
    } else {
      toast.success('Reclamação marcada como resolvida e dispensada.', { id: toastId });
    }
  };
  
  const hasComplaints = complaints.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          title="Solicitações de Reparo Pendentes"
        >
          <Wrench className="w-5 h-5" />
          {hasComplaints && (
            <span className="absolute top-0 right-0 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                {complaints.length}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-50 border bg-popover text-popover-foreground" align="end">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
            Reparos Pendentes ({complaints.length})
          </h3>
          {loading ? (
            <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : hasComplaints ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {complaints.map((c) => (
                <div key={c.id} className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      Kit {String(c.apartment_number).padStart(2, '0')} - {categoryMap[c.category] || c.category}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2" title={c.description}>
                      {c.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      Por: {c.tenant_name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMarkAsResolved(c.id, c.apartment_number)}
                    className="p-1 text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors flex-shrink-0 ml-2"
                    title="Marcar como resolvido e dispensar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {/* Botão Gerenciar Reparos removido */}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              Nenhuma solicitação de reparo pendente.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RepairNotificationIcon;