import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';
import { Copy, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/Calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/Popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

const AddTenantForm: React.FC<AddTenantFormProps> = ({ availableApartments, onSuccess, preSelectedApartmentNumber }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState<number | ''>(preSelectedApartmentNumber || '');
  const [moveInDate, setMoveInDate] = useState<Date | undefined>(new Date());
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

    const monthlyRent = apartmentNumber >= 1 && apartmentNumber <= 6 ? 1600 : 1800;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
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
      const { error: updateError } = await supabase
        .from('apartments')
        .update({ monthly_rent: monthlyRent })
        .eq('number', apartmentNumber);

      if (updateError) {
        toast.error(`Usuário criado, mas falha ao atualizar aluguel: ${updateError.message}`, { id: toastId });
      } else {
        toast.success('Inquilino cadastrado com sucesso!', { id: toastId });
      }
      
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data de Entrada</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !moveInDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {moveInDate ? format(moveInDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border bg-popover">
              <Calendar
                mode="single"
                selected={moveInDate}
                onSelect={setMoveInDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
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