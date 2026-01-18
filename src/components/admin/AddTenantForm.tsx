import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';
import { Copy, RefreshCw } from 'lucide-react';
import SimpleDatePicker from '../ui/SimpleDatePicker';
import { cn, formatPhoneNumber, formatFullName, formatEmail } from '../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';

interface AddTenantFormProps {
  availableApartments: Apartment[];
  onSuccess: () => void;
  preSelectedApartmentNumber: number | null;
}

// URL do webhook do n8n atualizada
const N8N_WEBHOOK_URL = 'https://webhook.motoboot.com.br/webhook/teste';

const AddTenantForm: React.FC<AddTenantFormProps> = ({ availableApartments, onSuccess, preSelectedApartmentNumber }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState<number | ''>(preSelectedApartmentNumber || '');
  const [moveInDate, setMoveInDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preSelectedApartmentNumber) {
      setApartmentNumber(preSelectedApartmentNumber);
    }
  }, [preSelectedApartmentNumber]);

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
    if (!fullName || !email || !phone || !password || !apartmentNumber || !moveInDate) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Cadastrando inquilino...');

    const currentPassword = password;

    // 1. Criação do usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: currentPassword,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          apartment_number: apartmentNumber,
          move_in_date: moveInDate.toISOString(),
        },
      },
    });

    if (authError) {
      toast.error(`Erro ao criar usuário: ${authError.message}`, { id: toastId });
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Aciona o webhook do n8n diretamente do frontend
      const n8nPayload = {
        event: 'new_tenant_registered',
        tenant_id: authData.user.id,
        apartment_number: apartmentNumber,
        temporary_password: currentPassword,
        profile: {
            id: authData.user.id,
            full_name: fullName,
            email: email,
            phone: phone,
            apartment_number: apartmentNumber,
            move_in_date: moveInDate.toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nPayload),
        });
        // Não verificamos o sucesso do fetch, pois o cadastro já foi feito.
      } catch (error) {
        console.error('Falha ao notificar n8n:', error);
        // O usuário não precisa saber que a notificação falhou, apenas que o cadastro foi feito.
      }

      // 3. Sucesso e fechamento do formulário
      toast.success('Inquilino cadastrado com sucesso! O workflow de boas-vindas foi iniciado.', { id: toastId });
      onSuccess();
    }
    
    setLoading(false);
  };

  const isApartmentSelectionDisabled = !!preSelectedApartmentNumber;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
        <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(formatFullName(e.target.value))} placeholder="Ex: João da Silva" required />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(formatEmail(e.target.value))} placeholder="Ex: joao.silva@email.com" required />
      </div>
      <div>
        <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(formatPhoneNumber(e.target.value))} maxLength={15} placeholder="Ex: (11) 98765-4321" required />
      </div>
      <div>
        <label htmlFor="tempPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha Provisória</label>
        <div className="relative flex items-center">
          <Input
            id="tempPassword"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-20"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
            <button type="button" onClick={handleRegeneratePassword} title="Gerar nova senha" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleCopyPassword} title="Copiar senha" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="apartmentNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">Apartamento</label>
          <Select
            value={apartmentNumber ? String(apartmentNumber) : ''}
            onValueChange={(value) => setApartmentNumber(Number(value))}
            required
            disabled={isApartmentSelectionDisabled}
          >
            <SelectTrigger id="apartmentNumber" className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {availableApartments.map(apt => (
                <SelectItem key={apt.number} value={String(apt.number)}>
                  Kit {String(apt.number).padStart(2, '0')}
                </SelectItem>
              ))}
              {isApartmentSelectionDisabled && !availableApartments.find(apt => apt.number === preSelectedApartmentNumber) && preSelectedApartmentNumber && (
                  <SelectItem key={preSelectedApartmentNumber} value={String(preSelectedApartmentNumber)}>
                      Kit {String(preSelectedApartmentNumber).padStart(2, '0')} (Selecionado)
                  </SelectItem>
              )}
            </SelectContent>
          </Select>
          {isApartmentSelectionDisabled && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Apartamento pré-selecionado.</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Data de Entrada</label>
          <SimpleDatePicker value={moveInDate} onSelect={setMoveInDate} />
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