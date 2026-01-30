import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, X, Loader2, MessageSquare, Send, AlertCircle, ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { supabase } from '../../services/supabase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminReplyDialog from './AdminReplyDialog';

export interface ComplaintNotification {
  id: string;
  apartment_number: number;
  category: string;
  description: string;
  tenant_id: string;
  tenant_name: string;
  status: 'new' | 'in_progress' | 'resolved';
}

const categoryMap: { [key: string]: string } = {
    hidraulica: 'Hidráulica',
    eletrica: 'Elétrica',
    estrutura: 'Estrutura',
    outros: 'Outros',
    reparo: 'Manutenção IA',
    message: 'Mensagem',
};

const RepairNotificationIcon: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ComplaintNotification | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select(`id, apartment_number, category, description, status, tenant_id, tenant:profiles(full_name)`)
      .eq('status', 'new')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } else {
      const formattedData: ComplaintNotification[] = data.map(c => ({
        id: c.id,
        apartment_number: c.apartment_number,
        category: c.category,
        description: c.description,
        status: c.status,
        tenant_id: c.tenant_id,
        tenant_name: (c.tenant as any)?.full_name || 'Inquilino Desconhecido',
      }));
      setComplaints(formattedData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    const channel = supabase
      .channel('complaints-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
          fetchComplaints();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchComplaints]);

  const handleDeleteComplaint = async (complaintId: string, aptNumber: number) => {
    setComplaints(prev => prev.filter(c => c.id !== complaintId));
    const toastId = toast.loading(`Removendo notificação do Kit ${String(aptNumber).padStart(2, '0')}...`);
    try {
      const { error } = await supabase.from('complaints').delete().eq('id', complaintId);
      if (error) throw error;
      toast.success('Notificação removida com sucesso.', { id: toastId });
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
      toast.error('Erro ao remover notificação.', { id: toastId });
      fetchComplaints();
    }
  };
  
  const hasComplaints = complaints.length > 0;

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={`relative p-2 ${hasComplaints ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'} hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors`}
            title="Notificações Pendentes"
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Manutenções
              </h3>
              <Link 
                to="/admin/manutencao" 
                onClick={() => setIsOpen(false)}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center"
              >
                Ver Todas <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : hasComplaints ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {complaints.slice(0, 5).map((c) => (
                  <div 
                    key={c.id} 
                    className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          Kit {String(c.apartment_number).padStart(2, '0')} - {categoryMap[c.category] || c.category}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {c.description}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteComplaint(c.id, c.apartment_number);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-full ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {complaints.length > 5 && (
                  <p className="text-[10px] text-center text-slate-500 pt-2">
                    E mais {complaints.length - 5} outras...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                Nenhuma manutenção pendente.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <AdminReplyDialog
        isOpen={!!replyingTo}
        onClose={() => setReplyingTo(null)}
        onSuccess={() => {
          if (replyingTo) {
            handleDeleteComplaint(replyingTo.id, replyingTo.apartment_number);
          }
        }}
        tenant={replyingTo ? { id: replyingTo.tenant_id, name: replyingTo.tenant_name } : null}
      />
    </>
  );
};

export default RepairNotificationIcon;