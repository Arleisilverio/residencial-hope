import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, History, CheckCircle, DollarSign, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PaymentRecord {
  id: string;
  amount: number;
  payment_date: string;
  status: 'paid' | 'partial' | 'overdue' | 'pending';
  description: string;
}

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, transaction_date, description')
      .eq('type', 'revenue')
      .like('description', `%${user.id}%`) // Filtra pela descrição que contém o ID do inquilino
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching payment history:', error);
      setHistory([]);
    } else {
      const formattedHistory = data.map(item => ({
        id: item.id,
        amount: item.amount,
        payment_date: item.transaction_date,
        status: 'paid' as const, // Todas as transações de receita são consideradas 'paid'
        description: item.description,
      }));
      setHistory(formattedHistory);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const statusMap = {
    paid: { label: 'Pago', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
    partial: { label: 'Parcial', icon: DollarSign, color: 'text-pink-600 dark:text-pink-400' },
    overdue: { label: 'Atrasado', icon: XCircle, color: 'text-red-600 dark:text-red-400' },
    pending: { label: 'Pendente', icon: Clock, color: 'text-yellow-600 dark:text-yellow-400' },
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center border-b dark:border-slate-700 pb-3">
        <History className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" />
        Histórico de Pagamentos
      </h2>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-slate-500 dark:text-slate-400" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">Nenhum histórico de pagamento encontrado.</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {history.map((record) => {
            const statusInfo = statusMap[record.status];
            const Icon = statusInfo.icon;
            return (
              <li key={record.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                <div className="flex items-center min-w-0">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${statusInfo.color.replace('text-', 'bg-').replace('-600', '-100').replace('-400', '/20 dark:bg-green-900')}`}>
                    <Icon className={`w-5 h-5 ${statusInfo.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {record.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {format(new Date(record.payment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-bold text-green-600 dark:text-green-400 ml-2">
                  {formatCurrency(record.amount)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PaymentHistory;