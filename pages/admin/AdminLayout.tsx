import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, Building2, DollarSign, Wrench, User, LogOut } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Building2 },
        { name: 'Financeiro', href: '/admin/finance', icon: DollarSign },
        // { name: 'Reclamações', href: '/admin/complaints', icon: Wrench },
        // { name: 'Perfil', href: '/admin/profile', icon: User },
    ];

    return (
        <div className="flex h-screen bg-slate-100">
            <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
                <div className="h-20 flex items-center justify-center px-4 border-b border-slate-200">
                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-hope-green-100 text-hope-green-600 font-bold text-2xl">
                        H
                    </div>
                    <span className="ml-3 font-semibold text-xl text-slate-800">Hope</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-hope-green-100 text-hope-green-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`
                            }
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-slate-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sair
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 p-6">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Olá, {user?.full_name?.split(' ')[0]} — bem vindo ao painel do Hope
                    </h1>
                </header>
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;