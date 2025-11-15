import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminDashboardPage from './src/pages/admin/AdminDashboardPage';
import TenantDetailPage from './src/pages/admin/TenantDetailPage';
import FinanceiroPage from './src/pages/admin/FinanceiroPage'; // Importando a nova página
import TenantDashboardPage from './src/pages/tenant/TenantDashboardPage';
import LoginPage from './src/pages/LoginPage';
import AdminLayout from './src/components/layouts/AdminLayout';
import TenantLayout from './src/components/layouts/TenantLayout';
import RoleProtectedRoute from './src/components/auth/RoleProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './src/contexts/AuthContext';

function App() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">Carregando autenticação...</div>;
  }

  const AdminRoutes = () => (
    <RoleProtectedRoute allowedRoles={['admin']} redirectTo={profile?.role === 'tenant' ? '/tenant/dashboard' : '/login'}>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </RoleProtectedRoute>
  );

  const TenantRoutes = () => (
    <RoleProtectedRoute allowedRoles={['tenant']} redirectTo={profile?.role === 'admin' ? '/admin/dashboard' : '/login'}>
      <TenantLayout>
        <Outlet />
      </TenantLayout>
    </RoleProtectedRoute>
  );

  // Lógica de redirecionamento inicial
  const initialRedirectPath = profile?.role === 'admin' 
    ? "/admin/dashboard" 
    : profile?.role === 'tenant' 
    ? "/tenant/dashboard" 
    : "/login";

  return (
    <>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas do Administrador */}
        <Route element={<AdminRoutes />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/tenant/:tenantId" element={<TenantDetailPage />} />
          <Route path="/admin/financeiro" element={<FinanceiroPage />} /> {/* Nova Rota */}
        </Route>

        {/* Rotas do Inquilino */}
        <Route element={<TenantRoutes />}>
          <Route path="/tenant/dashboard" element={<TenantDashboardPage />} />
          {/* Adicionar outras rotas do inquilino aqui */}
        </Route>

        {/* Rota raiz redireciona com base na role */}
        <Route 
          path="/" 
          element={<Navigate to={initialRedirectPath} replace />} 
        />
      </Routes>
    </>
  );
}

export default App;