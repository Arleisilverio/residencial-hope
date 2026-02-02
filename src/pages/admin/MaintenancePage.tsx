import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wrench, Loader2, Search, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import ComplaintDetailDialog, { ComplaintNotification } from '../../components/admin/ComplaintDetailDialog';
import AdminReplyDialog from '../../components/admin/AdminReplyDialog';

const categoryMap: { [key: string]: string } = {
    hidraulica: 'Hidráulica',
    eletrica: 'Elétrica',
    estrutura: 'Estrutura',
    outros: 'Outros',
    reparo: 'Manutenção IA',
};

const statusLabels = {
    new: { label: 'Nova', color: 'bg-red-100 text-red-600 border-red-200' },
    in_progress: { label: 'Em Manutenção', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    resolved: { label: 'Concluída', color: 'bg-green-100 text-green-600 border-green-200' },
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
      .neq('category', 'message')
      .order('created_at', { ascending: false });

    if (!error && data) {
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

      // Marca o ID da mais recente como "visto" para limpar o badge do sino
      if (formattedData.length > 0) {
        localStorage.setItem('last_seen_maintenance_id', formattedData[0].id);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este registro permanentemente?')) return;
    const { error } = await supabase.from('complaints').delete().eq('id', id);
    if (!error) {
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast.success('Registro excluído.');
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
            <Link to="/admin/dashboard" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <Wrench className="w-8 h-8 mr-3 text-blue-600" />
              Central de Manutenção
            </h1>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar chamado..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((c) => (
              <div 
                key={c.id}
                onClick={() => setSelectedComplaint(c)}
                className={`group relative bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border-l-4 transition-all hover:shadow-lg cursor-pointer ${
                    c.status === 'resolved' ? 'border-green-500 opacity-75' : 
                    c.status === 'in_progress' ? 'border-blue-500' : 'border-red-500'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Kit {String(c.apartment_number).padStart(2, '0')} • {categoryMap[c.category] || c.category}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${statusLabels[c.status].color}`}>
                    {statusLabels[c.status].label}
                  </span>
                </div>
                
                <p className="text-sm font-semibold mb-1">{c.tenant_name}</p>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">{c.description}</p>
                
                <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs font-medium text-blue-600">Ver e Atualizar</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                    >
                        <AlertCircle className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ComplaintDetailDialog
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        complaint={selectedComplaint}
        onReply={(c) => { setSelectedComplaint(null); setReplyingTo(c); }}
        onStatusUpdate={fetchComplaints}
      />

      <AdminReplyDialog
        isOpen={!!replyingTo}
        onClose={() => setReplyingTo(null)}
        onSuccess={() => { /* Sucesso via callback original */ }}
        tenant={replyingTo ? { id: replyingTo.tenant_id, name: replyingTo.tenant_name } : null}
      />
    </div>
  );
};

export default MaintenancePage;