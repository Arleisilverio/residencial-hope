import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X, Loader2, Send } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import AdminReplyDialog from './AdminReplyDialog';

interface MessageNotification {
  id: string;
  apartment_number: number;
  description: string;
  tenant_id: string;
  tenant_name: string;
  created_at: string;
}

const AdminMessageBell: React.FC = () => {
  const [messages, setMessages] = useState<MessageNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageNotification | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select(`id, apartment_number, description, tenant_id, created_at, tenant:profiles(full_name)`)
      .eq('category', 'message')
      .eq('status', 'new')
      .order('created_at', { ascending: false });

    if (!error) {
      const formattedData: MessageNotification[] = data.map(m => ({
        id: m.id,
        apartment_number: m.apartment_number,
        description: m.description,
        tenant_id: m.tenant_id,
        tenant_name: (m.tenant as any)?.full_name || 'Inquilino',
        created_at: m.created_at,
      }));
      setMessages(formattedData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel('admin-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints', filter: "category=eq.message" }, () => {
          fetchMessages();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchMessages]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('complaints').update({ status: 'resolved' }).eq('id', id);
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={`relative p-2 ${hasMessages ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'} hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors`}
            title="Mensagens dos Inquilinos"
          >
            <MessageSquare className="w-5 h-5" />
            {hasMessages && (
              <span className="absolute top-0 right-0 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 text-white text-[10px] font-bold items-center justify-center">
                  {messages.length}
                </span>
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 z-50 border bg-popover text-popover-foreground" align="end">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Mensagens Recebidas
            </h3>

            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : hasMessages ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {messages.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Kit {String(m.apartment_number).padStart(2, '0')} • {m.tenant_name}</p>
                      <button onClick={() => markAsRead(m.id)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-3">{m.description}</p>
                    <button 
                      onClick={() => { setIsOpen(false); setReplyingTo(m); }}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center hover:underline"
                    >
                      <Send className="w-3 h-3 mr-1" /> RESPONDER
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma mensagem nova.</p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <AdminReplyDialog
        isOpen={!!replyingTo}
        onClose={() => setReplyingTo(null)}
        onSuccess={() => { if (replyingTo) markAsRead(replyingTo.id); }}
        tenant={replyingTo ? { id: replyingTo.tenant_id, name: replyingTo.tenant_name } : null}
      />
    </>
  );
};

export default AdminMessageBell;