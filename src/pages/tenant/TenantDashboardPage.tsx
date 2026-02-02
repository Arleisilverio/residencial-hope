import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Apartment } from '../../types';
import { supabase } from '../../services/supabase';
import { DollarSign, Home, Calendar, Wrench, Loader2, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import AvatarUploader from '../../components/tenant/AvatarUploader';
import StatusBadge from '../../components/common/StatusBadge'; 
import { Button } from '../../components/ui/Button';
import ComplaintFormDialog from '../../components/tenant/ComplaintFormDialog'; 
import toast from 'react-hot-toast';
import DocumentUploader from '../../components/tenant/DocumentUploader';
import TenantMessageDialog from '../../components/tenant/TenantMessageDialog';
import AnnouncementDisplay from '../../components/tenant/AnnouncementDisplay';
import PaymentHistory from '../../components/tenant/PaymentHistory'; 
import RepairHistory from '../../components/tenant/RepairHistory';

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

  const formatCurrency = (value: number | null | undefined) => {
    return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
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
          {/* Coluna Lateral: Perfil e Reparos */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6 border-b dark:border-slate-700 pb-3">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Meu Perfil</h2>
                <div className="flex items-center space-x-1">
                  <button onClick={() => setIsMessageDialogOpen(true)} className="p-2 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="Enviar Mensagem">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsComplaintDialogOpen(true)} className="p-2 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="Solicitar Reparo">
                    <Wrench className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <AvatarUploader profile={profile} />
              <div className="text-center mt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{profile.full_name}</p>
                <p className="text-sm text-slate-500 font-medium">Kit {String(profile.apartment_number).padStart(2, '0')}</p>
              </div>
            </div>
            <RepairHistory />
          </div>

          {/* Coluna Principal: Financeiro e Documentos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Financeiro Detalhado */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6 border-b dark:border-slate-700 pb-3">
                <h2 className="text-xl font-semibold flex items-center text-slate-800 dark:text-slate-200">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" /> 
                  Situação Financeira Atual
                </h2>
                {apartment && <StatusBadge status={apartment.rent_status} />}
              </div>

              {loadingApartment ? (
                <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Aluguel Mensal</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(apartment?.monthly_rent)}</p>
                      <div className="mt-2 flex items-center text-xs text-slate-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Próximo Vencimento: {formatDate(apartment?.next_due_date)}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Saldo Devedor</p>
                      <p className={`text-2xl font-bold ${apartment?.rent_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                        {apartment?.rent_status === 'paid' ? formatCurrency(0) : formatCurrency(apartment?.remaining_balance || apartment?.monthly_rent)}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-slate-500">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                        Já pago este mês: {formatCurrency(apartment?.amount_paid)}
                      </div>
                    </div>
                  </div>

                  {apartment?.rent_status !== 'paid' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Solicitação de Pagamento</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Ao clicar no botão abaixo, o administrador será notificado para enviar o comprovante ou chave PIX.
                        </p>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleRequestPayment} 
                    className="w-full h-12 text-lg font-bold shadow-md" 
                    disabled={apartment?.rent_status === 'paid' || apartment?.payment_request_pending}
                  >
                    {apartment?.rent_status === 'paid' ? 'Aluguel Quitado!' : (apartment?.payment_request_pending ? 'Solicitação em Análise...' : 'Informar Pagamento')}
                  </Button>
                </div>
              )}
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