import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Megaphone, Loader2 } from 'lucide-react';

const AnnouncementDisplay: React.FC = () => {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncement = useCallback(async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('content')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching announcement:', error);
    } else {
      setAnnouncement(data?.content || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  useEffect(() => {
    const channel = supabase
      .channel('public-announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        fetchAnnouncement();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAnnouncement]);

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200 p-4 mb-6 rounded-r-lg flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!announcement) {
    return null; // Não renderiza nada se não houver aviso
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200 p-4 mb-6 rounded-r-lg">
      <div className="flex">
        <Megaphone className="w-6 h-6 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-bold">Aviso da Administração</h3>
          <p className="mt-1 text-sm whitespace-pre-wrap">{announcement}</p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDisplay;