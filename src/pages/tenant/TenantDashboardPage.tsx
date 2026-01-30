import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Apartment, RentStatus } from '../../types';
import { supabase } from '../../services/supabase';
import { DollarSign, Home, Mail, Phone, Calendar, Wrench, Bell, CalendarClock, X, Loader2, MessageSquare } from 'lucide-react';
import AvatarUploader from '../../components/tenant/AvatarUploader';
import StatusBadge from '../../components/common/StatusBadge'; 
import { Button } from '../../components/ui/Button';
import ComplaintFormDialog from '../../components/tenant/ComplaintFormDialog'; 
import toast from 'react-hot-toast';
import { differenceInDays, startOfDay } from 'date-fns';
import DocumentUploader from '../../components/tenant/DocumentUploader';
import TenantMessageDialog from '../../components/tenant/TenantMessageDialog';
import AnnouncementDisplay from '../../components/tenant/AnnouncementDisplay';
import PaymentHistory from '../../components/tenant/PaymentHistory'; 
import RepairHistory from '../../components/tenant/RepairHistory'; // Novo componente

const TenantDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loadingApartment, setLoadingApartment] = useState(true);
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      setApartment({ ...data, rent_status: data.rent_status || 'pending' } as Apartment);
    }
    setLoadingApartment(false);
  }, [profile]);

  useEffect(() => {
    fetchApartmentDetails();
  }, [fetchApartmentDetails]);

  const handleRequestPayment = async () => {
    if (!profile || !apartment) {
      toast.error('Erro: Dados do apartamento não carregados.');
      return;
    }
    setIsRequestingPayment(true);
    const toastId = toast.loading('Enviando solicitação de pagamento...');
    try {
        const { error } = await supabase.functions.invoke('request-payment', {
            body: { apartmentNumber: apartment.number },
        });
        if (error) throw error;
        toast.success('Solicitação de pagamento enviada ao administrador!', { id: toastId });
    } catch (error) {
        toast.error('Falha ao enviar a solicitação.', { id: toastId });
    } finally {
        setIsRequestingPayment(false);
    }
  };

  if (!profile) return <div className="p-8 text-center">Carregando perfil...</div>;

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <AnnouncementDisplay />

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
          Bem-vindo, {profile.full_name?.split(' ')[0] || 'Inquilino'}!
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6 border-b dark:border-slate-700 pb-3">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Meu Perfil</h2>
                <div className="flex items-center space-x-1">
                  <button onClick={() => setIsMessageDialogOpen(true)} className="p-2 text-blue-600 rounded-full hover:bg-blue-100"><MessageSquare className="w-5 h-5" /></button>
                  <button onClick={() => setIsComplaintDialogOpen(true)} className="p-2 text-blue-600 rounded-full hover:bg-blue-100"><Wrench className="w-5 h-5" /></button>
                </div>
              </div>
              <AvatarUploader profile={profile} />
              <div className="text-center mb-6">
                <p className="text-2xl font-bold">{profile.full_name}</p>
                <p className="text-sm text-slate-500 capitalize">Kit {profile.apartment_number}</p>
              </div>
            </div>
            <RepairHistory /> {/* Adicionado Histórico de Reparos */}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center border-b dark:border-slate-700 pb-3"><Home className="w-5 h-5 mr-2" /> Unidade</h2>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <p className="text-sm text-slate-500">Número</p>
                      <p className="text-3xl font-bold">Kit {String(profile.apartment_number).padStart(2, '0')}</p>
                  </div>
                  <div>
                      <p className="text-sm text-slate-500">Aluguel</p>
                      <p className="text-xl font-bold text-green-700">{apartment?.monthly_rent?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
              </div>
              <Button onClick={handleRequestPayment} className="w-full mt-6" disabled={apartment?.payment_request_pending}>
                {apartment?.payment_request_pending ? 'Solicitação Pendente' : 'Pagar Aluguel'}
              </Button>
            </div>
            <DocumentUploader />
            <PaymentHistory />
          </div>
        </div>
      </div>
      
      <ComplaintFormDialog isOpen={isComplaintDialogOpen} onClose={() => setIsComplaintDialogOpen(false)} onSuccess={() => setRefreshTrigger(t => t + 1)} />
      <TenantMessageDialog isOpen={isMessageDialogOpen} onClose={() => setIsMessageDialogOpen(false)} onSuccess={() => setRefreshTrigger(t => t + 1)} />
    </>
  );
};

export default TenantDashboardPage;