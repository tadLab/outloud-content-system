'use client';

import { Post } from '@/types';
import { PlatformBadge } from '@/components/posts/platform-badge';
import { CALENDAR_STATUS_COLORS } from '@/lib/constants';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';

interface WeekViewProps {
  currentDate: Date;
  posts: Post[];
  onPostClick: (postId: string) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 - 19:00

export function WeekView({ currentDate, posts, onPostClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getPostsForDayAndHour = (day: Date, hour: number): Post[] => {
    return posts.filter((post) => {
      if (!post.scheduledISO) return false;
      try {
        const postDate = parseISO(post.scheduledISO);
        return isSameDay(postDate, day) && postDate.getHours() === hour;
      } catch {
        return false;
      }
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'scheduled') return CALENDAR_STATUS_COLORS.scheduled;
    if (status === 'posted') return CALENDAR_STATUS_COLORS.posted;
    if (status === 'missed') return CALENDAR_STATUS_COLORS.missed;
    return CALENDAR_STATUS_COLORS.scheduled;
  };

  return (
    <div className="border border-[var(--border-default)] rounded-lg overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-[#0F0F0F] border-b border-[var(--border-default)]">
        <div className="p-2 text-[11px] text-[var(--text-disabled)] text-center">Time</div>
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={`p-2 text-center border-l border-[var(--border-default)] ${
                today ? 'bg-[#E85A2C10]' : ''
              }`}
            >
              <div className={`text-[11px] uppercase tracking-wider ${today ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`}>
                {format(day, 'EEE')}
              </div>
              <div className={`text-[13px] font-medium ${today ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]'}`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      {HOURS.map((hour) => (
        <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[var(--border-subtle)]">
          <div className="p-2 text-[11px] text-[var(--text-disabled)] text-right pr-3 pt-1">
            {`${hour.toString().padStart(2, '0')}:00`}
          </div>
          {days.map((day) => {
            const hourPosts = getPostsForDayAndHour(day, hour);
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[48px] border-l border-[var(--border-subtle)] p-1 ${
                  today ? 'bg-[#E85A2C05]' : ''
                }`}
              >
                {hourPosts.map((post) => {
                  const colors = getStatusColor(post.status);
                  return (
                    <button
                      key={post.id}
                      onClick={() => onPostClick(post.id)}
                      className="w-full rounded px-1.5 py-1 text-left hover:opacity-80 transition-opacity mb-1"
                      style={{
                        backgroundColor: colors.bg,
                        borderLeft: `3px solid ${colors.border}`,
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <PlatformBadge platform={post.platform} size="sm" />
                        <span className="text-[9px] text-[var(--text-secondary)] truncate">
                          {post.account}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--text-primary)] truncate mt-0.5">
                        {post.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
