import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminApartmentsPage from './pages/admin/AdminApartmentsPage';
import AdminFinancePage from './pages/admin/AdminFinancePage';
import TenantLayout from './pages/tenant/TenantLayout';
import TenantDashboardPage from './pages/tenant/TenantDashboardPage';
import TenantProfilePage from './pages/tenant/TenantProfilePage';
import { Toaster } from 'react-hot-toast';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router />
    </AuthProvider>
  );
};

const Router: React.FC = () => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-hope-green-600"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={role === 'admin' ? '/admin/apartments' : '/tenant'} />} />
        <Route path="/signup" element={!user ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPasswordPage /> : <Navigate to="/" />} />
        
        <Route path="/tenant" element={user && role === 'tenant' ? <TenantLayout /> : <Navigate to="/login" />}>
          <Route index element={<TenantDashboardPage />} />
          <Route path="profile" element={<TenantProfilePage />} />
        </Route>

        <Route path="/admin" element={user && role === 'admin' ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="apartments" />} />
          <Route path="apartments" element={<AdminApartmentsPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? (role === 'admin' ? '/admin/apartments' : '/tenant') : '/login'} />} />
      </Routes>
    </HashRouter>
  );
};

export default App;