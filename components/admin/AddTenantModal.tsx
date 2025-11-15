import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import toast from 'react-hot-toast';
import { X, UserPlus } from 'lucide-react';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantAdded: () => void;
  availableApartments: Apartment[];
}

const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose, onTenantAdded, availableApartments }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState<number | ''>('');
  const [initialPassword, setInitialPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !apartmentNumber || !initialPassword) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Adicionando inquilino...');

    try {
      const { data, error } = await supabase.functions.invoke('create-and-assign-tenant', {
        body: {
          email,
          password: initialPassword,
          full_name: fullName,
          phone,
          apartment_number: apartmentNumber,
        },
      });

      if (error) throw error;

      if (data.error) {
         throw new Error(data.error);
      }

      toast.success('Inquilino adicionado com sucesso!', { id: toastId });
      onTenantAdded();
      onClose();
      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setApartmentNumber('');
      setInitialPassword('');
    } catch (error: any) {
      console.error('Error adding tenant:', error);
      toast.error(`Falha ao adicionar inquilino: ${error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100">
          <X className="h-6 w-6 text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Adicionar Novo Inquilino</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
          <input type="tel" placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
          <select value={apartmentNumber} onChange={(e) => setApartmentNumber(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md" required>
            <option value="" disabled>Selecione um apartamento vago</option>
            {availableApartments.map(apt => (
              <option key={apt.number} value={apt.number}>Kit {String(apt.number).padStart(2, '0')}</option>
            ))}
          </select>
          <input type="password" placeholder="Senha Inicial" value={initialPassword} onChange={(e) => setInitialPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
          <p className="text-xs text-slate-500">O inquilino deverá alterar esta senha no primeiro login.</p>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 mr-3 rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 flex items-center rounded-md text-white bg-hope-green-600 hover:bg-hope-green-700 disabled:bg-hope-green-300">
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Adicionando...' : 'Adicionar Inquilino'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTenantModal;