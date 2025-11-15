import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardPage from './src/pages/admin/AdminDashboardPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </>
  );
}

export default App;