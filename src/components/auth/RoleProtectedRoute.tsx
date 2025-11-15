import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Profile } from '../../types';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Profile['role'][];
  redirectTo: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles, redirectTo }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!user) {
    // Não autenticado, redireciona para o login
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    // Autenticado, mas perfil não carregado (pode ser um erro ou carregamento lento)
    // Por segurança, redirecionamos para o login ou uma página de erro.
    // Neste caso, vamos esperar o carregamento do perfil.
    return <div className="flex justify-center items-center h-screen">Verificando permissões...</div>;
  }

  if (!allowedRoles.includes(profile.role)) {
    // Autenticado, mas sem a role necessária, redireciona para a rota de fallback
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;