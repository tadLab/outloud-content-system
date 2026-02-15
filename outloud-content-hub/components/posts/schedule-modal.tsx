'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar, Clock } from 'lucide-react';
import { getNextRecommendedTimes, getPostingRecommendation } from '@/lib/posting-times';
import { BEST_POSTING_TIMES } from '@/lib/constants';
import { Platform } from '@/types';
import { format } from 'date-fns';

export function ScheduleModal() {
  const { isScheduleModalOpen, closeScheduleModal, scheduleTargetPostId } = useAppStore();
  const { user } = useUserContext();
  const { posts, schedulePost } = usePosts(user?.id);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [dateError, setDateError] = useState(false);

  const post = posts.find((p) => p.id === scheduleTargetPostId);
  const platform: Platform = (post?.platform as Platform) || 'linkedin';

  const recommendations = useMemo(
    () => getNextRecommendedTimes(platform, 3),
    [platform]
  );

  const recommendation = useMemo(() => {
    if (!date || !time) return null;
    try {
      const dt = new Date(`${date}T${time}:00`);
      return getPostingRecommendation(platform, dt);
    } catch {
      return null;
    }
  }, [date, time, platform]);

  const handleClose = () => {
    closeScheduleModal();
    setDate('');
    setTime('10:00');
    setDateError(false);
  };

  const handleSubmit = () => {
    if (!date) {
      setDateError(true);
      return;
    }
    if (!scheduleTargetPostId) return;

    const dateObj = new Date(date + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const iso = new Date(`${date}T${time}:00`).toISOString();

    schedulePost(scheduleTargetPostId, formatted, time, iso);
    setDate('');
    setTime('10:00');
    setDateError(false);
  };

  const selectRecommendation = (rec: { dateTime: Date }) => {
    const d = rec.dateTime;
    const dateStr = format(d, 'yyyy-MM-dd');
    const timeStr = format(d, 'HH:mm');
    setDate(dateStr);
    setTime(timeStr);
    setDateError(false);
  };

  const config = BEST_POSTING_TIMES[platform];

  return (
    <Dialog open={isScheduleModalOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="bg-[#0F0F0F] border-[var(--border-default)] text-[var(--text-primary)] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
            Schedule Post
          </DialogTitle>
          {post && (
            <DialogDescription className="text-[var(--text-secondary)] text-sm">
              {post.title}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Recommended Times */}
          {recommendations.length > 0 && (
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
              <h4 className="text-[12px] font-medium text-[var(--text-secondary)] mb-1">
                Recommended Times
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] mb-3">
                Based on {config.name} best practices ({config.timezone})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {recommendations.map((rec, i) => {
                  const recDateStr = format(rec.dateTime, 'yyyy-MM-dd');
                  const recTimeStr = format(rec.dateTime, 'HH:mm');
                  const isSelected = date === recDateStr && time === recTimeStr;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectRecommendation(rec)}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-[var(--accent-color)] bg-[var(--accent-color)]10'
                          : 'border-[var(--border-default)] hover:border-[var(--border-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[11px]">{rec.rating === 'optimal' ? '\u2605' : '\u25CF'}</span>
                        <span className="text-[12px] font-medium text-[var(--text-primary)]">
                          {format(rec.dateTime, 'EEE, MMM d')}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {format(rec.dateTime, 'h:mm a')}
                      </div>
                      <div className={`text-[10px] mt-1 capitalize ${
                        rec.rating === 'optimal' ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'
                      }`}>
                        {rec.rating}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Date/Time */}
          <div>
            <h4 className="text-[12px] font-medium text-[var(--text-secondary)] mb-3">
              {recommendations.length > 0 ? 'Or Choose Custom' : 'Select Date & Time'}
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                  <Calendar size={12} />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (e.target.value) setDateError(false);
                  }}
                  className={`w-full bg-[var(--bg-secondary)] border rounded-lg p-3 text-[var(--text-primary)] text-sm outline-none transition-colors [color-scheme:dark] ${
                    dateError ? 'border-[#FF3B30]' : 'border-[var(--border-default)] focus:border-[var(--border-hover)]'
                  }`}
                />
                {dateError && (
                  <p className="text-[#FF3B30] text-xs mt-1">Please select a date</p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                  <Clock size={12} />
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-hover)] transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Recommendation indicator */}
            {date && time && recommendation && (
              <div className={`mt-3 text-[11px] p-2.5 rounded-lg ${
                recommendation === 'optimal'
                  ? 'bg-[#34C75915] text-[var(--success)]'
                  : recommendation === 'good'
                  ? 'bg-[#34C75910] text-[var(--success)]'
                  : recommendation === 'avoid'
                  ? 'bg-[#FF3B3015] text-[#FF3B30]'
                  : 'bg-[#FFB80015] text-[var(--warning)]'
              }`}>
                {recommendation === 'optimal' && (
                  <>&#10003; Great choice! This is an optimal time for {config.name}.</>
                )}
                {recommendation === 'good' && (
                  <>&#10003; Good time for {config.name}.</>
                )}
                {recommendation === 'neutral' && (
                  <>&#9888; Not an optimal time for {config.name}. Consider {config.bestDays.slice(0, 3).join(', ')}, {config.bestTimes[0]?.time} for better reach.</>
                )}
                {recommendation === 'avoid' && (
                  <>&#9888; This time is not recommended for {config.name}. Consider {config.bestDays.slice(0, 3).join(', ')}, {config.bestTimes[0]?.time} for better reach.</>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-gradient-end)] rounded-lg px-5 py-2.5 text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            Schedule
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
