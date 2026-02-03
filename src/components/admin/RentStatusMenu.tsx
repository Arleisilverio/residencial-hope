import React, { useState } from 'react';
import { MoreVertical, CheckCircle, Clock, XCircle, Loader2, DollarSign } from 'lucide-react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { RentStatus } from '../../types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';

interface RentStatusMenuProps {
  apartmentNumber: number;
  tenantId: string;
  tenantName: string;
  rentAmount: number;
  currentStatus: RentStatus;
  onStatusChange: () => void;
  onLocalStatusChange: (newStatus: RentStatus) => void;
  onOpenPartialPayment: () => void;
}

const statusOptions: { value: RentStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'paid', label: 'Pago', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  { value: 'partial', label: 'Pag. Parcial', icon: DollarSign, color: 'text-pink-600 bg-pink-100' },
  { value: 'pending', label: 'Pendente', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
  { value: 'overdue', label: 'Atrasado', icon: XCircle, color: 'text-red-600 bg-red-100' },
];

const RentStatusMenu: React.FC<RentStatusMenuProps> = ({ apartmentNumber, tenantId, tenantName, rentAmount, currentStatus, onStatusChange, onLocalStatusChange, onOpenPartialPayment }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleUpdateStatus = async (newStatus: RentStatus) => {
    setIsMenuOpen(false);

    if (newStatus === currentStatus) return;
    
    if (newStatus === 'partial') {
        onOpenPartialPayment();
        return;
    }

    onLocalStatusChange(newStatus);
    setIsUpdating(true);
    const toastId = toast.loading(`Atualizando Kit ${String(apartmentNumber).padStart(2, '0')}...`);

    try {
        const { error: updateError } = await supabase
          .from('apartments')
          .update({ 
            rent_status: newStatus,
            payment_request_pending: false,
            amount_paid: null,
            remaining_balance: null
          })
          .eq('number', apartmentNumber);

        if (updateError) throw updateError;
        
        if (newStatus === 'paid') {
          await supabase.from('transactions').insert({
            type: 'revenue',
            category: 'Receita de Aluguel',
            description: `Aluguel Kit ${String(apartmentNumber).padStart(2, '0')} - Inquilino: ${tenantName}`,
            amount: rentAmount,
            transaction_date: new Date().toISOString(),
          });
        }
        
        toast.success(`Status do Kit ${String(apartmentNumber).padStart(2, '0')} atualizado!`, { id: toastId });
        onStatusChange(); 
    } catch (error) {
        console.error('Update error:', error);
        toast.error(`Erro ao atualizar status`, { id: toastId });
    } finally {
        setIsUpdating(false);
    }
  };

  return (
    <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
          title="Mudar Status"
        >
          {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreVertical className="w-5 h-5" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 z-50 border bg-popover text-popover-foreground">
        <div className="py-1">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdateStatus(option.value)}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <span className={`w-3 h-3 rounded-full mr-3 ${
                option.value === 'paid' ? 'bg-green-500' : 
                option.value === 'pending' ? 'bg-yellow-500' : 
                option.value === 'overdue' ? 'bg-red-500' : 'bg-pink-500'
              }`}></span>
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RentStatusMenu;