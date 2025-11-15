import React from 'react';
import { Apartment } from '../../types';
import { User, Mail, Phone, Calendar, DollarSign, Pencil } from 'lucide-react';

interface ApartmentCardProps {
  apartment: Apartment;
  onEdit: (apartment: Apartment) => void;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment, onEdit }) => {
  const { number, tenant, monthly_rent } = apartment;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'Não informado';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-800">
          Kit {String(number).padStart(2, '0')}
        </h3>
        {tenant && (
          <button
            onClick={() => onEdit(apartment)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            title="Editar Inquilino"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      {tenant ? (
        <div className="flex flex-col flex-grow">
          <div className="space-y-3 text-sm flex-grow">
            <div className="flex items-center text-slate-700">
              <User className="w-4 h-4 mr-3 text-slate-500" />
              <span className="font-semibold">{tenant.full_name}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <Mail className="w-4 h-4 mr-3 text-slate-500" />
              <span>{tenant.email || 'Email não informado'}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <Phone className="w-4 h-4 mr-3 text-slate-500" />
              <span>{tenant.phone || 'Telefone não informado'}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <Calendar className="w-4 h-4 mr-3 text-slate-500" />
              <span>Início: {formatDate(tenant.move_in_date)}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <DollarSign className="w-4 h-4 mr-3 text-slate-500" />
              <span>{formatCurrency(monthly_rent)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 rounded-md p-4 h-full">
          <User className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-slate-500 font-medium">Apartamento Vago</p>
        </div>
      )}
    </div>
  );
};

export default ApartmentCard;