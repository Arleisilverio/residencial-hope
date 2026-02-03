import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';

interface TenantMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TenantMessageDialog: React.FC<TenantMessageDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile || !profile.apartment_number) {
      toast.error('Erro de autenticação.');
      return;
    }
    if (description.trim().length === 0) {
        toast.error('A mensagem não pode estar vazia.');
        return;
    }

    setLoading(true);
    const toastId = toast.loading('Enviando mensagem...');

    try {
      const { error } = await supabase
        .from('complaints')
        .insert({
          tenant_id: user.id,
          apartment_number: profile.apartment_number,
          category: 'message',
          description: description,
          status: 'new',
        });

      if (error) throw error;

      toast.success('Mensagem enviada com sucesso!', { id: toastId });
      setDescription('');
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Falha ao enviar a mensagem.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Enviar Mensagem para Administração">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message-description" className="text-sm font-medium text-slate-700 dark:text-slate-300">Sua Mensagem</label>
          <Textarea
            id="message-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Digite sua dúvida ou comunicado aqui..."
            required
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

export default TenantMessageDialog;