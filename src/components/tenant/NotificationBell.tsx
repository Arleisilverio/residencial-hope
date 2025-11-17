import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Loader2, Info, AlertTriangle, Trash2, MessageSquare } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  icon: string;
  read: boolean;
  created_at: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  Info: Info,
  AlertTriangle: AlertTriangle,
  MessageSquare: MessageSquare,
  Default: Bell,
};

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data as Notification[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `tenant_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const handleMarkAsRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    // Otimista
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    // Otimista
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) {
        toast.error("Falha ao apagar a notificação.");
        fetchNotifications(); // Reverte em caso de erro
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      handleMarkAsRead();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 text-white text-xs items-center justify-center">
                {unreadCount}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-50 border bg-popover text-popover-foreground" align="end">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Avisos e Notificações
          </h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((n) => {
                const IconComponent = iconMap[n.icon] || iconMap.Default;
                return (
                  <div key={n.id} className={`flex items-start justify-between p-3 rounded-lg ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                    <IconComponent className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(n.id)}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors flex-shrink-0 ml-2"
                      title="Apagar notificação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              Nenhum aviso encontrado.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;