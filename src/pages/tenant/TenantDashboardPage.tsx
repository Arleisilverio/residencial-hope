import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Apartment, RentStatus } from '../../types';
import { supabase } from '../../services/supabase';
import { DollarSign, Home, Mail, Phone, Calendar, Wrench, Bell } from 'lucide-react';
import AvatarUploader from '../../components/tenant/AvatarUploader';
import StatusBadge from '../../components/common/StatusBadge'; 
import { Button } from '../../components/ui/Button';
import ComplaintFormDialog from '../../components/tenant/ComplaintFormDialog'; // Importando o novo componente

const TenantDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loadingApartment, setLoadingApartment] = useState(true);
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false); // Novo estado

  const fetchApartmentDetails = useCallback(async () => {
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
      // Garantir que o status seja 'pending' se for null no DB
      setApartment({ ...data, rent_status: data.rent_status || 'pending' } as Apartment);
    }
    setLoadingApartment(false);
  }, [profile]);

  // 1. Efeito para buscar dados iniciais
  useEffect(() => {
    fetchApartmentDetails();
  }, [fetchApartmentDetails]);

  // 2. Efeito para configurar o Realtime Listener
  useEffect(() => {
    if (!profile?.apartment_number) return;

    const channel = supabase
      .channel(`apartment_${profile.apartment_number}_changes`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'apartments',
          filter: `number=eq.${profile.apartment_number}`
        },
        (payload) => {
          // O payload.new contém os dados atualizados
          setApartment({ ...payload.new, rent_status: payload.new.rent_status || 'pending' } as Apartment);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.apartment_number]);


  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Não informado';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!profile) {
    return <div className="p-8 text-center text-slate-600 dark:text-slate-400">Carregando perfil...</div>;
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
          Bem-vindo, {profile.full_name?.split(' ')[0] || 'Inquilino'}!
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna 1: Perfil e Contato */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6 border-b dark:border-slate-700 pb-3">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Meu Perfil</h2>
                
                {/* Botão de Solicitar Reparo (Ícone) */}
                <button
                  onClick={() => setIsComplaintDialogOpen(true)} 
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                  title="Solicitar Reparo / Manutenção"
                >
                  <Wrench className="w-5 h-5" />
                </button>
              </div>
              
              <AvatarUploader profile={profile} />

              <div className="text-center mb-6">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{profile.full_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{profile.role}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-slate-700 dark:text-slate-300 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                  <Mail className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                  <span>{profile.email || 'Email não informado'}</span>
                </div>
                <div className="flex items-center text-slate-700 dark:text-slate-300 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                  <Phone className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                  <span>{profile.phone || 'Telefone não informado'}</span>
                </div>
                <div className="flex items-center text-slate-700 dark:text-slate-300 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                  <Calendar className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                  <span>Entrada: {formatDate(profile.move_in_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2 & 3: Informações do Apartamento e Ações */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card de Informações do Apartamento */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center border-b dark:border-slate-700 pb-3">
                <Home className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" />
                Detalhes da Unidade
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Número do Kit</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                          {String(profile.apartment_number || 'N/A').padStart(2, '0')}
                      </p>
                  </div>
                  <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Aluguel Mensal</p>
                      {loadingApartment ? (
                          <p className="text-lg text-slate-500 dark:text-slate-400">Carregando...</p>
                      ) : (
                          <div className="flex items-center text-xl font-bold text-green-700 dark:text-green-400">
                              <DollarSign className="w-5 h-5 mr-2" />
                              <span>{formatCurrency(apartment?.monthly_rent)}</span>
                          </div>
                      )}
                  </div>
              </div>
              
              {/* Status do Aluguel */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Status do Pagamento</p>
                  {loadingApartment ? (
                      <p className="text-slate-500 dark:text-slate-400">Verificando...</p>
                  ) : (
                      <StatusBadge status={apartment?.rent_status || 'pending'} />
                  )}
              </div>
            </div>

            {/* Card de Ações/Avisos */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Avisos e Ações Rápidas</h2>
              <div className="space-y-3">
                {/* Ação de Reparo movida para o card de Perfil */}
                <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md text-slate-600 dark:text-slate-400">
                    <Bell className="w-4 h-4 mr-3" />
                    <p className="text-sm">Verifique suas notificações para atualizações.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ComplaintFormDialog 
        isOpen={isComplaintDialogOpen}
        onClose={() => setIsComplaintDialogOpen(false)}
        onSuccess={() => { /* Nenhuma ação de recarga necessária aqui */ }}
      />
    </>
  );
};

export default TenantDashboardPage;