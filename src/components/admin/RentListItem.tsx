import React from 'react';
import { Apartment, RentStatus } from '../../types';
import { Home, User, DollarSign, Calendar } from 'lucide-react';
import RentStatusMenu from './RentStatusMenu';
import StatusBadge from '../common/StatusBadge';

interface RentListItemProps {
  apartment: Apartment;
  onStatusChange: () => void;
  onLocalStatusChange: (apartmentNumber: number, newStatus: RentStatus) => void;
}

const RentListItem: React.FC<RentListItemProps> = ({ apartment, onStatusChange, onLocalStatusChange }) => {
  const { number, tenant, monthly_rent, rent_status, next_due_date } = apartment;
  
  // Garantir que o tenant exista, pois estamos filtrando apenas ocupados
  if (!tenant) return null; 

  const rentValue = monthly_rent || (number >= 1 && number <= 6 ? 1600 : 1800);
  const currentStatus = rent_status || 'pending'; // Status inicial é 'pending' se for nulo no DB

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getBackgroundColorClass = (status: RentStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20';
      case 'partial':
        return 'bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-100 dark:hover:bg-pink-900/20';
      case 'overdue':
        return 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20';
      case 'pending':
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20';
    }
  };

  const bgColorClass = getBackgroundColorClass(currentStatus);

  return (
    <div className={`flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-colors ${bgColorClass}`}>
      
      {/* Left Section: Apartment, Tenant, Status, Avatar */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <Home className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 hidden sm:block" />
        
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">Kit {String(number).padStart(2, '0')}</p>
          
          <div className="flex items-center mt-1 space-x-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
              {tenant.avatar_url ? (
                <img 
                  src={tenant.avatar_url} 
                  alt={tenant.full_name || 'Avatar'} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              )}
            </div>
            
            {/* Tenant Name and Status */}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{tenant.full_name}</p>
              <div className="mt-1 flex items-center space-x-3">
                <StatusBadge status={currentStatus} />
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Vencimento: {formatDate(next_due_date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section: Rent Value and Menu */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-slate-500 dark:text-slate-400">Valor</p>
          <div className="flex items-center justify-end text-lg font-bold text-slate-900 dark:text-slate-100">
            <DollarSign className="w-5 h-5 mr-1 text-green-600 dark:text-green-400" />
            <span>{formatCurrency(rentValue)}</span>
          </div>
        </div>

        <RentStatusMenu 
          apartmentNumber={number} 
          tenantId={tenant.id}
          currentStatus={currentStatus} 
          onStatusChange={onStatusChange} 
          onLocalStatusChange={(newStatus) => onLocalStatusChange(number, newStatus)}
        />
      </div>
    </div>
  );
};

export default RentListItem;