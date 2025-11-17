import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Button } from '../ui/Button';
import { Megaphone, Edit, Loader2 } from 'lucide-react';
import AnnouncementDialog from './AnnouncementDialog';

interface Announcement {
  id: string;
  content: string;
}

const GeneralAnnouncement: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchAnnouncement = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('id, content')
      .maybeSingle();

    if (error) {
      console.error('Error fetching announcement:', error);
    } else {
      setAnnouncement(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center">
            <Megaphone className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
            Mural de Avisos
          </h2>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            {announcement ? 'Editar Aviso' : 'Criar Aviso'}
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
          </div>
        ) : announcement ? (
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md whitespace-pre-wrap">
            <p className="text-slate-700 dark:text-slate-300">{announcement.content}</p>
          </div>
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4">
            Nenhum aviso publicado no momento.
          </p>
        )}
      </div>
      <AnnouncementDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchAnnouncement}
        announcement={announcement}
      />
    </>
  );
};

export default GeneralAnnouncement;