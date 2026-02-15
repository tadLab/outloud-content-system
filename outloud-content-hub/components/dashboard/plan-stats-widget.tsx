'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import { useContentPlan } from '@/hooks/use-content-plan';
import { ProgressBar } from './progress-bar';
import {
  calculateWeeklyStats,
  calculateMonthlyPillarStats,
  getWeekDateRange,
  getWeekNumber,
  getTotalWeeks,
  formatDateRange,
} from '@/lib/stats';
import { ACCOUNT_IMAGES } from '@/lib/constants';
import { ChevronRight } from 'lucide-react';

export function PlanStatsWidget() {
  const { setActiveTab } = useAppStore();
  const { user } = useUserContext();
  const { posts } = usePosts(user?.id);
  const { contentPlan, cadence, pillars } = useContentPlan();
  const [isExpanded, setIsExpanded] = useState(false);

  const now = new Date();
  const { start: weekStart, end: weekEnd } = getWeekDateRange(now);
  const weekNum = getWeekNumber(now, contentPlan.startDate);
  const totalWeeks = getTotalWeeks(contentPlan.startDate, contentPlan.endDate);

  const weeklyStats = calculateWeeklyStats(posts, cadence, weekStart, weekEnd);
  // TODO: Build pillar→theme mapping from DB data; for now pass empty map
  const pillarStats = calculateMonthlyPillarStats(posts, pillars, {});

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 mb-6 mx-8 mt-6">
      {/* Header — clickable to toggle */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <ChevronRight
            size={16}
            className={`text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          />
          <div>
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
              This Week&apos;s Progress
            </h2>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
              {contentPlan.name} &middot; Week {weekNum} of {totalWeeks} &middot; {formatDateRange(weekStart, weekEnd)}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setActiveTab('plan'); }}
          className="text-[12px] text-[var(--accent-color)] hover:underline transition-colors"
        >
          View Full Content Plan &rarr;
        </button>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <>
          {/* Account Stats */}
          <div className="space-y-4 mb-5 mt-5">
            {weeklyStats.map((account) => (
              <div
                key={account.account}
                className="bg-[var(--bg-tertiary)] rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  {ACCOUNT_IMAGES[account.account] && (
                    <img
                      src={ACCOUNT_IMAGES[account.account]}
                      alt={account.account}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  <h3 className="text-[13px] font-medium text-[var(--text-secondary)]">
                    {account.account}
                  </h3>
                </div>
                <div className="space-y-2">
                  {account.platforms.map((p) => (
                    <ProgressBar
                      key={p.platform}
                      platform={p.platform}
                      current={p.current}
                      target={p.target}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pillar Stats */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <h3 className="text-[13px] font-medium text-[var(--text-secondary)] mb-3">
              Pillars This Month
            </h3>
            <div className="space-y-2.5">
              {pillarStats.map((pillar) => (
                <div key={pillar.name} className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: pillar.color }}
                  />
                  <span className="text-[12px] text-[var(--text-primary)] w-28 flex-shrink-0">
                    {pillar.name}
                  </span>
                  <div className="flex-1">
                    <ProgressBar
                      current={pillar.current}
                      target={pillar.target}
                      showIcon={false}
                      size="sm"
                      color={pillar.color}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
