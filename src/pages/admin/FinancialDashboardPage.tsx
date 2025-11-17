import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, TrendingUp, TrendingDown, DollarSign, Loader2, BarChart2 } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { Transaction } from '../../types';
import TransactionFormDialog from '../../components/admin/TransactionFormDialog';
import TransactionListItem from '../../components/admin/TransactionListItem';
import FinancialChart from '../../components/admin/FinancialChart';
import { Button } from '../../components/ui/Button';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import toast from 'react-hot-toast';

const FinancialDashboardPage: React.FC = () => {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const handleOpenAddDialog = () => {
    setTransactionToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTransactionToEdit(null);
  };

  const handleSuccess = () => {
    toast.success(`Transação ${transactionToEdit ? 'atualizada' : 'adicionada'} com sucesso!`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação? Esta ação é irreversível.')) {
      const toastId = toast.loading('Excluindo transação...');
      try {
        await deleteTransaction(id);
        toast.success('Transação excluída com sucesso!', { id: toastId });
      } catch (error) {
        toast.error('Falha ao excluir a transação.', { id: toastId });
      }
    }
  };

  const monthlySummary = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const currentMonthTransactions = transactions.filter(t => 
      isWithinInterval(new Date(t.transaction_date), { start, end })
    );

    const totalRevenue = currentMonthTransactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
    };
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Painel Principal
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Painel de Receitas e Despesas
            </h1>
            <Button onClick={handleOpenAddDialog}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar Transação
            </Button>
          </div>

          {/* Resumo Mensal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-green-600">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Receita do Mês</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(monthlySummary.totalRevenue)}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-red-600">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Despesa do Mês</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(monthlySummary.totalExpense)}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-blue-600">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Lucro do Mês</p>
              <div className="flex items-center mt-1">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(monthlySummary.netProfit)}</span>
              </div>
            </div>
          </div>

          {/* Gráfico Financeiro */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg mb-8">
            <h2 className="p-4 text-lg font-semibold border-b border-slate-200 dark:border-slate-700 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2" />
              Resumo Visual Mensal
            </h2>
            <div className="p-4">
              {loading ? (
                <div className="text-center p-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
              ) : (
                <FinancialChart transactions={transactions} />
              )}
            </div>
          </div>

          {/* Lista de Transações */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <h2 className="p-4 text-lg font-semibold border-b border-slate-200 dark:border-slate-700">Histórico de Transações</h2>
            {loading ? (
              <div className="text-center p-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
            ) : transactions.length === 0 ? (
              <p className="p-10 text-center text-slate-500 dark:text-slate-400">Nenhuma transação registrada ainda.</p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {transactions.map(t => (
                  <TransactionListItem key={t.id} transaction={t} onEdit={handleOpenEditDialog} onDelete={() => handleDelete(t.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <TransactionFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        transactionToEdit={transactionToEdit}
        addTransaction={addTransaction}
        updateTransaction={updateTransaction}
      />
    </>
  );
};

export default FinancialDashboardPage;