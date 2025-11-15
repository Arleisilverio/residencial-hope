
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { Apartment, Complaint, Notification, RentStatus } from '../../types';
import { Link } from 'react-router-dom';
import { User, DollarSign, Calendar, Wrench, MessageSquare, History, CheckCircle, XCircle, AlertCircle, Clock, Bell, HandCoins } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: { [key in RentStatus]: { text: string; color: string; bg: string; icon: React.ElementType } } = {
    paid: { text: 'Pago', color: 'text-green-800', bg: 'bg-green-100', icon: CheckCircle },
    pending: { text: 'Pendente', color: 'text-yellow-800', bg: 'bg-yellow-100', icon: Clock },
    overdue: { text: 'Atrasado', color: 'text-red-800', bg: 'bg-red-100', icon: XCircle },
    partial: { text: 'Parcial', color: 'text-orange-800', bg: 'bg-orange-100', icon: AlertCircle },
};

const TenantDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        // Fetch apartment details
        const { data: aptData } = await supabase.from('apartments').select('*').eq('tenant_id', user.id);
        setApartment(aptData ? aptData[0] : null);

        // Fetch complaints
        const { data: compData } = await supabase.from('complaints').select('*').eq('tenant_id', user.id);
        setComplaints(compData || []);

        // Fetch notifications
        const { data: notifData } = await supabase.from('notifications').select('*').eq('tenant_id', user.id);
        setNotifications(notifData || []);
        
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handlePaymentRequest = async () => {
        if (!user || !apartment) return;
        const toastId = toast.loading('Enviando solicitação de pagamento...');
        const { error } = await supabase.from('payment_requests').insert({
            tenant_id: user.id,
            apartment_number: apartment.number,
            status: 'pending'
        });

        if (error) {
            toast.error('Falha ao enviar solicitação.', { id: toastId });
        } else {
            toast.success('Solicitação enviada! O administrador foi notificado.', { id: toastId });
            fetchData();
        }
    };

    if (loading) {
        return <div>Carregando seu painel...</div>;
    }

    if (!user || !apartment) {
        return <div>Não foi possível carregar os dados.</div>;
    }

    const statusInfo = statusConfig[apartment.rent_status];
    const RentIcon = statusInfo.icon;

    return (
        <div className="space-y-8">
            {/* User Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center space-x-6">
                <div className="relative">
                    <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=dcfce7&color=166534`}
                        alt="Avatar"
                        className="h-24 w-24 rounded-full object-cover ring-4 ring-white"
                    />
                    <Link to="/tenant/profile" className="absolute -bottom-1 -right-1 bg-hope-green-600 p-2 rounded-full text-white hover:bg-hope-green-700">
                        <User className="h-4 w-4" />
                    </Link>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Olá, {user.full_name}</h1>
                    <p className="text-slate-500">Bem-vindo ao seu painel no Residencial Hope.</p>
                    <p className="text-sm text-slate-500 mt-1">
                        Membro desde: {new Date(user.move_in_date).toLocaleDateString('pt-BR')}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Rent Block */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center"><DollarSign className="mr-2 h-5 w-5 text-hope-green-600"/> Aluguel</h2>
                    <div className="space-y-3">
                        <div className={`p-4 rounded-lg flex items-center justify-between ${statusInfo.bg}`}>
                            <div className="flex items-center">
                                <RentIcon className={`h-6 w-6 mr-3 ${statusInfo.color}`} />
                                <div>
                                    <p className={`font-semibold ${statusInfo.color}`}>Status: {statusInfo.text}</p>
                                    <p className="text-sm text-slate-600">Vencimento: {new Date(apartment.next_due_date).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                            <p className={`text-2xl font-bold ${statusInfo.color}`}>R$ {apartment.monthly_rent.toFixed(2)}</p>
                        </div>
                        <button 
                            onClick={handlePaymentRequest}
                            disabled={apartment.payment_request_pending}
                            className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-hope-green-600 hover:bg-hope-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hope-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                            <HandCoins className="mr-2 h-5 w-5" />
                            {apartment.payment_request_pending ? 'Solicitação de Pagamento Enviada' : 'Pagar Aluguel'}
                        </button>
                    </div>
                </div>

                {/* Maintenance Requests */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center"><Wrench className="mr-2 h-5 w-5 text-hope-green-600"/> Solicitações de Manutenção</h2>
                    {/* Placeholder for maintenance request form and list */}
                    <div className="text-center text-slate-500 py-8">
                         <p>Em breve você poderá abrir e acompanhar suas solicitações por aqui.</p>
                    </div>
                </div>
            </div>

             {/* Notifications */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center"><Bell className="mr-2 h-5 w-5 text-hope-green-600"/> Notificações</h2>
                <ul className="space-y-3">
                    {notifications.length > 0 ? notifications.map(n => (
                        <li key={n.id} className="p-3 bg-slate-50 rounded-lg flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-hope-green-500 mt-0.5"/>
                            <div>
                                <p className="font-semibold text-slate-700">{n.title}</p>
                                <p className="text-sm text-slate-600">{n.message}</p>
                            </div>
                        </li>
                    )) : <p className="text-slate-500">Nenhuma notificação nova.</p>}
                </ul>
            </div>
        </div>
    );
};

export default TenantDashboardPage;
