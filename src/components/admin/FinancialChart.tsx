import React, { useMemo } from 'react';
import { Transaction } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialChartProps {
  transactions: Transaction[];
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: { name: string; revenue: number; expense: number } } = {};

    transactions.forEach(t => {
      const month = format(parseISO(t.transaction_date), 'MMM/yy', { locale: ptBR });
      if (!monthlyData[month]) {
        monthlyData[month] = { name: month, revenue: 0, expense: 0 };
      }
      if (t.type === 'revenue') {
        monthlyData[month].revenue += t.amount;
      } else {
        monthlyData[month].expense += t.amount;
      }
    });

    // Ordena os dados por data para exibir corretamente no gráfico
    return Object.values(monthlyData).sort((a, b) => {
        const [aMonth, aYear] = a.name.split('/');
        const [bMonth, bYear] = b.name.split('/');
        const aDate = new Date(parseInt(`20${aYear}`), ptBR.localize?.month(ptBR.months.findIndex(m => m.slice(0,3) === aMonth), {width: 'abbreviated'}));
        const bDate = new Date(parseInt(`20${bYear}`), ptBR.localize?.month(ptBR.months.findIndex(m => m.slice(0,3) === bMonth), {width: 'abbreviated'}));
        return aDate.getTime() - bDate.getTime();
    }).slice(-12); // Mostra os últimos 12 meses
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