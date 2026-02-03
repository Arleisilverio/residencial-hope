import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, History, CheckCircle, DollarSign, XCircle, Clock, Download, FileText } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface PaymentRecord {
  id: string;
  amount: number;
  payment_date: string;
  status: 'paid' | 'partial' | 'overdue' | 'pending';
  description: string;
}

const N8N_REPORT_WEBHOOK = 'https://n8n.motoboot.com.br/webhook-test/boas-vindas';

const PaymentHistory: React.FC = () => {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Buscamos transações de receita que contenham o ID do usuário na descrição
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, transaction_date, description')
      .eq('type', 'revenue')
      .ilike('description', `%${user.id}%`)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching payment history:', error);
      setHistory([]);
    } else {
      const formattedHistory = data.map(item => ({
        id: item.id,
        amount: item.amount,
        payment_date: item.transaction_date,
        status: 'paid' as const,
        description: item.description.split(' - ')[0], // Remove o ID da descrição para exibir
      }));
      setHistory(formattedHistory);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const downloadCSV = () => {
    if (history.length === 0) return;

    const headers = ['Data', 'Descricao', 'Valor'];
    const rows = history.map(h => [
      format(new Date(h.payment_date), 'dd/MM/yyyy'),
      h.description,
      h.amount.toString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_pagamentos_${profile?.full_name?.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Lista baixada com sucesso!');
  };

  const requestFormalReport = async () => {
    const toastId = toast.loading('Solicitando relatório ao sistema...');
    try {
      await fetch(N8N_REPORT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'formal_report_request',
          tenant_id: user?.id,
          tenant_name: profile?.full_name,
          apartment: profile?.apartment_number,
          timestamp: new Date().toISOString()
        }),
      });
      toast.success('Solicitação enviada! Você receberá o relatório em breve.', { id: toastId });
    } catch (e) {
      toast.error('Erro ao solicitar relatório.', { id: toastId });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Lógica de 3 meses (aprox 90 dias)
  const daysInContract = profile?.move_in_date 
    ? differenceInDays(new Date(), new Date(profile.move_in_date)) 
    : 0;
  const canRequestReport = daysInContract >= 90;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b dark:border-slate-700 pb-3">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
          <History className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" />
          Histórico de Pagamentos
        </h2>
        <div className="flex space-x-2">
            {canRequestReport && (
                <button 
                    onClick={requestFormalReport}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                    title="Baixar Relatório Formal (PDF)"
                >
                    <FileText className="w-5 h-5" />
                </button>
            )}
            <button 
                onClick={downloadCSV}
                disabled={history.length === 0}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition-colors disabled:opacity-30"
                title="Baixar Lista (CSV)"
            >
                <Download className="w-5 h-5" />
            </button>
        </div>
      </div>

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
          {history.map((record) => (
            <li key={record.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
              <div className="flex items-center min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
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
          ))}
        </ul>
      )}
    </div>
  );
};

export default PaymentHistory;