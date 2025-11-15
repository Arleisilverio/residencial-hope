import React from 'react';
import { Apartment } from '../../types';
import { User, Mail, Phone, Calendar } from 'lucide-react';

interface ApartmentCardProps {
  apartment: Apartment;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment }) => {
  const { number, tenant } = apartment;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
      <h3 className="text-xl font-bold text-slate-800 mb-4">
        Kit {String(number).padStart(2, '0')}
      </h3>
      {tenant ? (
        <div className="space-y-3 text-sm">
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
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 rounded-md p-4">
          <User className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-slate-500 font-medium">Apartamento Vago</p>
        </div>
      )}
    </div>
  );
};

export default ApartmentCard;