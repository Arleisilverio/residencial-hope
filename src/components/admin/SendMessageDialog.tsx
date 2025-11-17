import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import { Profile } from '../../types';

interface SendMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant: Profile | null;
}

const SendMessageDialog: React.FC<SendMessageDialogProps> = ({ isOpen, onClose, onSuccess, tenant }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant) {
      toast.error('Inquilino não selecionado.');
      return;
    }
    if (message.trim().length === 0) {
      toast.error('A mensagem não pode estar vazia.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Enviando mensagem...');

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          tenant_id: tenant.id,
          title: 'Aviso da Administração',
          message: message,
          icon: 'Info', // Ícone padrão para avisos
        });

      if (error) {
        throw error;
      }

      toast.success('Mensagem enviada com sucesso!', { id: toastId });
      setMessage('');
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Falha ao enviar a mensagem. Tente novamente.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!tenant) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Enviar Mensagem para ${tenant.full_name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Mensagem
          </label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Digite seu aviso ou mensagem aqui..."
            required
            className="mt-1"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            <MessageSquare className="w-4 h-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default SendMessageDialog;