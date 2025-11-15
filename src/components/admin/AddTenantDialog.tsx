import React from 'react';
import { Apartment } from '../../types';
import { Dialog } from '../ui/Dialog';
import AddTenantForm from './AddTenantForm';

interface AddTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableApartments: Apartment[];
  preSelectedApartmentNumber: number | null; // Nova prop
}

const AddTenantDialog: React.FC<AddTenantDialogProps> = ({ isOpen, onClose, onSuccess, availableApartments, preSelectedApartmentNumber }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Adicionar Novo Inquilino">
      <AddTenantForm 
        availableApartments={availableApartments} 
        onSuccess={onSuccess} 
        preSelectedApartmentNumber={preSelectedApartmentNumber} // Passa para o formulário
      />
    </Dialog>
  );
};

export default AddTenantDialog;