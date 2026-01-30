import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, X, Loader2, MessageSquare, Send, AlertCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import AdminReplyDialog from './AdminReplyDialog';

interface ComplaintNotification {
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              Solicitações de Manutenção
            </h3>
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : hasComplaints ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {complaints.map((c) => {
                  const isIA = c.description.includes('[IA -');
                  const isHighPriority = c.description.includes('ALTA');
                  const isMessage = c.category === 'message';
                  
                  let bgColor = 'bg-slate-50 dark:bg-slate-700/50';
                  let borderColor = 'border-slate-200 dark:border-slate-700';
                  
                  if (isHighPriority) {
                    bgColor = 'bg-red-50 dark:bg-red-900/20';
                    borderColor = 'border-red-200 dark:border-red-800';
                  } else if (isIA) {
                    bgColor = 'bg-blue-50 dark:bg-blue-900/20';
                    borderColor = 'border-blue-200 dark:border-blue-800';
                  }

                  const Icon = isMessage ? MessageSquare : (isIA ? AlertCircle : Wrench);

                  return (
                    <div key={c.id} className={`p-3 rounded-lg border transition-all ${bgColor} ${borderColor}`}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1 pr-2 flex items-start">
                          <Icon className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${isHighPriority ? 'text-red-600' : 'text-blue-600'}`} />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              Kit {String(c.apartment_number).padStart(2, '0')} - {categoryMap[c.category] || c.category}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-3" title={c.description}>
                              {c.description}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 italic">
                              Enviado por: {c.tenant_name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteComplaint(c.id, c.apartment_number)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors flex-shrink-0 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => setReplyingTo(c)}
                          className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Send className="w-3 h-3 mr-1.5" />
                          Responder no App
                        </button>
                      </div>
                    </div>
                  );
                })}
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