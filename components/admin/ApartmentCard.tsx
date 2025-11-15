import React, { useState } from 'react';
import { Apartment, RentStatus } from '../../types';
import { User, DollarSign, Calendar, MoreVertical, Phone, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabase';

interface ApartmentCardProps {
    apartment: Apartment;
    onUpdate: () => void;
}

const statusConfig: { [key in RentStatus]: { text: string; color: string; dot: string } } = {
    paid: { text: 'Pago', color: 'text-green-800', dot: 'bg-green-500' },
    pending: { text: 'Pendente', color: 'text-yellow-800', dot: 'bg-yellow-500' },
    overdue: { text: 'Atrasado', color: 'text-red-800', dot: 'bg-red-500' },
    partial: { text: 'Parcial', color: 'text-orange-800', dot: 'bg-orange-500' },
};

const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment, onUpdate }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    
    const tenant = apartment.tenant;
    const statusInfo = statusConfig[apartment.rent_status] || statusConfig.pending;

    const handleRemoveTenant = async () => {
        setMenuOpen(false);
        if (!tenant) {
            toast.error("Este apartamento já está vago.");
            return;
        }

        if (!confirm(`Tem certeza que deseja remover ${tenant.full_name} do Kit ${apartment.number}? Esta ação não pode ser desfeita.`)) {
            return;
        }

        const toastId = toast.loading('Removendo inquilino...');
        try {
            const { error: apartmentError } = await supabase
                .from('apartments')
                .update({ tenant_id: null, status: 'available', rent_status: 'pending' })
                .eq('number', apartment.number);

            if (apartmentError) throw apartmentError;
            
            toast.success('Inquilino removido com sucesso.', { id: toastId });
            onUpdate();
        } catch (error: any) {
            toast.error(`Erro ao remover inquilino: ${error.message}`, { id: toastId });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between transition-transform hover:shadow-md">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-slate-800">Kit {String(apartment.number).padStart(2, '0')}</h3>
                    <div className="relative">
                        <button onClick={() => setMenuOpen(!menuOpen)} onBlur={() => setTimeout(() => setMenuOpen(false), 200)} className="p-2 rounded-full hover:bg-slate-100">
                            <MoreVertical className="h-5 w-5 text-slate-500" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-10 border border-slate-100">
                                <button onClick={() => alert('Função de edição em breve!')} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                    <Edit className="h-4 w-4 mr-2" /> Editar Apartamento
                                </button>
                                <button onClick={handleRemoveTenant} disabled={!tenant} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:text-slate-400 disabled:bg-white disabled:cursor-not-allowed">
                                    <Trash2 className="h-4 w-4 mr-2" /> Remover Inquilino
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {tenant ? (
                    <>
                        <div className="mt-4 flex items-center space-x-3">
                            {tenant.avatar_url ? (
                                <img src={tenant.avatar_url} alt={tenant.full_name} className="h-12 w-12 rounded-full object-cover" />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                                    <User className="h-6 w-6 text-slate-500" />
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-slate-700">{tenant.full_name}</p>
                                <p className="text-xs text-slate-500">{tenant.email}</p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-2 text-sm text-slate-600">
                            <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-hope-green-600" />
                                <span>{tenant.phone || 'Não informado'}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="mt-4 py-8 flex flex-col items-center justify-center bg-slate-50 rounded-lg">
                        <User className="h-8 w-8 text-slate-400" />
                        <p className="mt-2 text-sm font-medium text-slate-500">Apartamento Vago</p>
                    </div>
                )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center">
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${statusInfo.dot}`}></span>
                    <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                    <DollarSign className="h-4 w-4 mr-1 text-hope-green-600" />
                    <span>R$ {apartment.monthly_rent.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default ApartmentCard;