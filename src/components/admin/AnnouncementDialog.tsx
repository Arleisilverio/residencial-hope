import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { Save, Trash2, AlertTriangle } from 'lucide-react';

interface Announcement {
  id: string;
  content: string;
}

interface AnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  announcement: Announcement | null;
}

const AnnouncementDialog: React.FC<AnnouncementDialogProps> = ({ isOpen, onClose, onSuccess, announcement }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContent(announcement?.content || '');
  }, [announcement, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(announcement ? 'Atualizando aviso...' : 'Publicando aviso...');

    try {
      const { error } = await supabase
        .from('announcements')
        .upsert({
          id: announcement?.id || '12345678-1234-1234-1234-1234567890ab', // Usamos um ID fixo para ter apenas um aviso
          content: content,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;

      toast.success('Aviso publicado com sucesso!', { id: toastId });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Falha ao salvar o aviso.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!announcement || !window.confirm('Tem certeza que deseja apagar este aviso?')) return;

    setLoading(true);
    const toastId = toast.loading('Apagando aviso...');

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcement.id);

      if (error) throw error;

      toast.success('Aviso apagado com sucesso!', { id: toastId });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Falha ao apagar o aviso.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Gerenciar Aviso Geral">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="announcement-content" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Conteúdo do Aviso
          </label>
          <Textarea
            id="announcement-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Digite o comunicado que será exibido para todos os inquilinos..."
            required
            className="mt-1"
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          {announcement && (
            <Button variant="destructive" type="button" onClick={handleDelete} disabled={loading}>
              <Trash2 className="w-4 h-4 mr-2" />
              Apagar
            </Button>
          )}
          {!announcement && <div />}
          <Button type="submit" disabled={loading || content.trim().length === 0}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Aviso'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AnnouncementDialog;