'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ContentPlan,
  ContentPillar,
  CadenceSummary,
  CadenceEntry,
  CombinedWeeklyGrid,
  WeeklySlot,
  MonthlyWeek,
  MonthlyTheme,
  TeamMember,
  WorkflowStep,
  BrandVoice,
  NorthStarGoal,
  KPIItem,
  KPISection,
  UserId,
} from '@/types';

// ── DB row shapes (snake_case) ────────────────────────────────────────────────

interface DbContentPlan {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  north_star_goals: NorthStarGoal[] | null;
  kpi_primary: string | null;
  kpi_secondary: string | null;
  created_at: string;
  updated_at: string;
}

interface DbContentPillar {
  id: string;
  name: string;
  color: string;
  description: string | null;
  formats: string[] | null;
  frequency: string | null;
  goal: string | null;
  sort_order: number;
}

interface DbCadenceSummary {
  id: string;
  account_name: string;
  total_per_week: string | null;
  entries: CadenceEntry[] | null;
}

interface DbCombinedWeeklyGrid {
  id: string;
  platform: string;
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
  sunday: string | null;
}

interface DbWeeklySlot {
  id: string;
  day: string;
  slot_name: string;
  goal: string | null;
  formats: string | null;
  pillar_id: string | null;
  sort_order: number;
}

interface DbMonthlyWeek {
  id: string;
  week_number: number;
  theme: string | null;
  posts: Record<string, unknown> | null;
  sort_order: number;
}

interface DbMonthlyTheme {
  id: string;
  month: string;
  emoji: string | null;
  theme: string;
  status: string | null;
  sort_order: number;
}

interface DbTeamMember {
  id: string;
  user_id: string;
  responsibilities: string[] | null;
}

interface DbWorkflowStep {
  id: string;
  step_number: number;
  who: string;
  day: string | null;
  task: string | null;
  time: string | null;
  sort_order: number;
}

interface DbBrandVoice {
  id: string;
  tagline: string | null;
  three_words: string[] | null;
  dos: string[] | null;
  donts: string[] | null;
}

// ── Day columns for grid mapping ──────────────────────────────────────────────

const DAY_COLUMNS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_CONTENT_PLAN: ContentPlan = {
  id: '',
  name: '',
  startDate: '',
  endDate: '',
  status: 'draft',
  northStar: [],
  kpis: { primary: [], secondary: [] },
  brandVoiceNotes: '',
};

const DEFAULT_BRAND_VOICE: BrandVoice = {
  tagline: '',
  threeWords: ['', '', ''],
  dos: [],
  donts: [],
};

const DEFAULT_MONTHLY_WEEKS: MonthlyWeek[] = [1, 2, 3, 4].map((n) => ({
  weekNumber: n,
  weekName: '',
  postA: { description: '', format: '' },
  postB: { description: '', format: '' },
  ondrejTue: '',
  ondrejThu: '',
}));

// ── Mappers ───────────────────────────────────────────────────────────────────

function parseKPIs(raw: string | null): KPIItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializeKPIs(items: KPIItem[]): string {
  return JSON.stringify(items);
}

function mapDbToContentPlan(row: DbContentPlan): ContentPlan {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    status: 'active',
    northStar: row.north_star_goals ?? [],
    kpis: {
      primary: parseKPIs(row.kpi_primary),
      secondary: parseKPIs(row.kpi_secondary),
    },
    brandVoiceNotes: '',
  };
}

function mapDbToPillar(row: DbContentPillar): ContentPillar {
  return {
    id: row.id,
    planId: '',
    name: row.name,
    description: row.description ?? '',
    formats: row.formats ?? [],
    frequency: row.frequency ?? '',
    goal: row.goal ?? '',
    color: row.color,
    sortOrder: row.sort_order,
    targetPerMonth: 4,
  };
}

function mapDbToCadenceSummary(row: DbCadenceSummary): CadenceSummary {
  return {
    account: row.account_name,
    weeklyTotal: row.total_per_week ?? '',
    monthlyTotal: '',
    entries: row.entries ?? [],
  };
}

function mapDbToGrid(row: DbCombinedWeeklyGrid): CombinedWeeklyGrid {
  return {
    platform: row.platform,
    days: {
      monday: row.monday ?? '-',
      tuesday: row.tuesday ?? '-',
      wednesday: row.wednesday ?? '-',
      thursday: row.thursday ?? '-',
      friday: row.friday ?? '-',
      saturday: row.saturday ?? '-',
      sunday: row.sunday ?? '-',
    },
  };
}

function mapDbToWeeklySlot(row: DbWeeklySlot): WeeklySlot {
  return {
    id: row.id,
    planId: '',
    dayOfWeek: row.day,
    slotName: row.slot_name,
    account: '',
    goal: row.goal ?? '',
    formats: row.formats ? (typeof row.formats === 'string' ? [row.formats] : []) : [],
    pillar: row.pillar_id ?? '',
  };
}

function mapDbToMonthlyWeek(row: DbMonthlyWeek): MonthlyWeek {
  const posts = (row.posts ?? {}) as Record<string, unknown>;
  const postA = (posts.postA ?? { description: '', format: '' }) as { description: string; format: string };
  const postB = (posts.postB ?? { description: '', format: '' }) as { description: string; format: string };
  return {
    weekNumber: row.week_number,
    weekName: (posts.weekName as string) ?? row.theme ?? '',
    postA,
    postB,
    ondrejTue: (posts.ondrejTue as string) ?? '',
    ondrejThu: (posts.ondrejThu as string) ?? '',
  };
}

function mapMonthlyWeekToDb(week: Partial<MonthlyWeek>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (week.weekNumber !== undefined) row.week_number = week.weekNumber;
  if (week.weekName !== undefined) row.theme = week.weekName;
  // Store structured data in the posts JSONB column
  row.posts = {
    weekName: week.weekName,
    postA: week.postA,
    postB: week.postB,
    ondrejTue: week.ondrejTue,
    ondrejThu: week.ondrejThu,
  };
  return row;
}

