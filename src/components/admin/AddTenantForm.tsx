import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';
import { Copy, RefreshCw } from 'lucide-react';

interface AddTenantFormProps {
  availableApartments: Apartment[];
  onSuccess: () => void;
}

const AddTenantForm: React.FC<AddTenantFormProps> = ({ availableApartments, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState<number | ''>('');
  const [monthlyRent, setMonthlyRent] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const generateRandomPassword = (length = 10) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }
    return newPassword;
  };

  useEffect(() => {
    setPassword(generateRandomPassword());
  }, []);

  const handleRegeneratePassword = () => {
    setPassword(generateRandomPassword());
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    toast.success('Senha copiada para a área de transferência!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password || !apartmentNumber || !monthlyRent) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Cadastrando inquilino...');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          apartment_number: apartmentNumber,
        },
      },
    });

    if (authError) {
      toast.error(`Erro ao criar usuário: ${authError.message}`, { id: toastId });
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: updateError } = await supabase
        .from('apartments')
        .update({ monthly_rent: monthlyRent })
        .eq('number', apartmentNumber);

      if (updateError) {
        toast.error(`Usuário criado, mas falha ao atualizar aluguel: ${updateError.message}`, { id: toastId });
      } else {
        toast.success('Inquilino cadastrado com sucesso!', { id: toastId });
        onSuccess();
      }
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Nome Completo</label>
        <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Telefone</label>
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Senha Provisória</label>
        <div className="relative flex items-center">
          <Input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-20"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
            <button type="button" onClick={handleRegeneratePassword} title="Gerar nova senha" className="text-slate-500 hover:text-slate-800">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleCopyPassword} title="Copiar senha" className="text-slate-500 hover:text-slate-800">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Apartamento</label>
          <select
            value={apartmentNumber}
            onChange={(e) => setApartmentNumber(Number(e.target.value))}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            required
          >
            <option value="" disabled>Selecione...</option>
            {availableApartments.map(apt => (
              <option key={apt.number} value={apt.number}>
                Kit {String(apt.number).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Valor do Aluguel</label>
          <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))} required />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Inquilino'}
        </Button>
      </div>
    </form>
  );
};

export default AddTenantForm;