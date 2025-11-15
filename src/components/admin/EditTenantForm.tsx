import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';
import { Copy, RefreshCw } from 'lucide-react';
import { formatPhoneNumber, formatFullName } from '../../lib/utils';

interface EditTenantFormProps {
  apartment: Apartment;
  onSuccess: () => void;
}

const EditTenantForm: React.FC<EditTenantFormProps> = ({ apartment, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (apartment?.tenant) {
      setFullName(apartment.tenant.full_name || '');
      setEmail(apartment.tenant.email || '');
      setPhone(apartment.tenant.phone || '');
      setNewPassword('');
    }
  }, [apartment]);

  const generateRandomPassword = (length = 10) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    let generatedPassword = "";
    for (let i = 0; i < length; i++) {
      generatedPassword += charset[array[i] % charset.length];
    }
    setNewPassword(generatedPassword);
  };

  const handleCopyPassword = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      toast.success('Senha copiada para a área de transferência!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartment?.tenant) {
      toast.error("Dados do inquilino não encontrados.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Atualizando dados...');

    try {
      if (newPassword) {
        const { error: functionError } = await supabase.functions.invoke('reset-user-password', {
          body: { userId: apartment.tenant.id, newPassword },
        });

        if (functionError) {
          throw new Error(`Falha ao redefinir senha: ${functionError.message}`);
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone: phone })
        .eq('id', apartment.tenant.id);

      if (profileError) {
        throw profileError;
      }

      toast.success('Dados do inquilino atualizados com sucesso!', { id: toastId });
      onSuccess();

    } catch (error) {
      console.error('Update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      toast.error(`Erro ao atualizar: ${errorMessage}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="editFullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
        <Input id="editFullName" type="text" value={fullName} onChange={(e) => setFullName(formatFullName(e.target.value))} placeholder="Ex: João da Silva" required />
      </div>
      <div>
        <label htmlFor="editEmail" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
        <Input id="editEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">O email não pode ser alterado.</p>
      </div>
      <div>
        <label htmlFor="editPhone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
        <Input id="editPhone" type="tel" value={phone} onChange={(e) => setPhone(formatPhoneNumber(e.target.value))} maxLength={15} placeholder="Ex: (11) 98765-4321" required />
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Redefinir Senha</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Gere uma nova senha temporária para o inquilino. Deixe em branco se não quiser alterar.
        </p>
        <div className="relative flex items-center">
          <Input
            id="newPassword"
            type="text"
            value={newPassword}
            readOnly
            placeholder="Clique em 'Gerar' para criar uma nova senha"
            className="pr-20 bg-slate-50 dark:bg-slate-900/50"
            aria-label="Nova senha gerada"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
            <button type="button" onClick={() => generateRandomPassword()} title="Gerar nova senha" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleCopyPassword} title="Copiar senha" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100" disabled={!newPassword}>
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};

export default EditTenantForm;