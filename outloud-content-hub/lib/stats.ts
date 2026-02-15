import { Post, ContentPillar, CadenceSummary } from '@/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInWeeks, format, isWithinInterval, parseISO } from 'date-fns';

export function parseFrequency(freq: string): number {
  // "2-3x weekly" → 3 (use upper bound), "2x weekly" → 2
  const match = freq.match(/(\d+)(?:-(\d+))?x/);
  if (match) return parseInt(match[2] || match[1]);
  return 1;
}

export function getWeekDateRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getWeekNumber(date: Date, planStart: string): number {
  const start = parseISO(planStart);
  return Math.max(1, differenceInWeeks(date, start, { roundingMethod: 'ceil' }) + 1);
}

export function getTotalWeeks(planStart: string, planEnd: string): number {
  return Math.max(1, differenceInWeeks(parseISO(planEnd), parseISO(planStart)) + 1);
}

export function formatDateRange(start: Date, end: Date): string {
  return `${format(start, 'MMM d')}-${format(end, 'd')}`;
}

export interface WeeklyAccountStats {
  account: string;
  platforms: {
    platform: 'linkedin' | 'x' | 'instagram';
    current: number;
    target: number;
  }[];
}

export interface MonthlyPillarStats {
  name: string;
  current: number;
  target: number;
  color: string;
}

export function calculateWeeklyStats(
  posts: Post[],
  cadence: CadenceSummary[],
  weekStart: Date,
  weekEnd: Date
): WeeklyAccountStats[] {
  return cadence.map((cad) => ({
    account: cad.account,
    platforms: cad.entries.map((entry) => {
      const count = posts.filter((p) => {
        if (p.account !== cad.account) return false;
        if (p.platform !== entry.platform) return false;
        if (!['scheduled', 'posted'].includes(p.status)) return false;
        const iso = p.scheduledISO || p.postedAt;
        if (!iso) return false;
        try {
          const d = parseISO(iso);
          return isWithinInterval(d, { start: weekStart, end: weekEnd });
        } catch {
          return false;
        }
      }).length;
      return {
        platform: entry.platform,
        current: count,
        target: parseFrequency(entry.frequency),
      };
    }),
  }));
}

export function calculateMonthlyPillarStats(
  posts: Post[],
  pillars: ContentPillar[],
  pillarThemeMap: Record<string, string[]>
): MonthlyPillarStats[] {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  return pillars.map((pillar) => {
    const themeIds = pillarThemeMap[pillar.id] || [];
    const count = posts.filter((p) => {
      if (!themeIds.includes(p.themeId || '')) return false;
      if (!['scheduled', 'posted'].includes(p.status)) return false;
      const iso = p.scheduledISO || p.postedAt;
      if (!iso) return false;
      try {
        const d = parseISO(iso);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      } catch {
        return false;
      }
    }).length;
    return {
      name: pillar.name,
      current: count,
      target: pillar.targetPerMonth,
      color: pillar.color,
    };
  });
}
