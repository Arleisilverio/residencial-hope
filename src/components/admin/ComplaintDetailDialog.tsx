import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ComplaintNotification } from './RepairNotificationIcon';
import { Wrench, Calendar, User, Home, MessageSquare, Send, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ComplaintDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: ComplaintNotification | null;
  onReply: (complaint: ComplaintNotification) => void;
  onDelete: (id: string, apt: number) => void;
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
  onDelete 
}) => {
  if (!complaint) return null;

  const isIA = complaint.description.includes('[IA -');

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Detalhes da Solicitação">
      <div className="space-y-6">
        {/* Cabeçalho do Card */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-700">
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${isIA ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Categoria</p>
              <p className="font-bold text-slate-900 dark:text-slate-100">{categoryMap[complaint.category] || complaint.category}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Localização</p>
            <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-end">
              <Home className="w-4 h-4 mr-1 text-blue-600" />
              Kit {String(complaint.apartment_number).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Informações do Inquilino */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start">
            <User className="w-5 h-5 mr-3 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Solicitante</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">{complaint.tenant_name}</p>
            </div>
          </div>
        </div>

        {/* Descrição Completa */}
        <div className="p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-inner">
          <div className="flex items-center mb-2 text-slate-500">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase">Mensagem / Relato</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t dark:border-slate-700">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700" 
            onClick={() => onReply(complaint)}
          >
            <Send className="w-4 h-4 mr-2" />
            Responder no App
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            onClick={() => {
                // Aqui podemos apenas remover a notificação tratando como resolvida
                onDelete(complaint.id, complaint.apartment_number);
                onClose();
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar como Lido
          </Button>
          <Button 
            variant="destructive" 
            className="flex-none"
            onClick={() => {
              if (window.confirm('Excluir esta solicitação permanentemente?')) {
                onDelete(complaint.id, complaint.apartment_number);
                onClose();
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ComplaintDetailDialog;