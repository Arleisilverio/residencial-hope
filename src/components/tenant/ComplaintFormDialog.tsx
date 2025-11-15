import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { Wrench } from 'lucide-react';

interface ComplaintFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  { value: 'hidraulica', label: 'Hidráulica' },
  { value: 'eletrica', label: 'Elétrica' },
  { value: 'estrutura', label: 'Estrutura' },
  { value: 'outros', label: 'Outros' },
];

const ComplaintFormDialog: React.FC<ComplaintFormDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const [category, setCategory] = useState(categories[0].value);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile || !profile.apartment_number) {
      toast.error('Erro de autenticação ou apartamento não definido.');
      return;
    }

    if (description.length > 160) {
      toast.error('A descrição deve ter no máximo 160 caracteres.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Enviando solicitação...');

    try {
      const { error } = await supabase
        .from('complaints')
        .insert({
          tenant_id: user.id,
          apartment_number: profile.apartment_number,
          category: category,
          description: description,
          status: 'new', // Status inicial
        });

      if (error) {
        throw error;
      }

      toast.success('Solicitação de reparo enviada com sucesso!', { id: toastId });
      setDescription('');
      setCategory(categories[0].value);
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Erro ao enviar reclamação:', error);
      toast.error('Falha ao enviar a solicitação. Tente novamente.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Solicitar Reparo ou Manutenção">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria do Reparo</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 mt-1"
            required
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição Breve (máx. 160 caracteres)</label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="Ex: O chuveiro do banheiro parou de esquentar."
            required
          />
          <p className="text-xs text-right text-slate-500 dark:text-slate-400 mt-1">
            {description.length} / 160
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            <Wrench className="w-4 h-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ComplaintFormDialog;