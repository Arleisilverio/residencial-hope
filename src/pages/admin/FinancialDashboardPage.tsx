import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const FinancialDashboardPage: React.FC = () => {
  // Por enquanto, esta página será um placeholder.
  // Nas próximas fases, adicionaremos os gráficos e a gestão de transações aqui.

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel Principal
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Painel de Receitas e Despesas
        </h1>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Em Construção</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            A funcionalidade de gestão de transações, dashboards e relatórios será implementada aqui nas próximas etapas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboardPage;