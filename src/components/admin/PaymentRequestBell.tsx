import React, { useState, useEffect, useCallback } from 'react';
import { Bell, DollarSign, X, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Button } from '../ui/Button';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentRequestBell: React.FC = () => {
  const [requests, setRequests] = useState<Apartment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('apartments')
      .select('*, tenant:profiles(*)')
      .eq('payment_request_pending', true)
      .order('number', { ascending: true });

    if (error) {
      console.error('Error fetching payment requests:', error);
    } else {
      setRequests(data as Apartment[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const channel = supabase
      .channel('payment-requests-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'apartments',
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  const handleNavigate = () => {
    setIsOpen(false);
    navigate('/admin/financeiro');
  };

  const handleDismissRequest = async (apartmentNumber: number) => {
    // Atualização otimista da UI para resposta imediata
    setRequests(prevRequests => prevRequests.filter(req => req.number !== apartmentNumber));

    const { error } = await supabase
      .from('apartments')
      .update({ payment_request_pending: false })
      .eq('number', apartmentNumber);

    if (error) {
      toast.error(`Erro ao dispensar a solicitação do Kit ${String(apartmentNumber).padStart(2, '0')}.`);
      // Reverte a atualização otimista em caso de erro
      fetchRequests();
    } else {
      toast.success(`Solicitação do Kit ${String(apartmentNumber).padStart(2, '0')} dispensada.`);
    }
  };
  
  const formatCurrency = (value: number | null | undefined, aptNumber: number) => {
    const rent = value || (aptNumber >= 1 && aptNumber <= 6 ? 1600 : 1800);
    return rent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const hasRequests = requests.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          title="Solicitações de Pagamento"
        >
          <Bell className="w-5 h-5" />
          {hasRequests && (
            <span className="absolute top-0 right-0 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                {requests.length}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-50 border bg-popover text-popover-foreground" align="end">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Solicitações de Pagamento
          </h3>
          {loading ? (
            <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : hasRequests ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {requests.map((req) => (
                <div key={req.number} className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {req.tenant?.full_name || 'Inquilino desconhecido'}
                    </p>
                    <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                      <span>Kit {String(req.number).padStart(2, '0')}</span>
                      <span className="font-bold text-green-600 dark:text-green-400 ml-4">
                        {formatCurrency(req.monthly_rent, req.number)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissRequest(req.number)}
                    className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors flex-shrink-0 ml-2"
                    title="Dispensar notificação"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
               <Button onClick={handleNavigate} className="w-full mt-4">
                <DollarSign className="w-4 h-4 mr-2" />
                Ir para Financeiro
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              Nenhuma solicitação pendente.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PaymentRequestBell;