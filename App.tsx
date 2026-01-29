import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './src/contexts/AuthContext';

// Layouts e Componentes de Proteção
import AdminLayout from './src/components/layouts/AdminLayout';
import TenantLayout from './src/components/layouts/TenantLayout';
import RoleProtectedRoute from './src/components/auth/RoleProtectedRoute';

// Componente de Carregamento
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
    Carregando página...
  </div>
);

// Importação dinâmica (lazy loading) das páginas
const AdminDashboardPage = lazy(() => import('./src/pages/admin/AdminDashboardPage'));
const TenantDetailPage = lazy(() => import('./src/pages/admin/TenantDetailPage'));
const FinanceiroPage = lazy(() => import('./src/pages/admin/FinanceiroPage'));
const AdminDocumentsPage = lazy(() => import('./src/pages/admin/AdminDocumentsPage'));
const AdminTenantDocumentsPage = lazy(() => import('./src/pages/admin/AdminTenantDocumentsPage'));
const FinancialDashboardPage = lazy(() => import('./src/pages/admin/FinancialDashboardPage'));
const AdminLogsPage = lazy(() => import('./src/pages/admin/AdminLogsPage')); // Nova página
const TenantDashboardPage = lazy(() => import('./src/pages/tenant/TenantDashboardPage'));
const LoginPage = lazy(() => import('./src/pages/LoginPage'));

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

  const initialRedirectPath = profile?.role === 'admin' 
    ? "/admin/dashboard" 
    : profile?.role === 'tenant' 
    ? "/tenant/dashboard" 
    : "/login";

  return (
    <>
      <Toaster position="bottom-right" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas do Administrador */}
          <Route element={<AdminRoutes />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/tenant/:tenantId" element={<TenantDetailPage />} />
            <Route path="/admin/financeiro" element={<FinanceiroPage />} />
            <Route path="/admin/documents" element={<AdminDocumentsPage />} />
            <Route path="/admin/documents/:tenantId" element={<AdminTenantDocumentsPage />} />
            <Route path="/admin/financial-dashboard" element={<FinancialDashboardPage />} />
            <Route path="/admin/logs" element={<AdminLogsPage />} /> {/* Nova rota */}
          </Route>

          {/* Rotas do Inquilino */}
          <Route element={<TenantRoutes />}>
            <Route path="/tenant/dashboard" element={<TenantDashboardPage />} />
          </Route>

          {/* Rota raiz redireciona com base na role */}
          <Route 
            path="/" 
            element={<Navigate to={initialRedirectPath} replace />} 
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;