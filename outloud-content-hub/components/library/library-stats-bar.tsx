'use client';

import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';

export function LibraryStatsBar() {
  const { user } = useUserContext();
  const { posts } = usePosts(user?.id);

  const stats = [
    { label: 'Total', count: posts.length, color: '#FFFFFF' },
    { label: 'Draft', count: posts.filter(p => p.status === 'draft').length, color: '#9A9A9A' },
    { label: 'In Review', count: posts.filter(p => p.status === 'design_review' || p.status === 'final_review').length, color: '#8B5CF6' },
    { label: 'Approved', count: posts.filter(p => p.status === 'approved').length, color: '#22C55E' },
    { label: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length, color: '#3B82F6' },
    { label: 'Posted', count: posts.filter(p => p.status === 'posted').length, color: '#34C759' },
    { label: 'Missed', count: posts.filter(p => p.status === 'missed').length, color: '#EF4444' },
  ];

  // Only show missed if there are any
  const visibleStats = stats.filter(s => s.label !== 'Missed' || s.count > 0);

  return (
    <div className="flex gap-3">
      {visibleStats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-3 min-w-[100px]"
        >
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
            {stat.label}
          </div>
          <div
            className="text-xl font-semibold"
            style={{ color: stat.color }}
          >
            {stat.count}
          </div>
        </div>
      ))}
    </div>
  );
}
