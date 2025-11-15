import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment, RentStatus } from '../../types';
import { MoreVertical, CheckCircle, XCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: { [key in RentStatus]: { text: string; color: string; icon: React.ElementType } } = {
    paid: { text: 'Pago', color: 'text-green-600', icon: CheckCircle },
    pending: { text: 'Pendente', color: 'text-yellow-600', icon: Clock },
    overdue: { text: 'Atrasado', color: 'text-red-600', icon: XCircle },
    partial: { text: 'Parcial', color: 'text-orange-600', icon: AlertCircle },
};

const AdminFinancePage: React.FC = () => {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from('apartments')
            .select('*, tenant:profiles(*)')
            .not('tenant_id', 'is', null) // Only occupied apartments
            .order('number', { ascending: true });

        if (error) {
            console.error('Error fetching financial data:', error);
            setError('Não foi possível carregar os dados financeiros.');
        } else if (data) {
            setApartments(data as any[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusUpdate = async (aptNumber: number, tenantId: string, newStatus: RentStatus) => {
        setActiveMenu(null);
        const toastId = toast.loading('Atualizando status...');
        
        const { error } = await supabase
            .from('apartments')
            .update({ rent_status: newStatus })
            .eq('number', aptNumber);
        
        if (error) {
            toast.error('Falha ao atualizar status.', { id: toastId });
        } else {
            await supabase.from('notifications').insert({
                tenant_id: tenantId,
                title: `Status do Aluguel: ${statusConfig[newStatus].text}`,
                message: `O administrador atualizou o status do seu aluguel para ${statusConfig[newStatus].text}.`,
                icon: 'check'
            });
            toast.success('Status atualizado com sucesso!', { id: toastId });
            fetchData();
        }
    };

    const totals = useMemo(() => {
        return apartments.reduce((acc, apt) => {
            if (apt.rent_status === 'paid') {
                acc.received += apt.monthly_rent;
            } else {
                acc.pending += apt.monthly_rent;
            }
            acc.total += apt.monthly_rent;
            return acc;
        }, { received: 0, pending: 0, total: 0 });
    }, [apartments]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-hope-green-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-10 bg-red-50 text-red-700 rounded-lg">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Gerenciamento Financeiro</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-100 p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-green-800">Total Recebido</h3>
                    <p className="text-3xl font-bold text-green-700 mt-2">R$ {totals.received.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-100 p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-yellow-800">Total Pendente</h3>
                    <p className="text-3xl font-bold text-yellow-700 mt-2">R$ {totals.pending.toFixed(2)}</p>
                </div>
                <div className="bg-slate-100 p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-slate-800">Potencial Mensal</h3>
                    <p className="text-3xl font-bold text-slate-700 mt-2">R$ {totals.total.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Apartamento</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Inquilino</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {apartments.map((apt) => {
                            const statusInfo = statusConfig[apt.rent_status];
                            const Icon = statusInfo.icon;
                            return (
                                <tr key={apt.number} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Kit {String(apt.number).padStart(2, '0')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{apt.tenant?.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">R$ {apt.monthly_rent.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className={`flex items-center ${statusInfo.color}`}>
                                            <Icon className="h-4 w-4 mr-1.5" />
                                            {statusInfo.text}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="relative inline-block text-left">
                                            <button onClick={() => setActiveMenu(activeMenu === apt.number ? null : apt.number)} className="p-2 rounded-full hover:bg-slate-200">
                                                <MoreVertical className="h-5 w-5 text-slate-500" />
                                            </button>
                                            {activeMenu === apt.number && (
                                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                                        <a href="#" onClick={() => handleStatusUpdate(apt.number, apt.tenant_id!, 'paid')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Marcar como Pago</a>
                                                        <a href="#" onClick={() => handleStatusUpdate(apt.number, apt.tenant_id!, 'partial')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Marcar Pagamento Parcial</a>
                                                        <a href="#" onClick={() => handleStatusUpdate(apt.number, apt.tenant_id!, 'pending')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Marcar como Pendente</a>
                                                        <a href="#" onClick={() => handleStatusUpdate(apt.number, apt.tenant_id!, 'overdue')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Marcar como Atrasado</a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminFinancePage;