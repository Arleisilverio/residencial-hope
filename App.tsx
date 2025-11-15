import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminDashboardPage from './src/pages/admin/AdminDashboardPage';
import TenantDetailPage from './src/pages/admin/TenantDetailPage';
import LoginPage from './src/pages/LoginPage';
import AdminLayout from './src/components/layouts/AdminLayout';
import ProtectedRoute from './src/components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './src/contexts/AuthContext';

function App() {
  const { session } = useAuth();

  const AdminRoutes = () => (
    <ProtectedRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );

  return (
    <>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<AdminRoutes />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/tenant/:tenantId" element={<TenantDetailPage />} />
        </Route>

        <Route 
          path="/" 
          element={<Navigate to={session ? "/admin/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </>
  );
}

export default App;