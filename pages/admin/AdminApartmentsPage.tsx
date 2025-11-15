
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import ApartmentCard from '../../components/admin/ApartmentCard';

const AdminApartmentsPage: React.FC = () => {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('apartments').select('*, tenant:users(*)');
        if (error) {
            console.error('Error fetching apartments:', error);
        } else if (data) {
            // Sorting to ensure a consistent order
            const sortedData = (data as any[]).sort((a, b) => a.number - b.number);
            setApartments(sortedData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        
        // In a real Supabase app, you would set up realtime listeners here
        // to automatically update the UI when data changes.
        const channel = supabase.channel('public:apartments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'apartments' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_requests' }, fetchData)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) {
        return <div className="text-center p-10">Carregando apartamentos...</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-700 mb-6">Visão Geral dos Apartamentos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {apartments.map((apt) => (
                    <ApartmentCard key={apt.number} apartment={apt} onStatusChange={fetchData} />
                ))}
            </div>
        </div>
    );
};

export default AdminApartmentsPage;
