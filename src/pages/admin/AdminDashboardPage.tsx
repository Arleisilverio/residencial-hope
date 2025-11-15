import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import ApartmentCard from '../../components/admin/ApartmentCard';

const AdminDashboardPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApartments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('apartments')
        .select('*, tenant:profiles(*)')
        .order('number', { ascending: true });

      if (error) {
        console.error('Error fetching apartments:', error);
        setError('Não foi possível carregar os dados dos apartamentos.');
      } else {
        // Garante que temos 14 apartamentos, mesmo que alguns não venham do DB
        const allApartments = Array.from({ length: 14 }, (_, i) => {
            const aptNumber = i + 1;
            const found = data.find(d => d.number === aptNumber);
            return found || { number: aptNumber, status: 'available', tenant_id: null, tenant: null };
        });
        setApartments(allApartments as Apartment[]);
      }
      setLoading(false);
    };

    fetchApartments();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Carregando...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Painel do Administrador
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apartments.map((apt) => (
            <ApartmentCard key={apt.number} apartment={apt} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;