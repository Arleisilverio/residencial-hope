import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom'; 

const FinanceiroPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Gerenciamento de Aluguéis
        </h1>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center text-slate-500 dark:text-slate-400">
          Conteúdo financeiro será reconstruído aqui.
        </div>
      </div>
    </div>
  );
};

export default FinanceiroPage;