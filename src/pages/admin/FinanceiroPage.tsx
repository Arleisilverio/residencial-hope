import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment, RentStatus } from '../../types';
import { Home, User, DollarSign, Loader2, CheckCircle, Clock, XCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import RentStatusMenu from '../../components/admin/RentStatusMenu';
import { Link } from 'react-router-dom'; 
import PartialPaymentDialog from '../../components/admin/PartialPaymentDialog';

const StatusBadge: React.FC<{ status: RentStatus }> = ({ status }) => {
  if (!status) return null;

  const statusMap = {
    paid: { label: 'Pago', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', icon: CheckCircle },
    partial: { label: 'Pag. Parcial', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300', icon: DollarSign },
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', icon: Clock },
    overdue: { label: 'Atrasado', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', icon: XCircle },
  };

  const statusData = statusMap[status] || { label: 'Desconhecido', color: 'bg-slate-100 text-slate-700', icon: Clock };
  const { label, color, icon: Icon } = statusData;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

interface RentListItemProps {
  apartment: Apartment;
  onStatusChange: () => void;
  onLocalStatusChange: (apartmentNumber: number, newStatus: RentStatus) => void;
  onOpenPartialPayment: (apartment: Apartment) => void;
}

const RentListItem: React.FC<RentListItemProps> = ({ apartment, onStatusChange, onLocalStatusChange, onOpenPartialPayment }) => {
  const { number, tenant, monthly_rent, rent_status } = apartment;
  const isOccupied = !!tenant; 
  const rentValue = monthly_rent || (number >= 1 && number <= 6 ? 1600 : 1800);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getBackgroundColorClass = (status: RentStatus) => {
    if (!isOccupied) return 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50';
    
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50';
      case 'partial':
        return 'bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50';
      case 'pending':
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50';
    }
  };

  const bgColorClass = getBackgroundColorClass(rent_status);

  return (
    <div className={`flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-colors ${bgColorClass}`}>
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <Home className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">Kit {String(number).padStart(2, '0')}</p>
          
          {isOccupied ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mt-1">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 truncate mb-1 sm:mb-0">
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 truncate">{tenant.full_name}</span>
              </div>
              <StatusBadge status={rent_status} />
            </div>
          ) : (
            <p className="text-sm text-red-500 italic mt-1">Vago</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right flex-shrink-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">Aluguel Base</p>
          <div className="flex items-center justify-end text-lg font-bold text-green-700 dark:text-green-400">
            <DollarSign className="w-5 h-5 mr-1" />
            <span>{formatCurrency(rentValue)}</span>
          </div>
        </div>

        {isOccupied && (
          <RentStatusMenu 
            apartmentNumber={number} 
            currentStatus={rent_status} 
            onStatusChange={onStatusChange} 
            onLocalStatusChange={(newStatus) => {
              if (newStatus === 'partial') {
                onOpenPartialPayment(apartment);
              } else {
                onLocalStatusChange(number, newStatus);
              }
            }}
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
  const [partialPaymentApartment, setPartialPaymentApartment] = useState<Apartment | null>(null);
  
  const totalUnits = 14; 

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('apartments')
      .select('*, tenant:profiles(*)')
      .not('tenant_id', 'is', null) 
      .order('number', { ascending: true });

    if (error) {
      console.error('Error fetching apartments:', error);
      setError('Não foi possível carregar os dados financeiros dos apartamentos.');
    } else {
      const occupiedApartments = data.map(apt => {
          const defaultRent = apt.number >= 1 && apt.number <= 6 ? 1600 : 1800;
          return { 
            ...apt, 
            tenant: apt.tenant || null,
            monthly_rent: apt.monthly_rent || defaultRent,
            rent_status: apt.rent_status || 'pending'
          };
      });
      setApartments(occupiedApartments as Apartment[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  const handleLocalStatusChange = useCallback((apartmentNumber: number, newStatus: RentStatus) => {
    setApartments(prevApts => 
      prevApts.map(apt => 
        apt.number === apartmentNumber 
          ? { ...apt, rent_status: newStatus } 
          : apt
      )
    );
  }, []);

  const handleOpenPartialPayment = (apartment: Apartment) => {
    setPartialPaymentApartment(apartment);
  };

  const handleClosePartialPayment = () => {
    setPartialPaymentApartment(null);
    fetchApartments();
  };

  const totalOccupiedRent = useMemo(() => {
    return apartments.reduce((sum, apt) => {
      if (apt.monthly_rent) {
        return sum + apt.monthly_rent;
      }
      return sum;
    }, 0);
  }, [apartments]);
  
  const overdueCount = useMemo(() => {
    return apartments.filter(apt => apt.rent_status === 'overdue').length;
  }, [apartments]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Carregando dados financeiros...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  const occupiedCount = apartments.length;
  const availableCount = totalUnits - occupiedCount;

  return (
    <>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-blue-600">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Receita Mensal (Potencial)</p>
                <div className="flex items-center mt-1">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(totalOccupiedRent)}
                    </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Baseado em {occupiedCount} unidades ocupadas.</p>
            </div>

            <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-l-4 ${overdueCount > 0 ? 'border-red-600' : 'border-green-600'}`}>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Aluguéis Atrasados</p>
                <div className="flex items-center mt-1">
                    <AlertTriangle className={`w-5 h-5 mr-2 ${overdueCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
                    <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                        {overdueCount}
                    </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Unidades Vagas: {availableCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg divide-y divide-slate-200 dark:divide-slate-700">
            {occupiedCount === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                Nenhum apartamento alugado encontrado.
              </div>
            ) : (
              apartments.map((apt) => (
                <RentListItem 
                  key={apt.number} 
                  apartment={apt} 
                  onStatusChange={fetchApartments} 
                  onLocalStatusChange={handleLocalStatusChange}
                  onOpenPartialPayment={handleOpenPartialPayment}
                />
              ))
            )}
          </div>
        </div>
      </div>
      
      <PartialPaymentDialog
        isOpen={!!partialPaymentApartment}
        onClose={handleClosePartialPayment}
        apartment={partialPaymentApartment}
        onSuccess={fetchApartments}
      />
    </>
  );
};

export default FinanceiroPage;