import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardPage from './src/pages/admin/AdminDashboardPage';
import TenantDetailPage from './src/pages/admin/TenantDetailPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/tenant/:tenantId" element={<TenantDetailPage />} />
      </Routes>
    </>
  );
}

export default App;