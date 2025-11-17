import React from 'react';
import { Transaction } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownCircle, ArrowUpCircle, Edit, Trash2 } from 'lucide-react';

interface TransactionListItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({ transaction, onEdit, onDelete }) => {
  const isRevenue = transaction.type === 'revenue';
  const amountColor = isRevenue ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const Icon = isRevenue ? ArrowUpCircle : ArrowDownCircle;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <Icon className={`w-8 h-8 flex-shrink-0 ${amountColor}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{transaction.description}</p>
          <div className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400">
            <span>{format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
            {transaction.type === 'expense' && <span>•</span>}
            {transaction.type === 'expense' && <span>{transaction.category}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
        <p className={`text-lg font-bold ${amountColor}`}>{formatCurrency(transaction.amount)}</p>
        <div className="flex items-center">
          <button onClick={() => onEdit(transaction)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(transaction.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionListItem;