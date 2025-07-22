import React, { useState, useRef } from 'react';
import { useDailyTargets } from '@/hooks/useDailyTargets';
import type { DailyTarget } from '@/hooks/useDailyTargets';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { useStudyDurations } from '@/hooks/useStudyDurations';

// Helper to get all days in current month
function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Map productivity rating to color
function getProductivityColor(rating?: number) {
  switch (rating) {
    case 5: return 'bg-green-600';
    case 4: return 'bg-green-400';
    case 3: return 'bg-yellow-400';
    case 2: return 'bg-orange-400';
    case 1: return 'bg-red-400';
    default: return 'bg-gray-200 dark:bg-gray-700';
  }
}

// Map study_seconds to color
function getStudyColor(secs?: number) {
  if (!secs || secs === 0) return 'bg-gray-200 dark:bg-gray-700';
  if (secs < 2 * 3600) return 'bg-red-400'; // <2h
  if (secs < 4 * 3600) return 'bg-orange-400'; // 2-4h
  if (secs < 8 * 3600) return 'bg-yellow-400'; // 4-8h
  return 'bg-green-600'; // 8h+
}

const DailyTargetPage = () => {
  // Move all hooks to the top before any return
  const { user } = useAuth();
  const { targets, loading, error, addTarget, updateTarget, deleteTarget } = useDailyTargets();
  const { durations, loading: durationsLoading, getDuration, setDuration } = useStudyDurations();
  const [newTarget, setNewTarget] = useState('');
  const [date] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  // Track selected day (default: today)
  const [selectedDay, setSelectedDay] = useState(date);
  const [productivity, setProductivity] = useState(0);
  const [addTargetModal, setAddTargetModal] = useState(false);
  const [timer, setTimer] = useState(0); // seconds
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Month tracker logic
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  // Map date string to study_seconds (for grid coloring)
  const studyMap: Record<string, number | undefined> = durations;
  // Get all targets for the selected day
  const targetsForDay = targets.filter(t => t.date === selectedDay);
  // Get study duration for the day from study_durations table
  const dayStudySeconds = getDuration(selectedDay);
  // Date logic for past/today/future
  function getLocalDateString(dateObj: Date) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const todayStr = getLocalDateString(new Date());
  const selectedDateObj = new Date(selectedDay);
  const todayObj = new Date(todayStr);
  selectedDateObj.setHours(0,0,0,0);
  todayObj.setHours(0,0,0,0);
  const isPast = selectedDateObj < todayObj;
  const isToday = selectedDateObj.getTime() === todayObj.getTime();
  const isFuture = selectedDateObj > todayObj;
  // Timer effect
  React.useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);
  // When selectedDay changes, set timer to the saved value for that day
  React.useEffect(() => {
    if (isPast || isToday) {
      setTimer(dayStudySeconds || 0);
    }
  }, [selectedDay, dayStudySeconds, isPast, isToday]);
  // Progress bar color based on timer (0-12 hours, color from red to green every 30 min)
  function getProgressBarColor(secs: number) {
    const percent = Math.min(secs / (12 * 3600), 1);
    const hue = 0 + percent * 120; // 0 (red) to 120 (green)
    return `hsl(${hue}, 80%, 50%)`;
  }
  function formatTimeHMS(secs: number) {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  // On pause, save timer value to study_durations table for the day
  const handlePause = async () => {
    setTimerActive(false);
    await setDuration(selectedDay, timer);
  };
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg mb-4">You must be logged in to use Daily Targets.</p>
          <a href="/login" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">Login</a>
        </div>
      </div>
    );
  }

  const handleStatus = async (id: number, status: 'achieved' | 'failed') => {
    await updateTarget(id, { status });
  };

  const handleShare = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({ title: 'UPSC Daily Target', url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Website URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Daily Targets</h1>
        <button onClick={handleShare} className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">Share</button>
      </div>
      {/* Month Tracker Grid */}
      <div className="mb-8 px-2 space-y-2">
        {/* Month Selector */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <button
            className="px-2 py-1 rounded border bg-background"
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
          >
            &lt;
          </button>
          <span className="text-sm font-medium">
            {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            className="px-2 py-1 rounded border bg-background"
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
          >
            &gt;
          </button>
        </div>
        <div
          className="flex flex-wrap gap-2 w-full justify-start "
        >
          {daysInMonth.map((d, i) => {
            const dStr = d.toISOString().slice(0, 10);
            return (
              <button
                key={dStr}
                type="button"
                onClick={() => setSelectedDay(dStr)}
                className={`size-8 rounded ${getStudyColor(studyMap[dStr])} border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 ${selectedDay === dStr ? 'ring-2 ring-primary' : ''} flex items-center justify-center`}
                title={d.toLocaleDateString() + (studyMap[dStr] ? `: ${Math.floor((studyMap[dStr]||0)/3600)}h` : '')}
                style={{ display: 'inline-block' }}
              >
                <span className="text-[10px] font-medium text-gray-800 dark:text-gray-200 select-none">
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
        {/* <div className="flex gap-2 mt-2 text-xs">
          <span className="w-5 h-5 rounded bg-green-600 inline-block border"></span> 5
          <span className="w-5 h-5 rounded bg-green-400 inline-block border"></span> 4
          <span className="w-5 h-5 rounded bg-yellow-400 inline-block border"></span> 3
          <span className="w-5 h-5 rounded bg-orange-400 inline-block border"></span> 2
          <span className="w-5 h-5 rounded bg-red-400 inline-block border"></span> 1
          <span className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 inline-block border"></span> No rating
        </div> */}
      </div>
      <div className='flex justify-between items-center mb-2'>
        {(!isFuture) && (
          <span className="font-medium flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
              <path d="M9 2h6" />
              <path d="M12 4v2" />
            </svg>
            Study Stopwatch:
          </span>
        )}
        {/* Timer controls: only show for today */}
        {!isPast && !isFuture && (
          <div className="flex gap-2">
            {
              timerActive ? (
                <Button variant='outline' size='icon' onClick={handlePause} disabled={!timerActive} className='bg-red-500 text-white'>
                  <Pause />
                </Button>
              ) : (
                <Button variant='outline' size='icon' onClick={() => setTimerActive(true)} disabled={timerActive} className='bg-green-500 text-white'>
                  <Play />
                </Button>
              )
            }
          </div>
        )}
      </div>
      {/* Progress Bar and Timer display: show for today and past days, hide for future */}
      {(!isFuture) && (
        <>
          <div className="w-full h-5 max-w-xs mx-auto mb-2">
            <div className="w-full h-5  bg-gray-200 rounded-full overflow-hidden">
              <div
                className=" rounded-full text-end pr-4 transition-all duration-300 h-5"
                style={{
                  width: `${Math.min(((isPast ? (dayStudySeconds || 0) : timer) / (12 * 3600)) * 100, 100)}%`,
                  background: getProgressBarColor(isPast ? (dayStudySeconds || 0) : timer),
                }}
              >{ ((isPast ? (dayStudySeconds || 0) : timer) / (12 * 3600) * 100).toFixed(0)} %</div>
            </div>
            {!isPast && <div className="text-xs text-center mt-1 text-muted-foreground">
              {formatTimeHMS(isPast ? (dayStudySeconds || 0) : timer)} / 12:00:00
            </div>}
          </div>
          {/* For past days, show saved timer value if exists */}
          {isPast && dayStudySeconds !== undefined && (
            <div className="text-center text-muted-foreground mb-4">
              Studied: {formatTimeHMS(dayStudySeconds)}
            </div>
          )}
        </>
      )}
      {/* Add Target Button - only show for today */}
      {!isPast && !isFuture && (
        <div className='w-full flex justify-end'>
          <Button className='' onClick={() => setAddTargetModal(true)}>Add Target</Button>
        </div>
      )}
      {/* Targets List */}
      {!isFuture && (
        loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4 gap-4">
            {targetsForDay.length === 0 ? (
              <div className="text-center text-muted-foreground">No targets .</div>
            ) : (
              targetsForDay.map(target => (
                <div key={target.id} className="bg-card border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="font-medium">{target.target}</div>
                    <div className="text-xs text-muted-foreground">{target.date}</div>
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => !isPast && handleStatus(target.id, 'achieved')}
                        className={`px-2 py-1 rounded ${target.status === 'achieved' ? 'bg-green-100 text-green-800' : 'bg-background border'} ${isPast ? 'cursor-not-allowed opacity-60' : ''}`}
                        disabled={isPast}
                      >Achieved</button>
                      <button
                        onClick={() => !isPast && handleStatus(target.id, 'failed')}
                        className={`px-2 py-1 rounded ${target.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-background border'} ${isPast ? 'cursor-not-allowed opacity-60' : ''}`}
                        disabled={isPast}
                      >Failed</button>
                      <button
                        onClick={() => !isPast && deleteTarget(target.id)}
                        className={`px-2 py-1 rounded bg-red-50 text-red-700 border ${isPast ? 'cursor-not-allowed opacity-60' : ''}`}
                        disabled={isPast}
                      >Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      )}
      {/* Add Target Modal - only for today */}
      {addTargetModal && !isPast && !isFuture && (
        <div className="fixed inset-0 bg-slate-500/90 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Add Target</h2>
            <form  onSubmit={async (e) => {
        e.preventDefault();
        if (!newTarget.trim()) return;
        await addTarget({ date: (new Date()).toDateString(), target: newTarget, status: 'pending' });
        setNewTarget('');
        setAddTargetModal(false);
      }} className="flex flex-col  gap-2 mb-6">
      
        <input
          type="text"
          value={newTarget}
          onChange={e => setNewTarget(e.target.value)}
          placeholder="Enter your daily target..."
          className="flex-1 border rounded px-2 py-1"
        />
        <button type="submit" className="bg-primary text-primary-foreground px-4 py-1 rounded hover:bg-primary/90">Add</button>
      </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTargetPage; 