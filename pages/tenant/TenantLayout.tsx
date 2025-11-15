
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut } from 'lucide-react';

const TenantLayout: React.FC = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                             <div className="h-12 w-12 flex items-center justify-center rounded-full bg-hope-green-100 text-hope-green-600 font-bold text-2xl">
                                H
                            </div>
                            <span className="ml-3 font-semibold text-xl text-slate-800">Residencial Hope</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="h-5 w-5 mr-2" />
                            Sair
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default TenantLayout;
