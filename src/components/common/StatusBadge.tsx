import React from 'react';
import { CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import { RentStatus } from '../../types';

interface StatusBadgeProps {
  status: RentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status) return null;

  const statusMap = {
    paid: { label: 'Pago', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', icon: CheckCircle },
    partial: { label: 'Pag. Parcial', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300', icon: DollarSign },
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', icon: Clock },
    overdue: { label: 'Atrasado', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', icon: XCircle },
  };

  const statusData = statusMap[status] || { label: 'Desconhecido', color: 'bg-slate-100 text-slate-700', icon: Clock };
  const { label, color, icon: Icon } = statusData;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

export default StatusBadge;