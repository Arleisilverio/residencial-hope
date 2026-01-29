import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const LoginPage: React.FC = () => {
  const { session, profile, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Só redireciona se a sessão existir e o perfil já estiver carregado
    if (session && profile && !loading) {
      if (profile.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (profile.role === 'tenant') {
        navigate('/tenant/dashboard', { replace: true });
      }
    }
  }, [session, profile, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Condomínio Hope
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Faça login para acessar o painel
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                }
              }
            }
          }}
          theme={theme}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Endereço de e-mail',
                password_label: 'Sua senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                link_text: 'Não tem uma conta? Cadastre-se',
              },
              sign_up: {
                email_label: 'Endereço de e-mail',
                password_label: 'Crie uma senha',
                button_label: 'Cadastrar',
                loading_button_label: 'Cadastrando...',
                link_text: 'Já tem uma conta? Entre',
              }
            },
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;