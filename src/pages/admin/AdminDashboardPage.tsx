import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import ApartmentCard from '../../components/admin/ApartmentCard';
import { Button } from '../../components/ui/Button';
import AddTenantDialog from '../../components/admin/AddTenantDialog';
import EditTenantDialog from '../../components/admin/EditTenantDialog';
import { PlusCircle } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const navigate = useNavigate();

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('apartments')
      .select('*, tenant:profiles(*)')
      .order('number', { ascending: true });

    if (error) {
      console.error('Error fetching apartments:', error);
      setError('Não foi possível carregar os dados dos apartamentos.');
    } else {
      const allApartments = Array.from({ length: 14 }, (_, i) => {
          const aptNumber = i + 1;
          const found = data.find(d => d.number === aptNumber);
          return found || { number: aptNumber, status: 'available', tenant_id: null, tenant: null, monthly_rent: null };
      });
      setApartments(allApartments as Apartment[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  const handleTenantAdded = () => {
    setIsAddTenantDialogOpen(false);
    fetchApartments();
  };

  const handleTenantUpdated = () => {
    setEditingApartment(null);
    fetchApartments();
  };

  const handleViewTenant = (tenantId: string) => {
    navigate(`/admin/tenant/${tenantId}`);
  };

  const availableApartments = apartments.filter(apt => apt.status === 'available');

  if (loading) {
    return <div className="text-center p-10">Carregando...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-4 sm:mb-0">
              Painel do Administrador
            </h1>
            {/* Botão de ícone para adicionar inquilino (Apenas ícone) */}
            <Button 
              onClick={() => setIsAddTenantDialogOpen(true)}
              title="Adicionar Novo Inquilino"
              className="p-2 h-auto w-auto" // Removendo classes de responsividade de texto
            >
              <PlusCircle className="w-5 h-5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apartments.map((apt) => (
              <ApartmentCard
                key={apt.number}
                apartment={apt}
                onEdit={setEditingApartment}
                onView={handleViewTenant}
                onAddTenant={() => {
                  // Se o apartamento estiver vago, abrimos o diálogo de adição
                  if (!apt.tenant) {
                    setIsAddTenantDialogOpen(true);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <AddTenantDialog
        isOpen={isAddTenantDialogOpen}
        onClose={() => setIsAddTenantDialogOpen(false)}
        onSuccess={handleTenantAdded}
        availableApartments={availableApartments}
      />
      <EditTenantDialog
        isOpen={!!editingApartment}
        onClose={() => setEditingApartment(null)}
        onSuccess={handleTenantUpdated}
        apartment={editingApartment}
      />
    </>
  );
};

export default AdminDashboardPage;