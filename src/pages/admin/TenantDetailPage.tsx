import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Profile, Apartment } from '../../types';
import { ArrowLeft, User, Mail, Phone, Calendar, Home, DollarSign } from 'lucide-react';

interface TenantDetails extends Profile {
  apartment: Apartment | null;
}

const TenantDetailPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantDetails = async () => {
      if (!tenantId) {
        setError('ID do inquilino não encontrado.');
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (profileError || !profileData) {
        setError('Não foi possível carregar os dados do inquilino.');
        setLoading(false);
        return;
      }

      const { data: apartmentData, error: apartmentError } = await supabase
        .from('apartments')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();
      
      if (apartmentError) {
        console.warn("Não foi possível buscar o apartamento do inquilino:", apartmentError.message);
      }

      setTenant({ ...profileData, apartment: apartmentData || null });
      setLoading(false);
    };

    fetchTenantDetails();
  }, [tenantId]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Não informado';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return <div className="text-center p-10">Carregando dados do inquilino...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  if (!tenant) {
    return <div className="text-center p-10">Inquilino não encontrado.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{tenant.full_name}</h1>
                <p className="text-slate-500">Inquilino</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Informações de Contato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-slate-700">
                <Mail className="w-4 h-4 mr-3 text-slate-500" />
                <span>{tenant.email || 'Não informado'}</span>
              </div>
              <div className="flex items-center text-slate-700">
                <Phone className="w-4 h-4 mr-3 text-slate-500" />
                <span>{tenant.phone || 'Não informado'}</span>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Detalhes do Contrato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-slate-700">
                <Home className="w-4 h-4 mr-3 text-slate-500" />
                <span>Kit {tenant.apartment ? String(tenant.apartment.number).padStart(2, '0') : 'N/A'}</span>
              </div>
              <div className="flex items-center text-slate-700">
                <DollarSign className="w-4 h-4 mr-3 text-slate-500" />
                <span>Aluguel: {formatCurrency(tenant.apartment?.monthly_rent)}</span>
              </div>
              <div className="flex items-center text-slate-700">
                <Calendar className="w-4 h-4 mr-3 text-slate-500" />
                <span>Início do contrato: {formatDate(tenant.move_in_date)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailPage;