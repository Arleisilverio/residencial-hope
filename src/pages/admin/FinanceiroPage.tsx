import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment, RentStatus } from '../../types';
import { Home, User, DollarSign, Loader2, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import RentStatusMenu from '../../components/admin/RentStatusMenu';
import { Link } from 'react-router-dom'; // Importando Link

// Componente para exibir o status atual
const StatusBadge: React.FC<{ status: RentStatus }> = ({ status }) => {
  if (!status) return null;

  const statusMap = {
    paid: { label: 'Pago', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    overdue: { label: 'Atrasado', color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  const { label, color, icon: Icon } = statusMap[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

// Componente para exibir um item da lista financeira
interface RentListItemProps {
  apartment: Apartment;
  onStatusChange: () => void;
}

const RentListItem: React.FC<RentListItemProps> = ({ apartment, onStatusChange }) => {
  const { number, tenant, monthly_rent, rent_status } = apartment;
  const isOccupied = !!tenant;
  const rentValue = monthly_rent || (number >= 1 && number <= 6 ? 1600 : 1800);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <Home className="w-6 h-6 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-800">Kit {String(number).padStart(2, '0')}</p>
          <div className="flex items-center text-sm text-slate-600 mt-1 truncate">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className={isOccupied ? 'text-slate-700 truncate' : 'text-red-500 italic'}>
              {isOccupied ? tenant.full_name : 'Vago'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {isOccupied && (
          <div className="flex-shrink-0"> {/* Removida a classe 'hidden sm:block' */}
            <StatusBadge status={rent_status} />
          </div>
        )}
        
        <div className="text-right flex-shrink-0">
          <p className="text-sm text-slate-500">Aluguel Base</p>
          <div className="flex items-center justify-end text-lg font-bold text-green-700">
            <DollarSign className="w-5 h-5 mr-1" />
            <span>{formatCurrency(rentValue)}</span>
          </div>
        </div>

        {isOccupied && (
          <RentStatusMenu 
            apartmentNumber={number} 
            currentStatus={rent_status} 
            onStatusChange={onStatusChange} 
          />
        )}
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
    
    const { data, error } = await supabase
      .from('apartments')
      .select('*, tenant:profiles(*)')
      .order('number', { ascending: true });

    if (error) {
      console.error('Error fetching apartments:', error);
      setError('Não foi possível carregar os dados financeiros dos apartamentos.');
    } else {
      const allApartments = Array.from({ length: 14 }, (_, i) => {
          const aptNumber = i + 1;
          const found = data.find(d => d.number === aptNumber);
          // Usamos o valor do aluguel padrão se monthly_rent for null
          const defaultRent = aptNumber >= 1 && aptNumber <= 6 ? 1600 : 1800;

          return found ? { 
            ...found, 
            tenant: found.tenant || null,
            monthly_rent: found.monthly_rent || defaultRent,
            rent_status: found.rent_status || 'pending' // Define 'pending' como padrão se ocupado
          } : { 
            number: aptNumber, 
            status: 'available', 
            tenant_id: null, 
            tenant: null, 
            monthly_rent: defaultRent,
            rent_status: null
          };
      });
      setApartments(allApartments as Apartment[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  // Cálculo da soma dos aluguéis ocupados
  const totalOccupiedRent = useMemo(() => {
    return apartments.reduce((sum, apt) => {
      if (apt.tenant_id && apt.monthly_rent) {
        return sum + apt.monthly_rent;
      }
      return sum;
    }, 0);
  }, [apartments]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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

  const occupiedCount = apartments.filter(a => a.tenant_id).length;
  const availableCount = apartments.filter(a => !a.tenant_id).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Gerenciamento de Aluguéis
        </h1>
        
        {/* Card de Soma Total */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border-l-4 border-blue-600">
            <p className="text-sm text-slate-500 font-medium">Receita Potencial Mensal (Kits Ocupados)</p>
            <div className="flex items-center mt-1">
                <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                <span className="text-3xl font-extrabold text-slate-900">
                    {formatCurrency(totalOccupiedRent)}
                </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Baseado em {occupiedCount} unidades ocupadas.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg divide-y divide-slate-200">
          {apartments.map((apt) => (
            <RentListItem key={apt.number} apartment={apt} onStatusChange={fetchApartments} />
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-slate-100 rounded-lg text-sm text-slate-600 grid grid-cols-3 gap-4">
          <p>Total de Unidades: 14</p>
          <p>Unidades Ocupadas: {occupiedCount}</p>
          <p>Unidades Vagas: {availableCount}</p>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroPage;