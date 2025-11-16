import React, { useState } from 'react';
import { Apartment } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apartment: Apartment | null;
}

const DeleteTenantDialog: React.FC<DeleteTenantDialogProps> = ({ isOpen, onClose, onSuccess, apartment }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!apartment || !apartment.tenant) {
      toast.error('Dados do inquilino inválidos.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Removendo inquilino e seus dados...');

    try {
      const { error } = await supabase.functions.invoke('delete-tenant', {
        body: { tenantId: apartment.tenant.id },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Inquilino removido com sucesso!', { id: toastId });
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error(`Falha ao remover inquilino: ${error instanceof Error ? error.message : 'Erro desconhecido.'}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!apartment || !apartment.tenant) return null;

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Remover Inquilino - Kit ${String(apartment.number).padStart(2, '0')}`}
    >
      <div className="space-y-4">
        <div className="flex items-start p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mr-4 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-200">Atenção! Ação Irreversível</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Você está prestes a remover permanentemente o inquilino <strong className="font-semibold">{apartment.tenant.full_name}</strong>.
              Todos os dados associados, incluindo perfil, documentos, reclamações e histórico financeiro, serão apagados.
            </p>
          </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300">
          O Kit {String(apartment.number).padStart(2, '0')} será marcado como "Vago" após a remoção.
        </p>
        
        <p className="text-slate-600 dark:text-slate-300">
          Tem certeza de que deseja continuar?
        </p>

        <div className="flex justify-end items-center pt-4 space-x-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            <Trash2 className="w-4 h-4 mr-2" />
            {loading ? 'Removendo...' : 'Sim, Remover Inquilino'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteTenantDialog;