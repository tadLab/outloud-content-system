'use client';

import { Post } from '@/types';
import { PlatformBadge } from '@/components/posts/platform-badge';
import { CALENDAR_STATUS_COLORS } from '@/lib/constants';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isWeekend,
  isToday,
  parseISO,
} from 'date-fns';

interface MonthViewProps {
  currentMonth: Date;
  posts: Post[];
  onPostClick: (postId: string) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthView({ currentMonth, posts, onPostClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get posts for a specific day
  const getPostsForDay = (day: Date): Post[] => {
    return posts.filter((post) => {
      if (!post.scheduledISO) return false;
      try {
        const postDate = parseISO(post.scheduledISO);
        return isSameDay(postDate, day);
      } catch {
        return false;
      }
    });
  };

  // Check if a weekday has no posts (gap)
  const isGap = (day: Date): boolean => {
    if (!isSameMonth(day, currentMonth)) return false;
    if (isWeekend(day)) return false;
    return getPostsForDay(day).length === 0;
  };

  const getStatusColor = (status: string) => {
    if (status === 'scheduled') return CALENDAR_STATUS_COLORS.scheduled;
    if (status === 'posted') return CALENDAR_STATUS_COLORS.posted;
    if (status === 'missed') return CALENDAR_STATUS_COLORS.missed;
    return CALENDAR_STATUS_COLORS.scheduled;
  };

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name) => (
          <div key={name} className="text-center text-[11px] text-[var(--text-muted)] uppercase tracking-wider py-2">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-t border-l border-[var(--border-default)]">
        {days.map((day) => {
          const dayPosts = getPostsForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const gap = isGap(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] border-b border-r border-[var(--border-default)] p-1.5 ${
                !inMonth ? 'bg-[var(--bg-primary)]' : gap ? '' : 'bg-[#0F0F0F]'
              }`}
              style={gap ? {
                background: 'repeating-linear-gradient(45deg, #0F0F0F, #0F0F0F 5px, #141414 5px, #141414 10px)',
              } : undefined}
            >
              {/* Day number */}
              <div className={`text-[11px] mb-1 ${
                today
                  ? 'text-[var(--accent-color)] font-bold'
                  : inMonth
                    ? 'text-[var(--text-secondary)]'
                    : 'text-[var(--border-hover)]'
              }`}>
                {today ? (
                  <span className="bg-[var(--accent-color)] text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-[10px]">
                    {format(day, 'd')}
                  </span>
                ) : (
                  format(day, 'd')
                )}
              </div>

              {/* Posts */}
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((post) => {
                  const colors = getStatusColor(post.status);
                  return (
                    <button
                      key={post.id}
                      onClick={() => onPostClick(post.id)}
                      className="w-full rounded px-1.5 py-1 text-left hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: colors.bg,
                        borderLeft: `3px solid ${colors.border}`,
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <PlatformBadge platform={post.platform} size="sm" />
                        <span className="text-[9px] text-[var(--text-secondary)]">
                          {post.scheduledTime}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--text-primary)] truncate mt-0.5">
                        {post.title}
                      </div>
                    </button>
                  );
                })}
                {dayPosts.length > 3 && (
                  <div className="text-[9px] text-[var(--text-muted)] text-center">
                    +{dayPosts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
