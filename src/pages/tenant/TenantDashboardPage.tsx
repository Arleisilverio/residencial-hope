import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Apartment, RentStatus } from '../../types';
import { supabase } from '../../services/supabase';
import { DollarSign, Home, Mail, Phone, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import AvatarUploader from '../../components/tenant/AvatarUploader';

// Componente para exibir o status atual (copiado do FinanceiroPage para consistência)
const StatusBadge: React.FC<{ status: RentStatus }> = ({ status }) => {
  if (!status) return null;

  const statusMap = {
    paid: { label: 'Pago', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    overdue: { label: 'Atrasado', color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  const { label, color, icon: Icon } = statusMap[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </span>
  );
};


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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!profile) {
    return <div className="p-8 text-center text-slate-600">Carregando perfil...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Bem-vindo, {profile.full_name?.split(' ')[0] || 'Inquilino'}!
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1: Perfil e Contato */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 border-b pb-3">Meu Perfil</h2>
            
            <AvatarUploader profile={profile} />

            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-slate-900">{profile.full_name}</p>
              <p className="text-sm text-slate-500 capitalize">{profile.role}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center text-slate-700 p-2 bg-slate-50 rounded-md">
                <Mail className="w-4 h-4 mr-3 text-slate-500" />
                <span>{profile.email || 'Email não informado'}</span>
              </div>
              <div className="flex items-center text-slate-700 p-2 bg-slate-50 rounded-md">
                <Phone className="w-4 h-4 mr-3 text-slate-500" />
                <span>{profile.phone || 'Telefone não informado'}</span>
              </div>
              <div className="flex items-center text-slate-700 p-2 bg-slate-50 rounded-md">
                <Calendar className="w-4 h-4 mr-3 text-slate-500" />
                <span>Entrada: {formatDate(profile.move_in_date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2 & 3: Informações do Apartamento e Ações */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card de Informações do Apartamento */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center border-b pb-3">
              <Home className="w-5 h-5 mr-2 text-slate-500" />
              Detalhes da Unidade
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-slate-500">Número do Kit</p>
                    <p className="text-3xl font-bold text-slate-900">
                        {String(profile.apartment_number || 'N/A').padStart(2, '0')}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">Aluguel Mensal</p>
                    {loadingApartment ? (
                        <p className="text-lg text-slate-500">Carregando...</p>
                    ) : (
                        <div className="flex items-center text-xl font-bold text-green-700">
                            <DollarSign className="w-5 h-5 mr-2" />
                            <span>{formatCurrency(apartment?.monthly_rent)}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Status do Aluguel */}
            <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-2">Status do Pagamento</p>
                {loadingApartment ? (
                    <p className="text-slate-500">Verificando...</p>
                ) : apartment?.rent_status ? (
                    <StatusBadge status={apartment.rent_status} />
                ) : (
                    <p className="text-slate-500">Status não definido.</p>
                )}
            </div>
          </div>

          {/* Card de Ações/Avisos */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Avisos e Ações Rápidas</h2>
            <p className="text-slate-600">
              Aqui você poderá gerenciar seus pagamentos e reservas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboardPage;