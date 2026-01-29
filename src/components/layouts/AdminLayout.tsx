import React, { ReactNode, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, DollarSign, FolderOpen, BarChart2, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggleButton from '../common/ThemeToggleButton';
import PaymentRequestBell from '../admin/PaymentRequestBell';
import RepairNotificationIcon from '../admin/RepairNotificationIcon';
import ImageViewerDialog from '../common/ImageViewerDialog';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLogoViewerOpen, setIsLogoViewerOpen] = useState(false);

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
              <button onClick={() => setIsLogoViewerOpen(true)} title="Visualizar Logo">
                <img 
                  src="/logo.jpeg" 
                  alt="Condomínio Hope Logo" 
                  className="h-12 w-auto object-contain cursor-pointer" 
                />
              </button>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <RepairNotificationIcon />
              <PaymentRequestBell />

              <Link
                to="/admin/documents"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Documentos dos Inquilinos"
              >
                <FolderOpen className="w-5 h-5" />
              </Link>

              <Link
                to="/admin/financeiro"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Gerenciamento de Aluguéis"
              >
                <DollarSign className="w-5 h-5" />
              </Link>

              <Link
                to="/admin/financial-dashboard"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Receitas e Despesas"
              >
                <BarChart2 className="w-5 h-5" />
              </Link>

              {/* Novo ícone de Logs */}
              <Link
                to="/admin/logs"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Logs do Sistema"
              >
                <Terminal className="w-5 h-5" />
              </Link>
              
              <ThemeToggleButton />

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
      
      <ImageViewerDialog
        isOpen={isLogoViewerOpen}
        onClose={() => setIsLogoViewerOpen(false)}
        imageUrl="/logo.jpeg"
        altText="Logo Condomínio Hope"
      />
    </div>
  );
};

export default AdminLayout;