function mapDbToMonthlyTheme(row: DbMonthlyTheme): MonthlyTheme {
  return {
    id: row.id,
    month: row.month,
    themeName: row.theme,
    emoji: row.emoji ?? '',
    status: (row.status as MonthlyTheme['status']) ?? 'planned',
  };
}

function mapDbToTeamMember(row: DbTeamMember): TeamMember {
  return {
    userId: row.user_id as UserId,
    responsibilities: row.responsibilities ?? [],
  };
}

function mapDbToWorkflowStep(row: DbWorkflowStep): WorkflowStep {
  return {
    step: row.step_number,
    who: row.who as UserId,
    day: row.day ?? '',
    task: row.task ?? '',
    time: row.time ?? '',
  };
}

function mapDbToBrandVoice(row: DbBrandVoice): BrandVoice {
  return {
    tagline: row.tagline ?? '',
    threeWords: row.three_words ?? ['', '', ''],
    dos: row.dos ?? [],
    donts: row.donts ?? [],
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useContentPlan() {
  const [contentPlan, setContentPlan] = useState<ContentPlan>(DEFAULT_CONTENT_PLAN);
  const [pillars, setPillars] = useState<ContentPillar[]>([]);
  const [cadence, setCadence] = useState<CadenceSummary[]>([]);
  const [combinedGrid, setCombinedGrid] = useState<CombinedWeeklyGrid[]>([]);
  const [weeklySlots, setWeeklySlots] = useState<WeeklySlot[]>([]);
  const [monthlyProgram, setMonthlyProgram] = useState<MonthlyWeek[]>(DEFAULT_MONTHLY_WEEKS);
  const [monthlyThemes, setMonthlyThemes] = useState<MonthlyTheme[]>([]);
  const [teamResponsibilities, setTeamResponsibilities] = useState<TeamMember[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [brandVoice, setBrandVoice] = useState<BrandVoice>(DEFAULT_BRAND_VOICE);
  const [brandVoiceDbId, setBrandVoiceDbId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all data ────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const [
        planRes,
        pillarsRes,
        cadenceRes,
        gridRes,
        slotsRes,
        weeksRes,
        themesRes,
        teamRes,
        workflowRes,
        brandRes,
      ] = await Promise.all([
        supabase.from('content_plans').select('*').limit(1).single(),
        supabase.from('content_pillars').select('*').order('sort_order', { ascending: true }),
        supabase.from('cadence_summaries').select('*'),
        supabase.from('combined_weekly_grid').select('*'),
        supabase.from('weekly_slots').select('*').order('sort_order', { ascending: true }),
        supabase.from('monthly_weeks').select('*').order('sort_order', { ascending: true }),
        supabase.from('monthly_themes').select('*').order('sort_order', { ascending: true }),
        supabase.from('team_members').select('*'),
        supabase.from('workflow_steps').select('*').order('sort_order', { ascending: true }),
        supabase.from('brand_voice').select('*').limit(1).single(),
      ]);

      // Content plan (may not exist yet)
      if (planRes.data && !planRes.error) {
        setContentPlan(mapDbToContentPlan(planRes.data as DbContentPlan));
      }

      // Pillars
      if (pillarsRes.data && !pillarsRes.error) {
        setPillars((pillarsRes.data as DbContentPillar[]).map(mapDbToPillar));
      }

      // Cadence
      if (cadenceRes.data && !cadenceRes.error) {
        setCadence((cadenceRes.data as DbCadenceSummary[]).map(mapDbToCadenceSummary));
      }

      // Combined grid
      if (gridRes.data && !gridRes.error) {
        setCombinedGrid((gridRes.data as DbCombinedWeeklyGrid[]).map(mapDbToGrid));
      }

      // Weekly slots
      if (slotsRes.data && !slotsRes.error) {
        setWeeklySlots((slotsRes.data as DbWeeklySlot[]).map(mapDbToWeeklySlot));
      }

      // Monthly weeks
      if (weeksRes.data && !weeksRes.error && weeksRes.data.length > 0) {
        setMonthlyProgram((weeksRes.data as DbMonthlyWeek[]).map(mapDbToMonthlyWeek));
      }

      // Monthly themes
      if (themesRes.data && !themesRes.error) {
        setMonthlyThemes((themesRes.data as DbMonthlyTheme[]).map(mapDbToMonthlyTheme));
      }

      // Team
      if (teamRes.data && !teamRes.error) {
        setTeamResponsibilities((teamRes.data as DbTeamMember[]).map(mapDbToTeamMember));
      }

      // Workflow
      if (workflowRes.data && !workflowRes.error) {
        setWorkflow((workflowRes.data as DbWorkflowStep[]).map(mapDbToWorkflowStep));
      }

      // Brand voice
      if (brandRes.data && !brandRes.error) {
        const bv = brandRes.data as DbBrandVoice;
        setBrandVoice(mapDbToBrandVoice(bv));
        setBrandVoiceDbId(bv.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch content plan data';
      setError(message);
      console.error('[useContentPlan] fetch error:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const supabase = createClient();
    const tables = [
      'content_plans', 'content_pillars', 'cadence_summaries',
      'combined_weekly_grid', 'weekly_slots', 'monthly_weeks',
      'monthly_themes', 'team_members', 'workflow_steps',
    ];
    const channels = tables.map((table) =>
      supabase
        .channel(`${table}-realtime`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => { fetchAll(); }
        )
        .subscribe()
    );
    return () => { channels.forEach((ch) => supabase.removeChannel(ch)); };
  }, [fetchAll]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT PLAN MUTATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const updateContentPlan = useCallback(
    async (updates: Partial<ContentPlan>) => {
      const previous = contentPlan;
      const merged = { ...contentPlan, ...updates };
      setContentPlan(merged);

      try {
        const supabase = createClient();
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
        if (updates.northStar !== undefined) dbUpdates.north_star_goals = updates.northStar;
        if (updates.kpis !== undefined) {
          dbUpdates.kpi_primary = serializeKPIs(updates.kpis.primary);
          dbUpdates.kpi_secondary = serializeKPIs(updates.kpis.secondary);
        }

        const { error: updateError } = await supabase
          .from('content_plans')
          .update(dbUpdates)
          .eq('id', contentPlan.id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setContentPlan(previous);
        const message = err instanceof Error ? err.message : 'Failed to update content plan';
        setError(message);
        console.error('[useContentPlan] updateContentPlan error:', message);
      }
    },
    [contentPlan],
  );

  // ── North Star Goals ──────────────────────────────────────────────────────

  const addNorthStarGoal = useCallback(
    async (goalData: Omit<NorthStarGoal, 'id'>) => {
      const newGoal: NorthStarGoal = { ...goalData, id: `ns-${Date.now()}` };
      const updatedGoals = [...contentPlan.northStar, newGoal];
      const previous = contentPlan;

      setContentPlan((prev) => ({ ...prev, northStar: updatedGoals }));

      try {
        const supabase = createClient();
        const { error: updateError } = await supabase
          .from('content_plans')
          .update({ north_star_goals: updatedGoals })
          .eq('id', contentPlan.id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setContentPlan(previous);
        const message = err instanceof Error ? err.message : 'Failed to add north star goal';
        setError(message);
        console.error('[useContentPlan] addNorthStarGoal error:', message);
      }
    },
    [contentPlan],
  );

  const updateNorthStarGoal = useCallback(
    async (id: string, updates: Partial<NorthStarGoal>) => {
      const updatedGoals = contentPlan.northStar.map((g) =>
        g.id === id ? { ...g, ...updates } : g,
      );
      const previous = contentPlan;

      setContentPlan((prev) => ({ ...prev, northStar: updatedGoals }));

      try {
        const supabase = createClient();
        const { error: updateError } = await supabase
          .from('content_plans')
          .update({ north_star_goals: updatedGoals })
          .eq('id', contentPlan.id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setContentPlan(previous);
        const message = err instanceof Error ? err.message : 'Failed to update north star goal';
        setError(message);
        console.error('[useContentPlan] updateNorthStarGoal error:', message);
      }
    },
    [contentPlan],
  );

  const deleteNorthStarGoal = useCallback(
    async (id: string) => {
      const updatedGoals = contentPlan.northStar.filter((g) => g.id !== id);
      const previous = contentPlan;

      setContentPlan((prev) => ({ ...prev, northStar: updatedGoals }));

      try {
        const supabase = createClient();
        const { error: updateError } = await supabase
          .from('content_plans')
          .update({ north_star_goals: updatedGoals })
          .eq('id', contentPlan.id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setContentPlan(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete north star goal';
        setError(message);
        console.error('[useContentPlan] deleteNorthStarGoal error:', message);
      }
    },
    [contentPlan],
  );

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const addKPI = useCallback(
    async (section: 'primary' | 'secondary', label: string) => {
      const updatedKpis: KPISection = {
        ...contentPlan.kpis,
        [section]: [...contentPlan.kpis[section], { label }],
      };
      const previous = contentPlan;

      setContentPlan((prev) => ({ ...prev, kpis: updatedKpis }));

      try {
        const supabase = createClient();
        const dbField = section === 'primary' ? 'kpi_primary' : 'kpi_secondary';
        const { error: updateError } = await supabase
          .from('content_plans')
          .update({ [dbField]: serializeKPIs(updatedKpis[section]) })
          .eq('id', contentPlan.id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setContentPlan(previous);
        const message = err instanceof Error ? err.message : 'Failed to add KPI';
        setError(message);
        console.error('[useContentPlan] addKPI error:', message);
      }
    },
    [contentPlan],
  );

  const updateKPI = useCallback(
    async (section: 'primary' | 'secondary', index: number, label: string) => {
      const updatedItems = contentPlan.kpis[section].map((k, i) =>
        i === index ? { ...k, label } : k,
      );
      const updatedKpis: KPISection = { ...contentPlan.kpis, [section]: updatedItems };
      const previous = contentPlan;

      setContentPlan((prev) => ({ ...prev, kpis: updatedKpis }));

      try {
        const supabase = createClient();
        const dbField = section === 'primary' ? 'kpi_primary' : 'kpi_secondary';
        const { error: updateError } = await supabase
          .from('content_plans')
          .update({ [dbField]: serializeKPIs(updatedItems) })
          .eq('id', contentPlan.id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setContentPlan(previous);
        const message = err instanceof Error ? err.message : 'Failed to update KPI';
        setError(message);
        console.error('[useContentPlan] updateKPI error:', message);
      }
    },
    [contentPlan],
  );

  const deleteKPI = useCallback(
    async (section: 'primary' | 'secondary', index: number) => {
      const updatedItems = contentPlan.kpis[section].filter((_, i) => i !== index);
      const updatedKpis: KPISection = { ...contentPlan.kpis, [section]: updatedItems };
      const previous = contentPlan;

      setContentPlan((prev) => ({ ...prev, kpis: updatedKpis }));

      try {
        const supabase = createClient();
        const dbField = section === 'primary' ? 'kpi_primary' : 'kpi_secondary';
        const { error: updateError } = await supabase
          .from('content_plans')
          .update({ [dbField]: serializeKPIs(updatedItems) })
          .eq('id', contentPlan.id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setContentPlan(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete KPI';
        setError(message);
        console.error('[useContentPlan] deleteKPI error:', message);
      }
    },
    [contentPlan],
  );

  // ── Brand Voice ───────────────────────────────────────────────────────────

  const updateBrandVoice = useCallback(
    async (updates: Partial<BrandVoice>) => {
      const previous = brandVoice;
      const merged = { ...brandVoice, ...updates };
      setBrandVoice(merged);

      try {
        const supabase = createClient();
        const dbUpdates: Record<string, unknown> = {};
        if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
        if (updates.threeWords !== undefined) dbUpdates.three_words = updates.threeWords;
        if (updates.dos !== undefined) dbUpdates.dos = updates.dos;
        if (updates.donts !== undefined) dbUpdates.donts = updates.donts;

        if (brandVoiceDbId) {
          const { error: updateError } = await supabase
            .from('brand_voice')
            .update(dbUpdates)
            .eq('id', brandVoiceDbId);

          if (updateError) throw new Error(updateError.message);
        } else {
          // No row yet; insert one
          const { data: inserted, error: insertError } = await supabase
            .from('brand_voice')
            .insert({
              tagline: merged.tagline,
              three_words: merged.threeWords,
              dos: merged.dos,
              donts: merged.donts,
            })
            .select()
            .single();

          if (insertError) throw new Error(insertError.message);
          setBrandVoiceDbId((inserted as DbBrandVoice).id);
        }
      } catch (err) {
        setBrandVoice(previous);
        const message = err instanceof Error ? err.message : 'Failed to update brand voice';
        setError(message);
        console.error('[useContentPlan] updateBrandVoice error:', message);
      }
    },
    [brandVoice, brandVoiceDbId],
  );

  const addBrandVoiceItem = useCallback(
    async (list: 'dos' | 'donts', item: string) => {
      const updatedList = [...brandVoice[list], item];
      await updateBrandVoice({ [list]: updatedList });
    },
    [brandVoice, updateBrandVoice],
  );

  const updateBrandVoiceItem = useCallback(
    async (list: 'dos' | 'donts', index: number, item: string) => {
      const updatedList = brandVoice[list].map((v, i) => (i === index ? item : v));
      await updateBrandVoice({ [list]: updatedList });
    },
    [brandVoice, updateBrandVoice],
  );

  const deleteBrandVoiceItem = useCallback(
    async (list: 'dos' | 'donts', index: number) => {
      const updatedList = brandVoice[list].filter((_, i) => i !== index);
      await updateBrandVoice({ [list]: updatedList });
    },
    [brandVoice, updateBrandVoice],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // PILLARS
  // ═══════════════════════════════════════════════════════════════════════════

  const addPillar = useCallback(
    async (data: Omit<ContentPillar, 'id' | 'sortOrder'>) => {
      const sortOrder = pillars.length + 1;
      const optimisticId = `pillar-${Date.now()}`;
      const optimistic: ContentPillar = { ...data, id: optimisticId, sortOrder };

      setPillars((prev) => [...prev, optimistic]);

      try {
        const supabase = createClient();
        const { data: inserted, error: insertError } = await supabase
          .from('content_pillars')
          .insert({
            name: data.name,
            color: data.color,
            description: data.description ?? null,
            formats: data.formats,
            frequency: data.frequency,
            goal: data.goal,
            sort_order: sortOrder,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        const real = mapDbToPillar(inserted as DbContentPillar);
        setPillars((prev) => prev.map((p) => (p.id === optimisticId ? real : p)));
      } catch (err) {
        setPillars((prev) => prev.filter((p) => p.id !== optimisticId));
        const message = err instanceof Error ? err.message : 'Failed to add pillar';
        setError(message);
        console.error('[useContentPlan] addPillar error:', message);
      }
    },
    [pillars.length],
  );

  const updatePillar = useCallback(
    async (id: string, updates: Partial<ContentPillar>) => {
      const previous = pillars;
      setPillars((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

      try {
        const supabase = createClient();
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.color !== undefined) dbUpdates.color = updates.color;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.formats !== undefined) dbUpdates.formats = updates.formats;
        if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
        if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
        if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

        const { error: updateError } = await supabase
          .from('content_pillars')
          .update(dbUpdates)
          .eq('id', id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setPillars(previous);
        const message = err instanceof Error ? err.message : 'Failed to update pillar';
        setError(message);
        console.error('[useContentPlan] updatePillar error:', message);
      }
    },
    [pillars],
  );

  const deletePillar = useCallback(
    async (id: string) => {
      const previous = pillars;
      setPillars((prev) => prev.filter((p) => p.id !== id));

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('content_pillars')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
      } catch (err) {
        setPillars(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete pillar';
        setError(message);
        console.error('[useContentPlan] deletePillar error:', message);
      }
    },
    [pillars],
  );

  const reorderPillars = useCallback(
    async (reordered: ContentPillar[]) => {
      const previous = pillars;
      setPillars(reordered);

      try {
        const supabase = createClient();
        const updates = reordered.map((p, i) =>
          supabase.from('content_pillars').update({ sort_order: i + 1 }).eq('id', p.id),
        );
        const results = await Promise.all(updates);
        const failed = results.find((r) => r.error);
        if (failed?.error) throw new Error(failed.error.message);
      } catch (err) {
        setPillars(previous);
        const message = err instanceof Error ? err.message : 'Failed to reorder pillars';
        setError(message);
        console.error('[useContentPlan] reorderPillars error:', message);
      }
    },
    [pillars],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // CADENCE
  // ═══════════════════════════════════════════════════════════════════════════

  const addCadenceEntry = useCallback(
    async (accountIndex: number, entry: Omit<CadenceEntry, 'id'>) => {
      const newEntry: CadenceEntry = { ...entry, id: `cad-${Date.now()}` };
      const previous = cadence;

      setCadence((prev) =>
        prev.map((c, i) =>
          i === accountIndex ? { ...c, entries: [...c.entries, newEntry] } : c,
        ),
      );

      try {
        const supabase = createClient();
        const target = cadence[accountIndex];
        if (!target) throw new Error('Invalid account index');

        const updatedEntries = [...target.entries, newEntry];
        const { error: updateError } = await supabase
          .from('cadence_summaries')
          .update({ entries: updatedEntries })
          .eq('account_name', target.account);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setCadence(previous);
        const message = err instanceof Error ? err.message : 'Failed to add cadence entry';
        setError(message);
        console.error('[useContentPlan] addCadenceEntry error:', message);
      }
    },
    [cadence],
  );

  const updateCadenceEntry = useCallback(
    async (entryId: string, updates: Partial<CadenceEntry>) => {
      const previous = cadence;

      const updatedCadence = cadence.map((c) => ({
        ...c,
        entries: c.entries.map((e) => (e.id === entryId ? { ...e, ...updates } : e)),
      }));
      setCadence(updatedCadence);

      try {
        const supabase = createClient();
        // Find which summary owns this entry
        const ownerSummary = cadence.find((c) => c.entries.some((e) => e.id === entryId));
        if (!ownerSummary) throw new Error('Entry not found in any cadence summary');

        const updatedEntries = ownerSummary.entries.map((e) =>
          e.id === entryId ? { ...e, ...updates } : e,
        );
        const { error: updateError } = await supabase
          .from('cadence_summaries')
          .update({ entries: updatedEntries })
          .eq('account_name', ownerSummary.account);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setCadence(previous);
        const message = err instanceof Error ? err.message : 'Failed to update cadence entry';
        setError(message);
        console.error('[useContentPlan] updateCadenceEntry error:', message);
      }
    },
    [cadence],
  );

  const deleteCadenceEntry = useCallback(
    async (entryId: string) => {
      const previous = cadence;

      setCadence((prev) =>
        prev.map((c) => ({
          ...c,
          entries: c.entries.filter((e) => e.id !== entryId),
        })),
      );

      try {
        const supabase = createClient();
        const ownerSummary = cadence.find((c) => c.entries.some((e) => e.id === entryId));
        if (!ownerSummary) throw new Error('Entry not found in any cadence summary');

        const updatedEntries = ownerSummary.entries.filter((e) => e.id !== entryId);
        const { error: updateError } = await supabase
          .from('cadence_summaries')
          .update({ entries: updatedEntries })
          .eq('account_name', ownerSummary.account);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setCadence(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete cadence entry';
        setError(message);
        console.error('[useContentPlan] deleteCadenceEntry error:', message);
      }
    },
    [cadence],
  );

  const updateCadenceSummary = useCallback(
    async (accountIndex: number, updates: Partial<CadenceSummary>) => {
      const previous = cadence;

      setCadence((prev) =>
        prev.map((c, i) => (i === accountIndex ? { ...c, ...updates } : c)),
      );

      try {
        const supabase = createClient();
        const target = cadence[accountIndex];
        if (!target) throw new Error('Invalid account index');

        const dbUpdates: Record<string, unknown> = {};
        if (updates.weeklyTotal !== undefined) dbUpdates.total_per_week = updates.weeklyTotal;
        if (updates.entries !== undefined) dbUpdates.entries = updates.entries;

        const { error: updateError } = await supabase
          .from('cadence_summaries')
          .update(dbUpdates)
          .eq('account_name', target.account);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setCadence(previous);
        const message = err instanceof Error ? err.message : 'Failed to update cadence summary';
        setError(message);
        console.error('[useContentPlan] updateCadenceSummary error:', message);
      }
    },
    [cadence],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // COMBINED WEEKLY GRID
  // ═══════════════════════════════════════════════════════════════════════════

  const updateCombinedGridCell = useCallback(
    async (platform: string, day: string, value: string) => {
      const previous = combinedGrid;

      setCombinedGrid((prev) =>
        prev.map((row) =>
          row.platform === platform
            ? { ...row, days: { ...row.days, [day]: value } }
            : row,
        ),
      );

      try {
        const supabase = createClient();
        // day is like 'monday', 'tuesday' etc. – matches column names
        const { error: updateError } = await supabase
          .from('combined_weekly_grid')
          .update({ [day]: value })
          .eq('platform', platform);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setCombinedGrid(previous);
        const message = err instanceof Error ? err.message : 'Failed to update grid cell';
        setError(message);
        console.error('[useContentPlan] updateCombinedGridCell error:', message);
      }
    },
    [combinedGrid],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // WEEKLY SLOTS
  // ═══════════════════════════════════════════════════════════════════════════

  const addWeeklySlot = useCallback(
    async (data: Omit<WeeklySlot, 'id'>) => {
      const optimisticId = `ws-${Date.now()}`;
      const optimistic: WeeklySlot = { ...data, id: optimisticId };

      setWeeklySlots((prev) => [...prev, optimistic]);

      try {
        const supabase = createClient();
        const { data: inserted, error: insertError } = await supabase
          .from('weekly_slots')
          .insert({
            day: data.dayOfWeek,
            slot_name: data.slotName,
            goal: data.goal,
            formats: data.formats.join(', '),
            pillar_id: data.pillar || null,
            sort_order: weeklySlots.length + 1,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        const real = mapDbToWeeklySlot(inserted as DbWeeklySlot);
        setWeeklySlots((prev) => prev.map((s) => (s.id === optimisticId ? real : s)));
      } catch (err) {
        setWeeklySlots((prev) => prev.filter((s) => s.id !== optimisticId));
        const message = err instanceof Error ? err.message : 'Failed to add weekly slot';
        setError(message);
        console.error('[useContentPlan] addWeeklySlot error:', message);
      }
    },
    [weeklySlots.length],
  );

  const updateWeeklySlot = useCallback(
    async (id: string, updates: Partial<WeeklySlot>) => {
      const previous = weeklySlots;
      setWeeklySlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));

      try {
        const supabase = createClient();
        const dbUpdates: Record<string, unknown> = {};
        if (updates.dayOfWeek !== undefined) dbUpdates.day = updates.dayOfWeek;
        if (updates.slotName !== undefined) dbUpdates.slot_name = updates.slotName;
        if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
        if (updates.formats !== undefined) dbUpdates.formats = updates.formats.join(', ');
        if (updates.pillar !== undefined) dbUpdates.pillar_id = updates.pillar || null;

        const { error: updateError } = await supabase
          .from('weekly_slots')
          .update(dbUpdates)
          .eq('id', id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setWeeklySlots(previous);
        const message = err instanceof Error ? err.message : 'Failed to update weekly slot';
        setError(message);
        console.error('[useContentPlan] updateWeeklySlot error:', message);
      }
    },
    [weeklySlots],
  );

  const deleteWeeklySlot = useCallback(
    async (id: string) => {
      const previous = weeklySlots;
      setWeeklySlots((prev) => prev.filter((s) => s.id !== id));

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('weekly_slots')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
      } catch (err) {
        setWeeklySlots(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete weekly slot';
        setError(message);
        console.error('[useContentPlan] deleteWeeklySlot error:', message);
      }
    },
    [weeklySlots],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MONTHLY PROGRAM & THEMES
  // ═══════════════════════════════════════════════════════════════════════════

  const updateMonthlyWeek = useCallback(
    async (weekNumber: number, updates: Partial<MonthlyWeek>) => {
      const previous = monthlyProgram;
      const updatedWeeks = monthlyProgram.map((w) =>
        w.weekNumber === weekNumber ? { ...w, ...updates } : w,
      );
      setMonthlyProgram(updatedWeeks);

      try {
        const supabase = createClient();
        const week = updatedWeeks.find((w) => w.weekNumber === weekNumber);
        if (!week) throw new Error('Week not found');

        const dbUpdates = mapMonthlyWeekToDb(week);
        const { error: updateError } = await supabase
          .from('monthly_weeks')
          .update(dbUpdates)
          .eq('week_number', weekNumber);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setMonthlyProgram(previous);
        const message = err instanceof Error ? err.message : 'Failed to update monthly week';
        setError(message);
        console.error('[useContentPlan] updateMonthlyWeek error:', message);
      }
    },
    [monthlyProgram],
  );

  const addMonthlyTheme = useCallback(
    async (data: Omit<MonthlyTheme, 'id'>) => {
      const optimisticId = `mt-${Date.now()}`;
      const optimistic: MonthlyTheme = { ...data, id: optimisticId };

      setMonthlyThemes((prev) => [...prev, optimistic]);

      try {
        const supabase = createClient();
        const { data: inserted, error: insertError } = await supabase
          .from('monthly_themes')
          .insert({
            month: data.month,
            emoji: data.emoji,
            theme: data.themeName,
            status: data.status,
            sort_order: monthlyThemes.length + 1,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        const real = mapDbToMonthlyTheme(inserted as DbMonthlyTheme);
        setMonthlyThemes((prev) => prev.map((t) => (t.id === optimisticId ? real : t)));
      } catch (err) {
        setMonthlyThemes((prev) => prev.filter((t) => t.id !== optimisticId));
        const message = err instanceof Error ? err.message : 'Failed to add monthly theme';
        setError(message);
        console.error('[useContentPlan] addMonthlyTheme error:', message);
      }
    },
    [monthlyThemes.length],
  );

  const updateMonthlyTheme = useCallback(
    async (id: string, updates: Partial<MonthlyTheme>) => {
      const previous = monthlyThemes;
      setMonthlyThemes((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

      try {
        const supabase = createClient();
        const dbUpdates: Record<string, unknown> = {};
        if (updates.month !== undefined) dbUpdates.month = updates.month;
        if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
        if (updates.themeName !== undefined) dbUpdates.theme = updates.themeName;
        if (updates.status !== undefined) dbUpdates.status = updates.status;

        const { error: updateError } = await supabase
          .from('monthly_themes')
          .update(dbUpdates)
          .eq('id', id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setMonthlyThemes(previous);
        const message = err instanceof Error ? err.message : 'Failed to update monthly theme';
        setError(message);
        console.error('[useContentPlan] updateMonthlyTheme error:', message);
      }
    },
    [monthlyThemes],
  );

  const deleteMonthlyTheme = useCallback(
    async (id: string) => {
      const previous = monthlyThemes;
      setMonthlyThemes((prev) => prev.filter((t) => t.id !== id));

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('monthly_themes')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
      } catch (err) {
        setMonthlyThemes(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete monthly theme';
        setError(message);
        console.error('[useContentPlan] deleteMonthlyTheme error:', message);
      }
    },
    [monthlyThemes],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TEAM & WORKFLOW
  // ═══════════════════════════════════════════════════════════════════════════

  const addTeamResponsibility = useCallback(
    async (userId: UserId, responsibility: string) => {
      const previous = teamResponsibilities;

      setTeamResponsibilities((prev) =>
        prev.map((m) =>
          m.userId === userId
            ? { ...m, responsibilities: [...m.responsibilities, responsibility] }
            : m,
        ),
      );

      try {
        const supabase = createClient();
        const member = teamResponsibilities.find((m) => m.userId === userId);
        if (!member) throw new Error('Team member not found');

        const updatedResponsibilities = [...member.responsibilities, responsibility];
        const { error: updateError } = await supabase
          .from('team_members')
          .update({ responsibilities: updatedResponsibilities })
          .eq('user_id', userId);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setTeamResponsibilities(previous);
        const message = err instanceof Error ? err.message : 'Failed to add team responsibility';
        setError(message);
        console.error('[useContentPlan] addTeamResponsibility error:', message);
      }
    },
    [teamResponsibilities],
  );

  const updateTeamResponsibility = useCallback(
    async (userId: UserId, index: number, responsibility: string) => {
      const previous = teamResponsibilities;

      setTeamResponsibilities((prev) =>
        prev.map((m) =>
          m.userId === userId
            ? {
                ...m,
                responsibilities: m.responsibilities.map((r, i) =>
                  i === index ? responsibility : r,
                ),
              }
            : m,
        ),
      );

      try {
        const supabase = createClient();
        const member = teamResponsibilities.find((m) => m.userId === userId);
        if (!member) throw new Error('Team member not found');

        const updatedResponsibilities = member.responsibilities.map((r, i) =>
          i === index ? responsibility : r,
        );
        const { error: updateError } = await supabase
          .from('team_members')
          .update({ responsibilities: updatedResponsibilities })
          .eq('user_id', userId);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setTeamResponsibilities(previous);
        const message = err instanceof Error ? err.message : 'Failed to update team responsibility';
        setError(message);
        console.error('[useContentPlan] updateTeamResponsibility error:', message);
      }
    },
    [teamResponsibilities],
  );

  const deleteTeamResponsibility = useCallback(
    async (userId: UserId, index: number) => {
      const previous = teamResponsibilities;

      setTeamResponsibilities((prev) =>
        prev.map((m) =>
          m.userId === userId
            ? { ...m, responsibilities: m.responsibilities.filter((_, i) => i !== index) }
            : m,
        ),
      );

      try {
        const supabase = createClient();
        const member = teamResponsibilities.find((m) => m.userId === userId);
        if (!member) throw new Error('Team member not found');

        const updatedResponsibilities = member.responsibilities.filter((_, i) => i !== index);
        const { error: updateError } = await supabase
          .from('team_members')
          .update({ responsibilities: updatedResponsibilities })
          .eq('user_id', userId);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setTeamResponsibilities(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete team responsibility';
        setError(message);
        console.error('[useContentPlan] deleteTeamResponsibility error:', message);
      }
    },
    [teamResponsibilities],
  );

  const addWorkflowStep = useCallback(
    async (data: Omit<WorkflowStep, 'step'>) => {
      const step = workflow.length + 1;
      const optimistic: WorkflowStep = { ...data, step };

      setWorkflow((prev) => [...prev, optimistic]);

      try {
        const supabase = createClient();
        const { data: inserted, error: insertError } = await supabase
          .from('workflow_steps')
          .insert({
            step_number: step,
            who: data.who,
            day: data.day,
            task: data.task,
            time: data.time,
            sort_order: step,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        const real = mapDbToWorkflowStep(inserted as DbWorkflowStep);
        setWorkflow((prev) => prev.map((s) => (s.step === step ? real : s)));
      } catch (err) {
        setWorkflow((prev) => prev.filter((s) => s.step !== step));
        const message = err instanceof Error ? err.message : 'Failed to add workflow step';
        setError(message);
        console.error('[useContentPlan] addWorkflowStep error:', message);
      }
    },
    [workflow.length],
  );

  const updateWorkflowStep = useCallback(
    async (stepNumber: number, updates: Partial<WorkflowStep>) => {
      const previous = workflow;
      setWorkflow((prev) => prev.map((s) => (s.step === stepNumber ? { ...s, ...updates } : s)));

      try {
        const supabase = createClient();
        const dbUpdates: Record<string, unknown> = {};
        if (updates.who !== undefined) dbUpdates.who = updates.who;
        if (updates.day !== undefined) dbUpdates.day = updates.day;
        if (updates.task !== undefined) dbUpdates.task = updates.task;
        if (updates.time !== undefined) dbUpdates.time = updates.time;

        const { error: updateError } = await supabase
          .from('workflow_steps')
          .update(dbUpdates)
          .eq('step_number', stepNumber);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setWorkflow(previous);
        const message = err instanceof Error ? err.message : 'Failed to update workflow step';
        setError(message);
        console.error('[useContentPlan] updateWorkflowStep error:', message);
      }
    },
    [workflow],
  );

  const deleteWorkflowStep = useCallback(
    async (stepNumber: number) => {
      const previous = workflow;
      const filtered = workflow
        .filter((s) => s.step !== stepNumber)
        .map((s, i) => ({ ...s, step: i + 1 }));
      setWorkflow(filtered);

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('workflow_steps')
          .delete()
          .eq('step_number', stepNumber);

        if (deleteError) throw new Error(deleteError.message);

        // Re-number remaining steps in DB
        const updates = filtered.map((s) =>
          supabase
            .from('workflow_steps')
            .update({ step_number: s.step, sort_order: s.step })
            .eq('who', s.who)
            .eq('task', s.task),
        );
        await Promise.all(updates);
      } catch (err) {
        setWorkflow(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete workflow step';
        setError(message);
        console.error('[useContentPlan] deleteWorkflowStep error:', message);
      }
    },
    [workflow],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAR SECTION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const clearOverview = useCallback(async () => {
    const prevPlan = contentPlan;
    const prevBrand = brandVoice;

    setContentPlan((prev) => ({
      ...prev,
      northStar: [],
      kpis: { primary: [], secondary: [] },
    }));
    setBrandVoice({ tagline: '', threeWords: ['', '', ''], dos: [], donts: [] });

    try {
      const supabase = createClient();

      if (contentPlan.id) {
        const { error: planError } = await supabase
          .from('content_plans')
          .update({ north_star_goals: [], kpi_primary: '[]', kpi_secondary: '[]' })
          .eq('id', contentPlan.id);

        if (planError) throw new Error(planError.message);
      }

      if (brandVoiceDbId) {
        const { error: bvError } = await supabase
          .from('brand_voice')
          .update({ tagline: '', three_words: ['', '', ''], dos: [], donts: [] })
          .eq('id', brandVoiceDbId);

        if (bvError) throw new Error(bvError.message);
      }
    } catch (err) {
      setContentPlan(prevPlan);
      setBrandVoice(prevBrand);
      const message = err instanceof Error ? err.message : 'Failed to clear overview';
      setError(message);
      console.error('[useContentPlan] clearOverview error:', message);
    }
  }, [contentPlan, brandVoice, brandVoiceDbId]);

  const clearPillars = useCallback(async () => {
    const previous = pillars;
    setPillars([]);

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('content_pillars')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (deleteError) throw new Error(deleteError.message);
    } catch (err) {
      setPillars(previous);
      const message = err instanceof Error ? err.message : 'Failed to clear pillars';
      setError(message);
      console.error('[useContentPlan] clearPillars error:', message);
    }
  }, [pillars]);

  const clearCadence = useCallback(async () => {
    const prevCadence = cadence;
    const prevGrid = combinedGrid;

    setCadence((prev) =>
      prev.map((c) => ({ ...c, entries: [], weeklyTotal: '', monthlyTotal: '' })),
    );
    setCombinedGrid((prev) =>
      prev.map((row) => ({
        ...row,
        days: Object.fromEntries(Object.keys(row.days).map((d) => [d, '-'])),
      })),
    );

    try {
      const supabase = createClient();

      // Clear cadence entries
      for (const c of cadence) {
        const { error: cadErr } = await supabase
          .from('cadence_summaries')
          .update({ entries: [], total_per_week: '' })
          .eq('account_name', c.account);

        if (cadErr) throw new Error(cadErr.message);
      }

      // Clear grid
      for (const row of combinedGrid) {
        const resetDays: Record<string, string> = {};
        for (const day of DAY_COLUMNS) {
          resetDays[day] = '-';
        }
        const { error: gridErr } = await supabase
          .from('combined_weekly_grid')
          .update(resetDays)
          .eq('platform', row.platform);

        if (gridErr) throw new Error(gridErr.message);
      }
    } catch (err) {
      setCadence(prevCadence);
      setCombinedGrid(prevGrid);
      const message = err instanceof Error ? err.message : 'Failed to clear cadence';
      setError(message);
      console.error('[useContentPlan] clearCadence error:', message);
    }
  }, [cadence, combinedGrid]);

  const clearWeeklySlots = useCallback(async () => {
    const previous = weeklySlots;
    setWeeklySlots([]);

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('weekly_slots')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw new Error(deleteError.message);
    } catch (err) {
      setWeeklySlots(previous);
      const message = err instanceof Error ? err.message : 'Failed to clear weekly slots';
      setError(message);
      console.error('[useContentPlan] clearWeeklySlots error:', message);
    }
  }, [weeklySlots]);

  const clearMonthly = useCallback(async () => {
    const prevWeeks = monthlyProgram;
    const prevThemes = monthlyThemes;

    const emptyWeeks = DEFAULT_MONTHLY_WEEKS;
    setMonthlyProgram(emptyWeeks);
    setMonthlyThemes([]);

    try {
      const supabase = createClient();

      // Reset monthly weeks
      for (const week of emptyWeeks) {
        const { error: weekErr } = await supabase
          .from('monthly_weeks')
          .update({ theme: '', posts: { weekName: '', postA: { description: '', format: '' }, postB: { description: '', format: '' }, ondrejTue: '', ondrejThu: '' } })
          .eq('week_number', week.weekNumber);

        if (weekErr) throw new Error(weekErr.message);
      }

      // Delete all themes
      const { error: themesErr } = await supabase
        .from('monthly_themes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (themesErr) throw new Error(themesErr.message);
    } catch (err) {
      setMonthlyProgram(prevWeeks);
      setMonthlyThemes(prevThemes);
      const message = err instanceof Error ? err.message : 'Failed to clear monthly';
      setError(message);
      console.error('[useContentPlan] clearMonthly error:', message);
    }
  }, [monthlyProgram, monthlyThemes]);

  const clearTeamWorkflow = useCallback(async () => {
    const prevTeam = teamResponsibilities;
    const prevWorkflow = workflow;

    setTeamResponsibilities((prev) => prev.map((m) => ({ ...m, responsibilities: [] })));
    setWorkflow([]);

    try {
      const supabase = createClient();

      // Clear responsibilities
      for (const member of teamResponsibilities) {
        const { error: teamErr } = await supabase
          .from('team_members')
          .update({ responsibilities: [] })
          .eq('user_id', member.userId);

        if (teamErr) throw new Error(teamErr.message);
      }

      // Delete all workflow steps
      const { error: wfErr } = await supabase
        .from('workflow_steps')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (wfErr) throw new Error(wfErr.message);
    } catch (err) {
      setTeamResponsibilities(prevTeam);
      setWorkflow(prevWorkflow);
      const message = err instanceof Error ? err.message : 'Failed to clear team/workflow';
      setError(message);
      console.error('[useContentPlan] clearTeamWorkflow error:', message);
    }
  }, [teamResponsibilities, workflow]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // Data
    contentPlan,
    pillars,
    cadence,
    combinedGrid,
    weeklySlots,
    monthlyProgram,
    monthlyThemes,
    teamResponsibilities,
    workflow,
    brandVoice,
    isLoading,
    error,

    // Content plan mutations
    updateContentPlan,
    addNorthStarGoal,
    updateNorthStarGoal,
    deleteNorthStarGoal,
    addKPI,
    updateKPI,
    deleteKPI,

    // Brand voice
    updateBrandVoice,
    addBrandVoiceItem,
    updateBrandVoiceItem,
    deleteBrandVoiceItem,

    // Pillars
    addPillar,
    updatePillar,
    deletePillar,
    reorderPillars,

    // Cadence
    addCadenceEntry,
    updateCadenceEntry,
    deleteCadenceEntry,
    updateCadenceSummary,

    // Combined grid
    updateCombinedGridCell,

    // Weekly slots
    addWeeklySlot,
    updateWeeklySlot,
    deleteWeeklySlot,

    // Monthly
    updateMonthlyWeek,
    addMonthlyTheme,
    updateMonthlyTheme,
    deleteMonthlyTheme,

    // Team & workflow
    addTeamResponsibility,
    updateTeamResponsibility,
    deleteTeamResponsibility,
    addWorkflowStep,
    updateWorkflowStep,
    deleteWorkflowStep,

    // Clear sections
    clearOverview,
    clearPillars,
    clearCadence,
    clearWeeklySlots,
    clearMonthly,
    clearTeamWorkflow,

    // Refetch
    refetch: fetchAll,
  };
}
