import React, { useState } from 'react';
import { MoreVertical, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { RentStatus } from '../../types';

// Assumindo que DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem estão disponíveis
// Se não estiverem, usaremos um componente simples de menu.
// Como não tenho acesso aos arquivos shadcn/ui, vou criar um menu simples baseado em Popover/Button.

interface RentStatusMenuProps {
  apartmentNumber: number;
  currentStatus: RentStatus;
  onStatusChange: () => void;
}

const statusOptions: { value: RentStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'paid', label: 'Pago', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  { value: 'pending', label: 'Pendente', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
  { value: 'overdue', label: 'Atrasado', icon: XCircle, color: 'text-red-600 bg-red-100' },
];

const RentStatusMenu: React.FC<RentStatusMenuProps> = ({ apartmentNumber, currentStatus, onStatusChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (newStatus: RentStatus) => {
    if (newStatus === currentStatus) {
      setIsMenuOpen(false);
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading(`Atualizando Kit ${String(apartmentNumber).padStart(2, '0')}...`);

    const { error } = await supabase
      .from('apartments')
      .update({ rent_status: newStatus })
      .eq('number', apartmentNumber);

    if (error) {
      toast.error(`Erro ao atualizar status: ${error.message}`, { id: toastId });
    } else {
      toast.success(`Status do Kit ${String(apartmentNumber).padStart(2, '0')} atualizado para ${statusOptions.find(s => s.value === newStatus)?.label}!`, { id: toastId });
      onStatusChange(); // Recarrega os dados na página principal
    }

    setIsUpdating(false);
    setIsMenuOpen(false);
  };

  const currentStatusOption = statusOptions.find(s => s.value === currentStatus);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        disabled={isUpdating}
        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        title="Mudar Status do Aluguel"
      >
        {isUpdating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <MoreVertical className="w-5 h-5" />
        )}
      </button>

      {isMenuOpen && (
        <div
          className="absolute right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
          onBlur={() => setIsMenuOpen(false)}
          tabIndex={-1}
        >
          <div className="py-1">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = option.value === currentStatus;
              return (
                <button
                  key={option.value}
                  onClick={() => handleUpdateStatus(option.value)}
                  className={`flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 ${isSelected ? 'font-semibold bg-slate-50' : ''}`}
                  role="menuitem"
                >
                  <span className={`w-3 h-3 rounded-full mr-3 ${option.value === 'paid' ? 'bg-green-500' : option.value === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                  {option.label}
                  {isSelected && <CheckCircle className="w-4 h-4 ml-auto text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RentStatusMenu;