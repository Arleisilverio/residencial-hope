import React, { useState, useEffect } from 'react';
import { Apartment, RentStatus } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { DollarSign } from 'lucide-react';

interface PartialPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apartment: Apartment;
}

const PartialPaymentDialog: React.FC<PartialPaymentDialogProps> = ({ isOpen, onClose, onSuccess, apartment }) => {
  const monthlyRent = apartment.monthly_rent || (apartment.number >= 1 && apartment.number <= 6 ? 1600 : 1800);
  
  // Inicializa com valores existentes se houver um pagamento parcial anterior
  const initialAmountPaid = apartment.amount_paid || 0;

  const [amountPaid, setAmountPaid] = useState<number>(initialAmountPaid);
  const [remainingBalance, setRemainingBalance] = useState<number>(monthlyRent - initialAmountPaid);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Recalcula o saldo restante sempre que o valor pago mudar
    const paid = amountPaid || 0;
    setRemainingBalance(monthlyRent - paid);
  }, [amountPaid, monthlyRent]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setAmountPaid(value);
    } else if (e.target.value === '') {
      setAmountPaid(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amountPaid <= 0) {
      toast.error('O valor pago deve ser maior que zero.');
      return;
    }
    if (amountPaid > monthlyRent) {
      toast.error('O valor pago não pode exceder o aluguel mensal.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Registrando pagamento parcial...');

    try {
      // Se o saldo restante for zero ou negativo, o status é 'paid'
      const newStatus: RentStatus = remainingBalance <= 0 ? 'paid' : 'partial';

      const { error } = await supabase
        .from('apartments')
        .update({
          rent_status: newStatus,
          amount_paid: amountPaid,
          remaining_balance: remainingBalance,
          payment_request_pending: false, // Limpa a solicitação
        })
        .eq('number', apartment.number);

      if (error) {
        throw error;
      }

      toast.success(`Pagamento parcial registrado. Status: ${newStatus === 'paid' ? 'Pago' : 'Pag. Parcial'}`, { id: toastId });
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error updating partial payment:', error);
      toast.error('Falha ao registrar o pagamento parcial.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Pagamento Parcial - Kit ${String(apartment.number).padStart(2, '0')}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
          <p className="text-sm text-slate-500 dark:text-slate-400">Aluguel Total:</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(monthlyRent)}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor Pago Agora (R$)</label>
          <Input 
            type="number" 
            step="0.01"
            value={amountPaid === 0 ? '' : amountPaid} 
            onChange={handleAmountChange} 
            placeholder="0.00"
            required 
          />
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-md border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-slate-600 dark:text-slate-300">Saldo Restante:</p>
          <p className={`text-xl font-bold ${remainingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {formatCurrency(remainingBalance)}
          </p>
          {remainingBalance <= 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">O status será alterado para 'Pago'.</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            <DollarSign className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Registrar Pagamento'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default PartialPaymentDialog;