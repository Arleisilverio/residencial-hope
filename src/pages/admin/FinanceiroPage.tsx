import React from 'react';

const FinanceiroPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Gerenciamento Financeiro
        </h1>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p className="text-slate-600">
            Esta é a página de gerenciamento financeiro. Aqui você poderá visualizar e gerenciar pagamentos, aluguéis e despesas.
          </p>
          {/* Futuramente, componentes de relatórios e ações financeiras serão adicionados aqui. */}
        </div>
      </div>
    </div>
  );
};

export default FinanceiroPage;