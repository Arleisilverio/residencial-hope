import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import ApartmentCard from '../../components/admin/ApartmentCard';
import AddTenantModal from '../../components/admin/AddTenantModal';
import { PlusCircle } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('apartments').select('*, tenant:profiles(*)');
        if (error) {
            console.error('Error fetching apartments:', error);
        } else if (data) {
            const sortedData = (data as any[]).sort((a, b) => a.number - b.number);
            setApartments(sortedData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        
        const channel = supabase.channel('public:apartments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'apartments' }, fetchData)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const availableApartments = apartments.filter(apt => apt.status === 'available');

    if (loading) {
        return <div className="text-center p-10">Carregando apartamentos...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-700">Visão Geral dos Apartamentos</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-hope-green-600 text-white rounded-lg hover:bg-hope-green-700 transition-colors"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Adicionar Inquilino
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {apartments.map((apt) => (
                    <ApartmentCard key={apt.number} apartment={apt} onStatusChange={fetchData} />
                ))}
            </div>
            <AddTenantModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTenantAdded={fetchData}
                availableApartments={availableApartments}
            />
        </div>
    );
};

export default AdminDashboardPage;