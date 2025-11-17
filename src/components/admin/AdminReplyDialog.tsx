import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

interface AdminReplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant: { id: string; name: string } | null;
}

const AdminReplyDialog: React.FC<AdminReplyDialogProps> = ({ isOpen, onClose, onSuccess, tenant }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant) {
      toast.error('Inquilino não identificado.');
      return;
    }
    if (message.trim().length === 0) {
      toast.error('A resposta não pode estar vazia.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Enviando resposta...');

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          tenant_id: tenant.id,
          title: 'Resposta da Administração',
          message: message,
          icon: 'MessageSquare', // Ícone para respostas
        });

      if (error) {
        throw error;
      }

      toast.success('Resposta enviada com sucesso!', { id: toastId });
      setMessage('');
      onSuccess(); // Chama a função para limpar a notificação original
      onClose();

    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast.error('Falha ao enviar a resposta.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!tenant) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Responder para ${tenant.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reply-message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Sua Resposta
          </label>
          <Textarea
            id="reply-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Digite sua resposta aqui..."
            required
            className="mt-1"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar Resposta'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AdminReplyDialog;