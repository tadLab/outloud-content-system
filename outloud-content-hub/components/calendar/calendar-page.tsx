'use client';

import { useState, useEffect, useMemo } from 'react';
import { CalendarView } from '@/types';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import { CalendarLegend } from './calendar-legend';
import { MonthView } from './month-view';
import { WeekView } from './week-view';
import { PlatformBadge } from '@/components/posts/platform-badge';
import { STATUS_DISPLAY } from '@/lib/constants';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  isSameDay,
  parseISO,
  addDays,
  isAfter,
  isBefore,
} from 'date-fns';

export function CalendarPage() {
  const { setSelectedPostId } = useAppStore();
  const { user } = useUserContext();
  const { posts, checkAndMarkMissedPosts } = usePosts(user?.id);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');

  // Auto-detect expired scheduled posts on mount
  useEffect(() => {
    checkAndMarkMissedPosts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter posts to only those with scheduledISO (scheduled, posted, missed)
  const calendarPosts = useMemo(() => {
    return posts.filter(p =>
      p.scheduledISO && (p.status === 'scheduled' || p.status === 'posted' || p.status === 'missed')
    );
  }, [posts]);

  // Upcoming posts (next 7 days from today)
  const upcomingPosts = useMemo(() => {
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return calendarPosts
      .filter(p => {
        if (!p.scheduledISO || p.status !== 'scheduled') return false;
        try {
          const date = parseISO(p.scheduledISO);
          return isAfter(date, now) && isBefore(date, weekFromNow);
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(a.scheduledISO!).getTime() - new Date(b.scheduledISO!).getTime());
  }, [calendarPosts]);

  // Content gaps: weekdays in current month with no posts
  const contentGaps = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return allDays.filter(day => {
      if (isWeekend(day)) return false;
      // Check if any post is on this day
      return !calendarPosts.some(p => {
        if (!p.scheduledISO) return false;
        try {
          return isSameDay(parseISO(p.scheduledISO), day);
        } catch {
          return false;
        }
      });
    });
  }, [currentDate, calendarPosts]);

  // Only show upcoming gaps (today or future)
  const upcomingGaps = contentGaps.filter(d => isAfter(d, addDays(new Date(), -1)));

  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else {
      setCurrentDate(prev => subWeeks(prev, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else {
      setCurrentDate(prev => addWeeks(prev, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Calendar</h2>
        <div className="flex items-center gap-3">
          {/* Today button */}
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-[12px] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-lg hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors"
          >
            Today
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-[15px] font-medium text-[var(--text-primary)] min-w-[160px] text-center">
              {view === 'month'
                ? format(currentDate, 'MMMM yyyy')
                : `Week of ${format(currentDate, 'MMM d, yyyy')}`
              }
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border border-[var(--border-default)] overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                view === 'month'
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-[12px] font-medium transition-colors border-l border-[var(--border-default)] ${
                view === 'week'
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4">
        <CalendarLegend />
      </div>

      {/* Content gap alert */}
      {upcomingGaps.length > 0 && (
        <div className="bg-[#FFB80010] border border-[#FFB80020] rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
          <AlertTriangle size={14} className="text-[#FFB800] mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[12px] text-[#FFB800] font-medium">Content Gap Alert</div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              No posts scheduled for: {upcomingGaps.slice(0, 5).map(d => format(d, 'EEE MMM d')).join(', ')}
              {upcomingGaps.length > 5 && ` and ${upcomingGaps.length - 5} more days`}
            </div>
          </div>
        </div>
      )}

      {/* Calendar view */}
      {view === 'month' ? (
        <MonthView
          currentMonth={currentDate}
          posts={calendarPosts}
          onPostClick={(id) => setSelectedPostId(id)}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          posts={calendarPosts}
          onPostClick={(id) => setSelectedPostId(id)}
        />
      )}

      {/* Upcoming posts */}
      {upcomingPosts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">
            Upcoming (Next 7 days)
          </h3>
          <div className="space-y-2">
            {upcomingPosts.map((post) => {
              const statusDisplay = STATUS_DISPLAY[post.status];
              let dateStr = '';
              if (post.scheduledISO) {
                try {
                  dateStr = format(parseISO(post.scheduledISO), 'MMM d, HH:mm');
                } catch {
                  dateStr = `${post.scheduledDate}, ${post.scheduledTime}`;
                }
              }

              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className="w-full flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-3 hover:border-[var(--border-hover)] transition-colors text-left"
                >
                  <span className="text-[12px] text-[var(--text-muted)] min-w-[100px]">{dateStr}</span>
                  <PlatformBadge platform={post.platform} size="sm" />
                  <span className="text-[12px] text-[var(--text-secondary)] min-w-[60px]">{post.account}</span>
                  <span className="text-[13px] text-[var(--text-primary)] truncate flex-1">{post.title}</span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: statusDisplay.color, backgroundColor: statusDisplay.bg }}
                  >
                    {statusDisplay.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
