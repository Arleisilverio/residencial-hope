import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wrench, Loader2, MessageSquare, AlertCircle, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import ComplaintDetailDialog from '../../components/admin/ComplaintDetailDialog';
import AdminReplyDialog from '../../components/admin/AdminReplyDialog';

interface ComplaintNotification {
  id: string;
  apartment_number: number;
  category: string;
  description: string;
  tenant_id: string;
  tenant_name: string;
  status: 'new' | 'in_progress' | 'resolved';
}

const categoryMap: { [key: string]: string } = {
    hidraulica: 'Hidráulica',
    eletrica: 'Elétrica',
    estrutura: 'Estrutura',
    outros: 'Outros',
    reparo: 'Manutenção IA',
    message: 'Mensagem',
};

const MaintenancePage: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintNotification | null>(null);
  const [replyingTo, setReplyingTo] = useState<ComplaintNotification | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select(`id, apartment_number, category, description, status, tenant_id, tenant:profiles(full_name)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Erro ao carregar solicitações.');
    } else {
      const formattedData: ComplaintNotification[] = data.map(c => ({
        id: c.id,
        apartment_number: c.apartment_number,
        category: c.category,
        description: c.description,
        status: c.status,
        tenant_id: c.tenant_id,
        tenant_name: (c.tenant as any)?.full_name || 'Inquilino Desconhecido',
      }));
      setComplaints(formattedData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleDelete = async (id: string, apt: number) => {
    try {
      const { error } = await supabase.from('complaints').delete().eq('id', id);
      if (error) throw error;
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast.success(`Solicitação do Kit ${apt} removida.`);
    } catch (error) {
      toast.error('Erro ao remover.');
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(c.apartment_number).includes(searchTerm)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <Wrench className="w-8 h-8 mr-3 text-blue-600" />
              Central de Manutenção
            </h1>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar por Kit ou Nome..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-slate-500">Buscando chamados...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhuma solicitação encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((c) => {
              const isIA = c.description.includes('[IA -');
              const isHigh = c.description.includes('ALTA');
              
              return (
                <div 
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`group relative bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border-l-4 transition-all hover:shadow-lg cursor-pointer ${
                    isHigh ? 'border-red-500 bg-red-50/30' : 
                    isIA ? 'border-blue-500 bg-blue-50/30' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Kit {String(c.apartment_number).padStart(2, '0')} • {categoryMap[c.category] || c.category}
                    </span>
                    {isHigh && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">URGENTE</span>}
                  </div>
                  
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{c.tenant_name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {c.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs font-medium text-blue-600 dark:text-blue-400">
                    <span className="group-hover:underline">Ver detalhes e responder</span>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Diálogos */}
      <ComplaintDetailDialog
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        complaint={selectedComplaint}
        onReply={(c) => {
          setSelectedComplaint(null);
          setReplyingTo(c);
        }}
        onDelete={handleDelete}
      />

      <AdminReplyDialog
        isOpen={!!replyingTo}
        onClose={() => setReplyingTo(null)}
        onSuccess={() => {
          if (replyingTo) handleDelete(replyingTo.id, replyingTo.apartment_number);
        }}
        tenant={replyingTo ? { id: replyingTo.tenant_id, name: replyingTo.tenant_name } : null}
      />
    </div>
  );
};

export default MaintenancePage;