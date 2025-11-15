
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment, RentStatus } from '../../types';
import { MoreVertical, User, Building, DollarSign, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

const statusConfig: { [key in RentStatus]: { text: string; color: string; icon: React.ElementType } } = {
    paid: { text: 'Pago', color: 'text-green-600', icon: CheckCircle },
    pending: { text: 'Pendente', color: 'text-yellow-600', icon: Clock },
    overdue: { text: 'Atrasado', color: 'text-red-600', icon: XCircle },
    partial: { text: 'Parcial', color: 'text-orange-600', icon: AlertCircle },
};

const AdminFinancePage: React.FC = () => {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('apartments').select('*, tenant:users(*)');
        if (error) {
            console.error('Error fetching data:', error);
        } else if (data) {
            const occupied = (data as any[]).filter(ap => ap.tenant).sort((a,b) => a.number - b.number);
            setApartments(occupied);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center p-10">Carregando dados financeiros...</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-700 mb-6">Gerenciamento Financeiro</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Apartamento</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Inquilino</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor do Aluguel</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Atual</th>
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
                                        <button className="p-2 rounded-full hover:bg-slate-200">
                                            <MoreVertical className="h-5 w-5 text-slate-500" />
                                        </button>
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
