import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import { Apartment } from '../../types';
import ApartmentCard from '../../components/admin/ApartmentCard';
import AddTenantModal from '../../components/admin/AddTenantModal';
import { PlusCircle, Search } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from('apartments')
            .select('*, tenant:profiles(*)')
            .order('number', { ascending: true });

        if (error) {
            console.error('Error fetching apartments:', error);
            setError('Não foi possível carregar os dados dos apartamentos. Tente novamente mais tarde.');
        } else if (data) {
            setApartments(data as any[]);
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

    const availableApartments = useMemo(() => apartments.filter(apt => apt.status === 'available'), [apartments]);

    const filteredApartments = useMemo(() => {
        if (!searchTerm) return apartments;
        return apartments.filter(apt => 
            String(apt.number).includes(searchTerm) ||
            apt.tenant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [apartments, searchTerm]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-hope-green-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-10 bg-red-50 text-red-700 rounded-lg">{error}</div>;
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Buscar por kit ou inquilino..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full md:w-64"
                    />
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-hope-green-600 text-white rounded-lg hover:bg-hope-green-700 transition-colors"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Adicionar Inquilino
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredApartments.map((apt) => (
                    <ApartmentCard key={apt.number} apartment={apt} onUpdate={fetchData} />
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