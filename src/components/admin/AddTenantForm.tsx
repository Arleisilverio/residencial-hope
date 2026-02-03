import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { logToApp } from '../../services/logger';
import { Apartment } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';
import { Copy, RefreshCw, Send } from 'lucide-react';
import SimpleDatePicker from '../ui/SimpleDatePicker';
import { cn, formatPhoneNumber, cleanPhoneNumber, formatFullName, formatEmail } from '../../lib/utils';
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

const N8N_WEBHOOK_URL = 'https://webhook.motoboot.com.br/webhook/boas-vindas';

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

    const rawPhone = cleanPhoneNumber(phone);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            phone: rawPhone,
            apartment_number: apartmentNumber,
            move_in_date: moveInDate.toISOString(),
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Envio para o n8n
        const n8nPayload = {
          event: 'new_tenant_registered',
          tenant_id: authData.user.id,
          apartment_number: apartmentNumber,
          temporary_password: password,
          full_name: fullName,
          email: email,
          phone: rawPhone,
          move_in_date: moveInDate.toISOString(),
          timestamp: new Date().toISOString()
        };

        console.log('[n8n-debug] Enviando carga útil:', n8nPayload);

        try {
          // Usamos await para garantir que o envio comece antes de fechar o modal
          await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(n8nPayload),
          });
          console.log('[n8n-debug] Sucesso ao chamar webhook');
        } catch (webhookError) {
          console.error('[n8n-debug] Erro ao notificar n8n:', webhookError);
        }

        // Notificação interna no sistema
        await supabase.from('notifications').insert({
          tenant_id: authData.user.id,
          title: 'Bem-vindo ao Condomínio Hope! 🎉',
          message: `Olá ${fullName.split(' ')[0]}, seu acesso ao Kit ${String(apartmentNumber).padStart(2, '0')} foi liberado.`,
          icon: 'Info',
        });

        toast.success('Inquilino cadastrado e n8n notificado!', { id: toastId });
        onSuccess();
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'Falha desconhecida'}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(formatFullName(e.target.value))} placeholder="Ex: João da Silva" required />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(formatEmail(e.target.value))} placeholder="Ex: joao@email.com" required />
      </div>
      <div>
        <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(formatPhoneNumber(e.target.value))} maxLength={15} placeholder="(41) 98765-4321" required />
      </div>
      <div>
        <label htmlFor="tempPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha Provisória</label>
        <div className="relative flex items-center">
          <Input id="tempPassword" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-20" />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
            <button type="button" onClick={handleRegeneratePassword} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleCopyPassword} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100">
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
            disabled={!!preSelectedApartmentNumber}
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
            </SelectContent>
          </Select>
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