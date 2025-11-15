import React from 'react';
import { Apartment } from '../../types';
import { Dialog } from '../ui/Dialog';
import AddTenantForm from './AddTenantForm';

interface AddTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableApartments: Apartment[];
}

const AddTenantDialog: React.FC<AddTenantDialogProps> = ({ isOpen, onClose, onSuccess, availableApartments }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Adicionar Novo Inquilino">
      <AddTenantForm availableApartments={availableApartments} onSuccess={onSuccess} />
    </Dialog>
  );
};

export default AddTenantDialog;