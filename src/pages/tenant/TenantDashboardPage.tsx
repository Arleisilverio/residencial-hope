import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Apartment } from '../../types';
import { supabase } from '../../services/supabase';
import { DollarSign, Home } from 'lucide-react';

const TenantDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loadingApartment, setLoadingApartment] = useState(true);

  useEffect(() => {
    const fetchApartmentDetails = async () => {
      if (!profile?.apartment_number) {
        setLoadingApartment(false);
        return;
      }

      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .eq('number', profile.apartment_number)
        .single();

      if (error) {
        console.error('Error fetching apartment details:', error);
      } else {
        setApartment(data as Apartment);
      }
      setLoadingApartment(false);
    };

    fetchApartmentDetails();
  }, [profile]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Não informado';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Bem-vindo, {profile?.full_name?.split(' ')[0] || 'Inquilino'}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Informações do Apartamento */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2 text-slate-500" />
            Seu Apartamento
          </h2>
          <p className="text-4xl font-bold text-slate-900 mb-4">
            Kit {String(profile?.apartment_number || 'N/A').padStart(2, '0')}
          </p>
          
          {loadingApartment ? (
            <p className="text-slate-500">Carregando detalhes...</p>
          ) : (
            <div className="flex items-center text-sm p-3 bg-green-50 rounded-md border border-green-200">
              <DollarSign className="w-4 h-4 mr-3 text-green-600" />
              <span className="text-green-700 font-semibold">
                Aluguel Mensal: {formatCurrency(apartment?.monthly_rent)}
              </span>
            </div>
          )}
        </div>

        {/* Outros cards futuros */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Avisos e Pagamentos</h2>
          <p className="text-slate-600">
            Aqui você poderá gerenciar seus pagamentos e reservas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboardPage;