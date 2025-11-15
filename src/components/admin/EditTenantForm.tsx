import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';

interface EditTenantFormProps {
  apartment: Apartment;
  onSuccess: () => void;
}

const EditTenantForm: React.FC<EditTenantFormProps> = ({ apartment, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (apartment?.tenant) {
      setFullName(apartment.tenant.full_name || '');
      setEmail(apartment.tenant.email || '');
      setPhone(apartment.tenant.phone || '');
    }
  }, [apartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartment?.tenant) {
      toast.error("Dados do inquilino não encontrados.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Atualizando dados...');

    // Atualiza a tabela de perfis
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone: phone })
      .eq('id', apartment.tenant.id);

    if (profileError) {
      toast.error(`Erro ao atualizar perfil: ${profileError.message}`, { id: toastId });
      setLoading(false);
      return;
    }

    toast.success('Dados atualizados com sucesso!', { id: toastId });
    onSuccess();
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
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled />
        <p className="text-xs text-slate-500 mt-1">O email não pode ser alterado.</p>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Telefone</label>
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
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