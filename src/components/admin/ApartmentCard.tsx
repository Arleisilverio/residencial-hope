import React, { useState } from 'react';
import { Apartment } from '../../types';
import { User, Mail, Phone, Calendar, DollarSign, Pencil, Eye, UserPlus } from 'lucide-react';
import ImageViewerDialog from '../common/ImageViewerDialog';

interface ApartmentCardProps {
  apartment: Apartment;
  onEdit: (apartment: Apartment) => void;
  onView: (tenantId: string) => void;
  onAddTenant: () => void;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment, onEdit, onView, onAddTenant }) => {
  const { number, tenant } = apartment;
  const [isImageOpen, setIsImageOpen] = useState(false);

  const getMonthlyRent = (aptNumber: number) => {
    // Lógica de aluguel baseada no número do kit (mantida)
    return aptNumber >= 1 && aptNumber <= 6 ? 1600 : 1800;
  };

  const monthly_rent = getMonthlyRent(number);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique propague para outros handlers do card
    if (tenant?.avatar_url) {
      setIsImageOpen(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            Kit {String(number).padStart(2, '0')}
          </h3>
          <div className="flex items-center space-x-1">
            {tenant ? (
              <>
                <button
                  onClick={() => onView(tenant.id)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                  title="Visualizar Inquilino"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(apartment)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                  title="Editar Inquilino"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={onAddTenant}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
                title="Adicionar Inquilino"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Informação do Aluguel (Fixo) */}
        <div className="flex items-center text-sm mb-4 p-2 bg-green-50 rounded-md border border-green-200">
          <DollarSign className="w-4 h-4 mr-3 text-green-600" />
          <span className="text-green-700 font-semibold">Aluguel Mensal: {formatCurrency(monthly_rent)}</span>
        </div>

        {tenant ? (
          <div className="flex flex-col flex-grow">
            <div className="flex items-center mb-4">
              {/* Avatar do Inquilino - Agora clicável */}
              <div 
                className={`w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center mr-3 ${tenant.avatar_url ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                onClick={handleImageClick}
                title={tenant.avatar_url ? "Clique para ver a foto" : undefined}
              >
                {tenant.avatar_url ? (
                  <img 
                    src={tenant.avatar_url} 
                    alt={tenant.full_name || 'Avatar'} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <span className="font-semibold text-slate-800">{tenant.full_name}</span>
            </div>

            <div className="space-y-3 text-sm flex-grow">
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
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 rounded-md p-4 h-full">
            <User className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-slate-500 font-medium">Apartamento Vago</p>
          </div>
        )}
      </div>
      
      {/* Modal de Visualização de Imagem */}
      {tenant?.avatar_url && (
        <ImageViewerDialog
          isOpen={isImageOpen}
          onClose={() => setIsImageOpen(false)}
          imageUrl={tenant.avatar_url}
          altText={`Foto de perfil de ${tenant.full_name}`}
        />
      )}
    </>
  );
};

export default ApartmentCard;