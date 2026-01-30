import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Wrench, User, Home, MessageSquare, Send, Trash2, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

export interface ComplaintNotification {
  id: string;
  apartment_number: number;
  category: string;
  description: string;
  tenant_id: string;
  tenant_name: string;
  status: 'new' | 'in_progress' | 'resolved';
}

interface ComplaintDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: ComplaintNotification | null;
  onReply: (complaint: ComplaintNotification) => void;
  onStatusUpdate: () => void;
}

const categoryMap: { [key: string]: string } = {
  hidraulica: 'Hidráulica',
  eletrica: 'Elétrica',
  estrutura: 'Estrutura',
  outros: 'Outros',
  reparo: 'Manutenção IA',
  message: 'Mensagem',
};

const ComplaintDetailDialog: React.FC<ComplaintDetailDialogProps> = ({ 
  isOpen, 
  onClose, 
  complaint, 
  onReply, 
  onStatusUpdate
}) => {
  const [loading, setLoading] = useState(false);

  if (!complaint) return null;

  const updateStatus = async (newStatus: 'in_progress' | 'resolved') => {
    setLoading(true);
    const toastId = toast.loading('Atualizando status...');
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', complaint.id);

      if (error) throw error;

      toast.success(`Status alterado para ${newStatus === 'resolved' ? 'Concluído' : 'Em Manutenção'}`, { id: toastId });
      onStatusUpdate();
      onClose();
    } catch (e) {
      toast.error('Erro ao atualizar status', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const isIA = complaint.description.includes('[IA -');

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Detalhes da Solicitação">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-700">
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${isIA ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600 dark:bg-slate-600'}`}>
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Categoria</p>
              <p className="font-bold">{categoryMap[complaint.category] || complaint.category}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Localização</p>
            <p className="font-bold">Kit {String(complaint.apartment_number).padStart(2, '0')}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border rounded-lg">
          <div className="flex items-center mb-2 text-slate-500">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase">Relato do Inquilino</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t dark:border-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => updateStatus('in_progress')}
                disabled={loading || complaint.status === 'in_progress'}
            >
                <Clock className="w-4 h-4 mr-2" />
                Em Manutenção
            </Button>
            <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => updateStatus('resolved')}
                disabled={loading || complaint.status === 'resolved'}
            >
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluído
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
                className="bg-blue-600" 
                onClick={() => onReply(complaint)}
                disabled={loading}
            >
                <Send className="w-4 h-4 mr-2" />
                Responder no App
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ComplaintDetailDialog;