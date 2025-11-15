import React, { useState, useEffect } from 'react';
import { Apartment } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PartialPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apartment: Apartment | null;
}

const PartialPaymentDialog: React.FC<PartialPaymentDialogProps> = ({ isOpen, onClose, onSuccess, apartment }) => {
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  
  const rentValue = apartment?.monthly_rent || (apartment?.number ? (apartment.number >= 1 && apartment.number <= 6 ? 1600 : 1800) : 0);
  const remainingAmount = rentValue - (typeof amountPaid === 'number' ? amountPaid : 0);

  useEffect(() => {
    if (isOpen) {
      setAmountPaid('');
    }
  }, [isOpen]);

  if (!apartment) return null;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof amountPaid !== 'number' || amountPaid <= 0) {
      toast.error('Por favor, insira um valor pago válido.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Registrando pagamento parcial...');

    // Atualiza o status do aluguel para 'partial'
    const { error } = await supabase
      .from('apartments')
      .update({ rent_status: 'partial' })
      .eq('number', apartment.number);

    if (error) {
      toast.error(`Erro ao registrar pagamento: ${error.message}`, { id: toastId });
      setLoading(false);
      return;
    }

    // Nota: No futuro, a lógica de registro de transação detalhada deve ser adicionada aqui.
    
    toast.success(`Pagamento parcial de ${formatCurrency(amountPaid)} registrado para o Kit ${String(apartment.number).padStart(2, '0')}.`, { id: toastId });
    
    onSuccess();
    onClose();
    setLoading(false);
  };

  const nextDueDate = apartment.next_due_date ? format(new Date(apartment.next_due_date), 'dd/MM/yyyy', { locale: ptBR }) : 'Não definido';

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Pagamento Parcial - Kit ${String(apartment.number).padStart(2, '0')}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-md border border-slate-200 dark:border-slate-600">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Inquilino: <span className="font-medium text-slate-800 dark:text-slate-200">{apartment.tenant?.full_name || 'N/A'}</span></p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Vencimento: <span className="font-medium text-slate-800 dark:text-slate-200">{nextDueDate}</span></p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Valor Total do Aluguel: <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(rentValue)}</span></p>
        </div>

        <div>
          <label htmlFor="amountPaid" className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor Pago (R$)</label>
          <Input 
            id="amountPaid"
            type="number" 
            step="0.01"
            value={amountPaid} 
            onChange={(e) => setAmountPaid(parseFloat(e.target.value) || '')} 
            required 
            placeholder="Ex: 500.00"
          />
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Valor Restante:</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(remainingAmount)}</p>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Pagamento Parcial'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default PartialPaymentDialog;