import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface StudyDuration {
  id: number;
  user_id: string;
  date: string;
  duration_seconds: number;
  created_at?: string;
  updated_at?: string;
}

export const useStudyDurations = () => {
  const { user } = useAuth();
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDurations = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('study_durations')
      .select('*')
      .eq('user_id', user.id);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const map: Record<string, number> = {};
    (data || []).forEach((row: StudyDuration) => {
      map[row.date] = row.duration_seconds;
    });
    setDurations(map);
    setLoading(false);
  };

  const getDuration = (date: string) => {
    return durations[date] || 0;
  };

  const setDuration = async (date: string, seconds: number) => {
    if (!user) return;
    // Upsert (insert or update)
    const { error } = await supabase
      .from('study_durations')
      .upsert([
        { user_id: user.id, date, duration_seconds: seconds },
      ], { onConflict: 'user_id,date' });
    if (!error) {
      setDurations(prev => ({ ...prev, [date]: seconds }));
    }
    return !error;
  };

  useEffect(() => {
    if (user) fetchDurations();
  }, [user?.id]);

  return {
    durations,
    loading,
    error,
    fetchDurations,
    getDuration,
    setDuration,
  };
}; 