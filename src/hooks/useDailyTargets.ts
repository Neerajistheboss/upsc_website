import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DailyTarget {
  id: number;
  user_id: string;
  date: string;
  target: string;
  status: 'pending' | 'achieved' | 'failed';
  productivity_rating?: number;
  study_seconds?: number;
  created_at?: string;
  updated_at?: string;
}

export const useDailyTargets = () => {
  const { user } = useAuth();
  const [targets, setTargets] = useState<DailyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTargets = async (date?: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    let query = supabase
      .from('daily_targets')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (date) query = query.eq('date', date);
    const { data, error } = await query;
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setTargets(data || []);
    setLoading(false);
  };

  const addTarget = async (target: Omit<DailyTarget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('daily_targets')
      .insert([{ ...target, user_id: user.id }])
      .select();
    if (error) {
      toast.error('Failed to add target');
      return;
    }
    toast.success('Target added');
    fetchTargets(target.date);
    return data?.[0];
  };

  const updateTarget = async (id: number, updates: Partial<DailyTarget>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('daily_targets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    if (error) {
      toast.error('Failed to update target');
      return;
    }
    toast.success('Target updated');
    fetchTargets();
    return data?.[0];
  };

  const deleteTarget = async (id: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('daily_targets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to delete target');
      return;
    }
    toast.success('Target deleted');
    fetchTargets();
  };

  useEffect(() => {
    if (user) fetchTargets();
  }, [user?.id]);

  return {
    targets,
    loading,
    error,
    fetchTargets,
    addTarget,
    updateTarget,
    deleteTarget,
  };
}; 