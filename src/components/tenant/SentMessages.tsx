import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Complaint } from '../../types';
import { Loader2, Check, CheckCheck, Trash2, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SentMessages: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('tenant_id', user.id)
      .eq('category', 'message')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      toast.error('Não foi possível carregar suas mensagens.');
    } else {
      setMessages(data as Complaint[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, refreshTrigger]);

  const handleDelete = async (messageId: string) => {
    if (!window.confirm('Tem certeza que deseja apagar esta mensagem?')) return;

    const originalMessages = messages;
    setMessages(prev => prev.filter(m => m.id !== messageId));

    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', messageId);

    if (error) {
      toast.error('Falha ao apagar a mensagem.');
      setMessages(originalMessages);
    } else {
      toast.success('Mensagem apagada.');
    }
  };

  const StatusIcon = ({ status }: { status: Complaint['status'] }) => {
    if (status === 'in_progress') {
      return <CheckCheck className="w-4 h-4 text-blue-500" title="Visto pelo administrador" />;
    }
    return <Check className="w-4 h-4 text-slate-400" title="Enviado" />;
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Mensagens Enviadas</h2>
      {loading ? (
        <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <Inbox className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 dark:text-slate-400">Nenhuma mensagem enviada.</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {messages.map(msg => (
            <li key={msg.id} className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">{msg.description}</p>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <StatusIcon status={msg.status} />
                  <span className="ml-1.5">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ptBR })}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(msg.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-full ml-2 transition-colors" title="Apagar mensagem">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SentMessages;