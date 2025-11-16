import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import { Link } from 'react-router-dom';
import { ArrowLeft, FolderOpen, User, Loader2 } from 'lucide-react';

const AdminDocumentsPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('apartments')
      .select('*, tenant:profiles(*)')
      .not('tenant_id', 'is', null)
      .order('number', { ascending: true });

    if (error) {
      setError('Não foi possível carregar os dados dos inquilinos.');
      console.error(error);
    } else {
      setApartments(data as Apartment[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Carregando inquilinos...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Documentos dos Inquilinos
        </h1>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg divide-y divide-slate-200 dark:divide-slate-700">
          {apartments.map(apt => (
            apt.tenant && (
              <Link 
                key={apt.number} 
                to={`/admin/documents/${apt.tenant.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {apt.tenant.avatar_url ? (
                      <img src={apt.tenant.avatar_url} alt={apt.tenant.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{apt.tenant.full_name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Kit {String(apt.number).padStart(2, '0')}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Ver Documentos
                  <FolderOpen className="w-4 h-4 ml-2" />
                </div>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentsPage;