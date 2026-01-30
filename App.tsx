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
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p>Carregando...</p>
    </div>
  </div>
);

// Importação dinâmica
const AdminDashboardPage = lazy(() => import('./src/pages/admin/AdminDashboardPage'));
const TenantDetailPage = lazy(() => import('./src/pages/admin/TenantDetailPage'));
const FinanceiroPage = lazy(() => import('./src/pages/admin/FinanceiroPage'));
const AdminDocumentsPage = lazy(() => import('./src/pages/admin/AdminDocumentsPage'));
const AdminTenantDocumentsPage = lazy(() => import('./src/pages/admin/AdminTenantDocumentsPage'));
const FinancialDashboardPage = lazy(() => import('./src/pages/admin/FinancialDashboardPage'));
const AdminLogsPage = lazy(() => import('./src/pages/admin/AdminLogsPage'));
const MaintenancePage = lazy(() => import('./src/pages/admin/MaintenancePage')); // Nova página
const TenantDashboardPage = lazy(() => import('./src/pages/tenant/TenantDashboardPage'));
const LoginPage = lazy(() => import('./src/pages/LoginPage'));

function App() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
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
            <Route path="/admin/logs" element={<AdminLogsPage />} />
            <Route path="/admin/manutencao" element={<MaintenancePage />} />
          </Route>

          {/* Rotas do Inquilino */}
          <Route element={<TenantRoutes />}>
            <Route path="/tenant/dashboard" element={<TenantDashboardPage />} />
          </Route>

          {/* Redirecionamento Dinâmico Raiz */}
          <Route 
            path="/" 
            element={
              session ? (
                profile?.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/tenant/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Fallback para páginas não encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;