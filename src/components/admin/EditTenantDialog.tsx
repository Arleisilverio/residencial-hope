import React from 'react';
import { Apartment } from '../../types';
import { Dialog } from '../ui/Dialog';
import EditTenantForm from './EditTenantForm';

interface EditTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apartment: Apartment | null;
}

const EditTenantDialog: React.FC<EditTenantDialogProps> = ({ isOpen, onClose, onSuccess, apartment }) => {
  if (!apartment) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Editar Inquilino - Kit ${String(apartment.number).padStart(2, '0')}`}>
      <EditTenantForm apartment={apartment} onSuccess={onSuccess} />
    </Dialog>
  );
};

export default EditTenantDialog;