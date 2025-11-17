import React, { useState } from 'react';
import { MoreVertical, CheckCircle, Clock, XCircle, Loader2, DollarSign, Bell } from 'lucide-react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { RentStatus } from '../../types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';

interface RentStatusMenuProps {
  apartmentNumber: number;
  tenantId: string;
  rentAmount: number;
  currentStatus: RentStatus;
  onStatusChange: () => void; // Recarga global
  onLocalStatusChange: (newStatus: RentStatus) => void; // Atualização otimista local
  onOpenPartialPayment: () => void; // Novo prop para abrir o diálogo de pagamento parcial
}

const statusOptions: { value: RentStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'paid', label: 'Pago', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  { value: 'partial', label: 'Pag. Parcial', icon: DollarSign, color: 'text-pink-600 bg-pink-100' },
  { value: 'pending', label: 'Pendente', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
  { value: 'overdue', label: 'Atrasado', icon: XCircle, color: 'text-red-600 bg-red-100' },
];

const RentStatusMenu: React.FC<RentStatusMenuProps> = ({ apartmentNumber, tenantId, rentAmount, currentStatus, onStatusChange, onLocalStatusChange, onOpenPartialPayment }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sendNotification = async (status: RentStatus, aptNumber: number) => {
    const statusLabel = statusOptions.find(s => s.value === status)?.label || 'Status Atualizado';
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        tenant_id: tenantId,
        title: `Status do Aluguel - Kit ${String(aptNumber).padStart(2, '0')}`,
        message: `O status do seu aluguel foi alterado para: ${statusLabel}.`,
        icon: 'DollarSign', // Usamos um ícone genérico para finanças
        read: false,
        dismissible: true,
      });

    if (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Falha ao notificar o inquilino.', { icon: <Bell className="w-5 h-5" /> });
    }
  };

  const createRevenueTransaction = async (aptNumber: number, amount: number) => {
    const { error } = await supabase
      .from('transactions')
      .insert({
        type: 'revenue',
        category: 'Receita de Aluguel',
        description: `Recebimento de Aluguel - Kit ${String(aptNumber).padStart(2, '0')}`,
        amount: amount,
        transaction_date: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Erro ao criar transação de receita:', error);
      toast.error('Falha ao registrar a receita no painel financeiro.');
    }
  };

  const handleUpdateStatus = async (newStatus: RentStatus) => {
    if (newStatus === currentStatus) {
      setIsMenuOpen(false);
      return;
    }
    
    if (newStatus === 'partial') {
        setIsMenuOpen(false);
        onOpenPartialPayment();
        return;
    }

    onLocalStatusChange(newStatus);
    setIsMenuOpen(false); 

    setIsUpdating(true);
    const toastId = toast.loading(`Atualizando Kit ${String(apartmentNumber).padStart(2, '0')}...`);

    try {
        const updatePayload: any = { 
            rent_status: newStatus,
            payment_request_pending: false
        };

        updatePayload.amount_paid = null;
        updatePayload.remaining_balance = null;

        const { error: updateError } = await supabase
          .from('apartments')
          .update(updatePayload)
          .eq('number', apartmentNumber);

        if (updateError) throw updateError;
        
        // Se o status for 'pago', cria a transação de receita
        if (newStatus === 'paid') {
          await createRevenueTransaction(apartmentNumber, rentAmount);
        }
        
        await sendNotification(newStatus, apartmentNumber);

        toast.success(`Status do Kit ${String(apartmentNumber).padStart(2, '0')} atualizado!`, { id: toastId });
        
    } catch (error) {
        console.error('Update error:', error);
        toast.error(`Erro ao atualizar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, { id: toastId });
    } finally {
        onStatusChange(); 
        setIsUpdating(false);
    }
  };

  return (
    <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isUpdating}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
          title="Mudar Status do Aluguel"
        >
          {isUpdating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <MoreVertical className="w-5 h-5" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 z-50 border bg-popover text-popover-foreground">
        <div className="py-1">
          {statusOptions.map((option) => {
            const isSelected = option.value === currentStatus;
            
            let circleColor = 'bg-gray-400';
            if (option.value === 'paid') circleColor = 'bg-green-500';
            else if (option.value === 'pending') circleColor = 'bg-yellow-500';
            else if (option.value === 'overdue') circleColor = 'bg-red-500';
            else if (option.value === 'partial') circleColor = 'bg-pink-500';

            return (
              <button
                key={option.value}
                onClick={() => handleUpdateStatus(option.value)}
                className={`flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 ${isSelected ? 'font-semibold bg-slate-50 dark:bg-slate-700/50' : ''}`}
                role="menuitem"
              >
                <span className={`w-3 h-3 rounded-full mr-3 ${circleColor}`}></span>
                {option.label}
                {isSelected && <CheckCircle className="w-4 h-4 ml-auto text-blue-600" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RentStatusMenu;