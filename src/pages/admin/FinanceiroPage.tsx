import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import { Home, User, DollarSign, Loader2 } from 'lucide-react';

// Componente para exibir um item da lista financeira
interface RentListItemProps {
  apartment: Apartment;
}

const RentListItem: React.FC<RentListItemProps> = ({ apartment }) => {
  const { number, tenant, monthly_rent } = apartment;
  const isOccupied = !!tenant;
  const rentValue = monthly_rent || (number >= 1 && number <= 6 ? 1600 : 1800);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-4">
        <Home className="w-6 h-6 text-blue-600" />
        <div>
          <p className="text-lg font-semibold text-slate-800">Kit {String(number).padStart(2, '0')}</p>
          <div className="flex items-center text-sm text-slate-600 mt-1">
            <User className="w-4 h-4 mr-2" />
            <span className={isOccupied ? 'text-slate-700' : 'text-red-500 italic'}>
              {isOccupied ? tenant.full_name : 'Vago'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-sm text-slate-500">Aluguel Base</p>
        <div className="flex items-center justify-end text-lg font-bold text-green-700">
          <DollarSign className="w-5 h-5 mr-1" />
          <span>{formatCurrency(rentValue)}</span>
        </div>
      </div>
    </div>
  );
};


const FinanceiroPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Busca todos os apartamentos e seus inquilinos associados
    const { data, error } = await supabase
      .from('apartments')
      .select('*, tenant:profiles(*)')
      .order('number', { ascending: true });

    if (error) {
      console.error('Error fetching apartments:', error);
      setError('Não foi possível carregar os dados financeiros dos apartamentos.');
    } else {
      // Garante que todos os 14 kits estejam presentes, preenchendo os vazios
      const allApartments = Array.from({ length: 14 }, (_, i) => {
          const aptNumber = i + 1;
          const found = data.find(d => d.number === aptNumber);
          return found || { 
            number: aptNumber, 
            status: 'available', 
            tenant_id: null, 
            tenant: null, 
            monthly_rent: null 
          };
      });
      setApartments(allApartments as Apartment[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
        <p className="text-slate-600">Carregando dados financeiros...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Gerenciamento de Aluguéis
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg divide-y divide-slate-200">
          {apartments.map((apt) => (
            <RentListItem key={apt.number} apartment={apt} />
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-slate-100 rounded-lg text-sm text-slate-600">
          <p>Total de Unidades: 14</p>
          <p>Unidades Ocupadas: {apartments.filter(a => a.tenant_id).length}</p>
          <p>Unidades Vagas: {apartments.filter(a => !a.tenant_id).length}</p>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroPage;