import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import ApartmentCard from '../../components/admin/ApartmentCard';
import AddTenantDialog from '../../components/admin/AddTenantDialog';
import EditTenantDialog from '../../components/admin/EditTenantDialog';

const AdminDashboardPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false);
  const [apartmentToAdd, setApartmentToAdd] = useState<number | null>(null);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const navigate = useNavigate();

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    
    // 1. Buscar dados dos apartamentos e inquilinos, incluindo payment_request_pending
    const { data: aptData, error: aptError } = await supabase
      .from('apartments')
      .select('*, tenant:profiles(*)')
      .order('number', { ascending: true });

    if (aptError) {
      console.error('Error fetching apartments:', aptError);
      setError('Não foi possível carregar os dados dos apartamentos.');
      setLoading(false);
      return;
    }

    // 2. Buscar contagem de reclamações pendentes
    const { data: complaintsData, error: complaintsError } = await supabase
      .from('complaints')
      .select('apartment_number, count', { count: 'exact' })
      .eq('status', 'new');

    if (complaintsError) {
        console.warn('Error fetching pending complaints count:', complaintsError);
        // Continuamos mesmo com erro, apenas sem a contagem
    }

    const pendingComplaintsMap = new Map<number, number>();
    if (complaintsData) {
        // Agrupar a contagem por apartment_number
        complaintsData.forEach(c => {
            if (c.apartment_number) {
                pendingComplaintsMap.set(c.apartment_number, (pendingComplaintsMap.get(c.apartment_number) || 0) + 1);
            }
        });
    }

    // 3. Combinar dados
    const allApartments = Array.from({ length: 14 }, (_, i) => {
        const aptNumber = i + 1;
        const found = aptData.find(d => d.number === aptNumber);
        
        const baseApartment = found || { 
            number: aptNumber, 
            status: 'available', 
            tenant_id: null, 
            tenant: null, 
            monthly_rent: null, 
            rent_status: null, 
            next_due_date: null,
            payment_request_pending: false, // Garantir valor padrão
            amount_paid: null,
            remaining_balance: null,
        };
        
        return {
            ...baseApartment,
            pending_complaints_count: pendingComplaintsMap.get(aptNumber) || 0,
        };
    });

    setApartments(allApartments as Apartment[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  const handleOpenAddTenant = (aptNumber: number) => {
    setApartmentToAdd(aptNumber);
    setIsAddTenantDialogOpen(true);
  };

  const handleCloseAddTenant = () => {
    setIsAddTenantDialogOpen(false);
    setApartmentToAdd(null); // Limpa o estado ao fechar
  };

  const handleTenantAdded = () => {
    handleCloseAddTenant();
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
    return <div className="text-center p-10 text-slate-600 dark:text-slate-400">Carregando...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Painel do Administrador
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apartments.map((apt) => (
              <ApartmentCard
                key={apt.number}
                apartment={apt}
                onEdit={setEditingApartment}
                onView={handleViewTenant}
                onAddTenant={() => handleOpenAddTenant(apt.number)}
              />
            ))}
          </div>
        </div>
      </div>
      <AddTenantDialog
        isOpen={isAddTenantDialogOpen}
        onClose={handleCloseAddTenant}
        onSuccess={handleTenantAdded}
        availableApartments={availableApartments}
        preSelectedApartmentNumber={apartmentToAdd}
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