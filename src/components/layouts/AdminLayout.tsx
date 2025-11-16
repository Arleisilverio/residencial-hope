import React, { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, DollarSign, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggleButton from '../common/ThemeToggleButton';
import PaymentRequestBell from '../admin/PaymentRequestBell';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const toastId = toast.loading('Saindo...');
    try {
      await signOut();
      toast.success('Você saiu com sucesso!', { id: toastId });
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao sair.', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-black/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Condomínio Hope</h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* Sino de Notificação de Pagamento */}
              <PaymentRequestBell />

              {/* Botão de Gerenciamento de Documentos */}
              <Link
                to="/admin/documents"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Documentos dos Inquilinos"
              >
                <FolderOpen className="w-5 h-5" />
              </Link>

              {/* Botão de Gerenciamento Financeiro */}
              <Link
                to="/admin/financeiro"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Gerenciamento Financeiro"
              >
                <DollarSign className="w-5 h-5" />
              </Link>
              
              {/* Botão de Tema */}
              <ThemeToggleButton />

              {/* Botão de Sair */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;