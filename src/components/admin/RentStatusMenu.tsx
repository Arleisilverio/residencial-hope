import React, { useState } from 'react';
import { MoreVertical, CheckCircle, Clock, XCircle, Loader2, DollarSign } from 'lucide-react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { RentStatus } from '../../types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover'; // Usando Popover

interface RentStatusMenuProps {
  apartmentNumber: number;
  currentStatus: RentStatus;
  onStatusChange: () => void; // Recarga global
  onLocalStatusChange: (newStatus: RentStatus) => void; // Atualização otimista local
}

const statusOptions: { value: RentStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'paid', label: 'Pago', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  { value: 'partial', label: 'Pag. Parcial', icon: DollarSign, color: 'text-pink-600 bg-pink-100' },
  { value: 'pending', label: 'Pendente', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
  { value: 'overdue', label: 'Atrasado', icon: XCircle, color: 'text-red-600 bg-red-100' },
];

const RentStatusMenu: React.FC<RentStatusMenuProps> = ({ apartmentNumber, currentStatus, onStatusChange, onLocalStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Controla o estado do Popover

  const handleUpdateStatus = async (newStatus: RentStatus) => {
    if (newStatus === currentStatus) {
      setIsMenuOpen(false);
      return;
    }

    // 1. Atualização otimista local (para todos, exceto 'partial', que é tratado no FinanceiroPage)
    if (newStatus !== 'partial') {
        onLocalStatusChange(newStatus);
    }
    
    setIsMenuOpen(false); // Fecha o menu imediatamente

    // Se for 'partial', o FinanceiroPage abre o diálogo, e a atualização do DB é feita lá.
    if (newStatus === 'partial') {
        // A função onLocalStatusChange no FinanceiroPage já está configurada para abrir o diálogo
        // quando recebe 'partial', então não precisamos fazer nada aqui além de fechar o menu.
        return;
    }

    setIsUpdating(true);
    const toastId = toast.loading(`Atualizando Kit ${String(apartmentNumber).padStart(2, '0')}...`);

    // 2. Atualização no banco de dados (apenas para status que não são 'partial')
    const { error } = await supabase
      .from('apartments')
      .update({ rent_status: newStatus })
      .eq('number', apartmentNumber);

    if (error) {
      // Se falhar, a recarga global (onStatusChange) irá reverter o estado local
      toast.error(`Erro ao atualizar status: ${error.message}`, { id: toastId });
    } else {
      toast.success(`Status do Kit ${String(apartmentNumber).padStart(2, '0')} atualizado para ${statusOptions.find(s => s.value === newStatus)?.label}!`, { id: toastId });
    }

    // 3. Recarga global para sincronizar todos os dados (e reverter se houver erro)
    onStatusChange(); 
    setIsUpdating(false);
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
      <PopoverContent className="w-48 p-0 z-50">
        <div className="py-1">
          {statusOptions.map((option) => {
            const isSelected = option.value === currentStatus;
            
            // Define a cor do círculo de status
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