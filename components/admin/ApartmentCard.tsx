import React, { useState } from 'react';
import { Apartment, RentStatus } from '../../types';
import { User, DollarSign, Calendar, MoreVertical, BellRing, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabase';

interface ApartmentCardProps {
    apartment: Apartment;
    onStatusChange: () => void;
}

const statusConfig: { [key in RentStatus]: { text: string; color: string; dot: string } } = {
    paid: { text: 'Pago', color: 'text-green-800', dot: 'bg-green-500' },
    pending: { text: 'Pendente', color: 'text-yellow-800', dot: 'bg-yellow-500' },
    overdue: { text: 'Atrasado', color: 'text-red-800', dot: 'bg-red-500' },
    partial: { text: 'Parcial', color: 'text-orange-800', dot: 'bg-orange-500' },
};

const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment, onStatusChange }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    
    const handleStatusUpdate = async (newStatus: RentStatus) => {
        setMenuOpen(false);
        const toastId = toast.loading('Atualizando status...');
        
        const updates: Partial<Apartment> = { rent_status: newStatus };
        if (newStatus === 'paid') {
            updates.payment_request_pending = false;
        }

        const { error } = await supabase.from('apartments').update(updates).eq('number', apartment.number);
        
        if (error) {
            toast.error('Falha ao atualizar status.', { id: toastId });
        } else {
            await supabase.from('notifications').insert({
                tenant_id: apartment.tenant_id,
                title: `Status do Aluguel: ${statusConfig[newStatus].text}`,
                message: `O administrador atualizou o status do seu aluguel para ${statusConfig[newStatus].text}.`,
                icon: 'check'
            });
            toast.success('Status atualizado com sucesso!', { id: toastId });
            onStatusChange();
        }
    };
    
    const tenant = apartment.tenant;
    const statusInfo = statusConfig[apartment.rent_status];

    return (
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between relative transition-transform hover:scale-105">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Kit {String(apartment.number).padStart(2, '0')}</h3>
                        <div className="flex items-center mt-1">
                            <span className={`h-2.5 w-2.5 rounded-full mr-2 ${statusInfo.dot}`}></span>
                            <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                        </div>
                    </div>
                    {apartment.payment_request_pending && (
                        <div className="relative">
                           <BellRing className="h-6 w-6 text-yellow-500 animate-pulse" />
                           <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center space-x-3">
                    {tenant?.avatar_url ? (
                        <img src={tenant.avatar_url} alt={tenant.full_name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-slate-500" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-slate-700">{tenant?.full_name || 'Vago'}</p>
                        <p className="text-xs text-slate-500">{tenant?.email}</p>
                    </div>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-hope-green-600" />
                        <span>Aluguel: R$ {apartment.monthly_rent.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-hope-green-600" />
                        <span>Vencimento: {new Date(apartment.next_due_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {tenant?.phone && (
                        <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-hope-green-600" />
                            <span>{tenant.phone}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-slate-100">
                        <MoreVertical className="h-5 w-5 text-slate-500" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-xl py-1 z-10">
                            <a href="#" onClick={() => handleStatusUpdate('paid')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Marcar Total Pago</a>
                            <a href="#" onClick={() => handleStatusUpdate('partial')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Marcar Pagamento Parcial</a>
                            <a href="#" onClick={() => handleStatusUpdate('overdue')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Marcar Atrasado</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApartmentCard;