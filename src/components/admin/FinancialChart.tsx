import React, { useMemo } from 'react';
import { Transaction } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialChartProps {
  transactions: Transaction[];
}

// Helper array for correct month sorting
const monthOrder = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez'
];

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: { name: string; revenue: number; expense: number } } = {};

    transactions.forEach(t => {
      // Format to 'mmm/yy' and remove the dot that pt-BR locale sometimes adds (e.g., 'mai.')
      const monthName = format(parseISO(t.transaction_date), 'MMM', { locale: ptBR }).replace('.', '');
      const year = format(parseISO(t.transaction_date), 'yy');
      const monthKey = `${monthName}/${year}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { name: monthKey, revenue: 0, expense: 0 };
      }
      if (t.type === 'revenue') {
        monthlyData[monthKey].revenue += t.amount;
      } else {
        monthlyData[monthKey].expense += t.amount;
      }
    });

    // Sort the data chronologically using the helper array
    return Object.values(monthlyData).sort((a, b) => {
        const [aMonthStr, aYear] = a.name.split('/');
        const [bMonthStr, bYear] = b.name.split('/');

        const aDate = new Date(parseInt(`20${aYear}`), monthOrder.indexOf(aMonthStr.toLowerCase()));
        const bDate = new Date(parseInt(`20${bYear}`), monthOrder.indexOf(bMonthStr.toLowerCase()));
        
        return aDate.getTime() - bDate.getTime();
    }).slice(-12); // Show the last 12 months
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (chartData.length === 0) {
    return (
        <div className="text-center p-10 text-slate-500 dark:text-slate-400">
            Não há dados suficientes para exibir o gráfico. Adicione algumas transações.
        </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `R$${(value as number / 1000)}k`} />
          <Tooltip formatter={(value) => formatCurrency(value as number)} />
          <Legend />
          <Bar dataKey="revenue" fill="#22c55e" name="Receita" />
          <Bar dataKey="expense" fill="#ef4444" name="Despesa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;