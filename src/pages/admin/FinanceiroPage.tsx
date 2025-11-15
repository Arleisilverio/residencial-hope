import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment, RentStatus } from '../../types';
import { DollarSign, Loader2, ArrowLeft, AlertTriangle, Home, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import RentListItem from '../../components/admin/RentListItem';
import StatusBadge from '../../components/common/StatusBadge';
import PartialPaymentDialog from '../../components/admin/PartialPaymentDialog'; // Importando o novo diálogo

const FinanceiroPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partialPaymentApartment, setPartialPaymentApartment] = useState<Apartment | null>(null); // Estado para o diálogo
  
  const totalUnits = 14; 

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Busca apenas apartamentos ocupados e seus perfis
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
            // Se o status for null no DB, tratamos como 'pending' para exibição
            rent_status: apt.rent_status || 'pending' as RentStatus,
            // Garantir que os novos campos existam
            amount_paid: apt.amount_paid || null,
            remaining_balance: apt.remaining_balance || null,
          };
      });
      setApartments(occupiedApartments as Apartment[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  // Função para atualização otimista local
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
  };

  const handlePartialPaymentSuccess = () => {
    handleClosePartialPayment();
    fetchApartments(); // Recarrega os dados para obter os valores atualizados
  };

  const { totalOccupiedRent, totalReceivedRent, totalPendingRent, overdueCount } = useMemo(() => {
    let totalOccupied = 0;
    let totalReceived = 0;
    let overdue = 0;

    apartments.forEach(apt => {
      const rent = apt.monthly_rent || (apt.number >= 1 && apt.number <= 6 ? 1600 : 1800);
      
      totalOccupied += rent;

      if (apt.rent_status === 'paid') {
        totalReceived += rent;
      } else if (apt.rent_status === 'partial' && apt.amount_paid) {
        // Ao calcular totais, usamos o valor pago registrado
        totalReceived += apt.amount_paid;
      }

      if (apt.rent_status === 'overdue') {
        overdue += 1;
      }
    });

    const totalPending = totalOccupied - totalReceived;

    return {
      totalOccupiedRent: totalOccupied,
      totalReceivedRent: totalReceived,
      totalPendingRent: totalPending,
      overdueCount: overdue,
    };
  }, [apartments]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Carregando dados financeiros...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  const occupiedCount = apartments.length;
  // const availableCount = totalUnits - occupiedCount; // Não usado, mas mantido para contexto

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Painel
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Gerenciamento de Aluguéis
          </h1>
          
          {/* View de Totais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* 1. Receita Potencial Total */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-blue-600">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Potencial Mensal</p>
                  <div className="flex items-center mt-1">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                          {formatCurrency(totalOccupiedRent)}
                      </span>
                  </div>
              </div>

              {/* 2. Receita Recebida */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-green-600">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Recebido</p>
                  <div className="flex items-center mt-1">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                          {formatCurrency(totalReceivedRent)}
                      </span>
                  </div>
              </div>

              {/* 3. Receita a Receber (Pendente/Atrasado) */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-yellow-600">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">A Receber</p>
                  <div className="flex items-center mt-1">
                      <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                          {formatCurrency(totalPendingRent)}
                      </span>
                  </div>
              </div>

              {/* 4. Unidades Ocupadas/Atrasadas */}
              <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-l-4 ${overdueCount > 0 ? 'border-red-600' : 'border-slate-400'}`}>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Atrasados / Ocupados</p>
                  <div className="flex items-center mt-1">
                      <AlertTriangle className={`w-5 h-5 mr-2 ${overdueCount > 0 ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'}`} />
                      <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                          {overdueCount} / {occupiedCount}
                      </span>
                  </div>
              </div>
          </div>

          {/* Lista de Aluguéis */}
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
      
      {/* Diálogo de Pagamento Parcial */}
      {partialPaymentApartment && (
        <PartialPaymentDialog
          isOpen={!!partialPaymentApartment}
          onClose={handleClosePartialPayment}
          onSuccess={handlePartialPaymentSuccess}
          apartment={partialPaymentApartment}
        />
      )}
    </>
  );
};

export default FinanceiroPage;