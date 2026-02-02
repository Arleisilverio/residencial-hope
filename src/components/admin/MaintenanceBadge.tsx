import React, { useState, useEffect, useCallback } from 'react';
import { Wrench } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const MaintenanceBadge: React.FC = () => {
  const [count, setCount] = useState(0);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const location = useLocation();

  const fetchStatus = useCallback(async () => {
    // Busca o total de novos e o ID do mais recente
    const { data, count: newCount, error } = await supabase
      .from('complaints')
      .select('id', { count: 'exact' })
      .eq('status', 'new')
      .neq('category', 'message')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const currentCount = newCount || 0;
      setCount(currentCount);

      // Lógica de Alerta: Comparamos o ID do mais recente com o salvo no navegador
      const latestId = data[0]?.id;
      const lastSeenId = localStorage.getItem('last_seen_maintenance_id');

      if (latestId && latestId !== lastSeenId && currentCount > 0) {
        setHasNewAlert(true);
      } else {
        setHasNewAlert(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const channel = supabase
      .channel('maintenance-badge-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        fetchStatus();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchStatus]);

  // Se o admin está na página de manutenção, removemos o pulso visual
  const isAtMaintenancePage = location.pathname === '/admin/manutencao';
  const showNotification = hasNewAlert && !isAtMaintenancePage;

  return (
    <Link
      to="/admin/manutencao"
      className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
      title="Central de Manutenção"
    >
      <Wrench className={`w-5 h-5 ${showNotification ? 'text-red-600 dark:text-red-500' : ''}`} />
      {showNotification && (
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