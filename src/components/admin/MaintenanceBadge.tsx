import React, { useState, useEffect, useCallback } from 'react';
import { Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const MaintenanceBadge: React.FC = () => {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    const { count: newCount, error } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    if (!error) {
      setCount(newCount || 0);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    const channel = supabase
      .channel('maintenance-badge-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCount]);

  const hasNotifications = count > 0;

  return (
    <Link
      to="/admin/manutencao"
      className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
      title="Central de Manutenção"
    >
      <Wrench className={`w-5 h-5 ${hasNotifications ? 'text-blue-600 dark:text-blue-400' : ''}`} />
      {hasNotifications && (
        <span className="absolute top-0 right-0 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-[10px] font-bold items-center justify-center">
            {count}
          </span>
        </span>
      )}
    </Link>
  );
};

export default MaintenanceBadge;