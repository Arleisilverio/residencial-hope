import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const TenantDashboardPage: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Bem-vindo, {profile?.full_name || 'Inquilino'}!
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-slate-600">
          Este é o painel do inquilino. Aqui você poderá gerenciar suas informações, pagamentos e reservas.
        </p>
        {/* Conteúdo futuro do inquilino */}
      </div>
    </div>
  );
};

export default TenantDashboardPage;