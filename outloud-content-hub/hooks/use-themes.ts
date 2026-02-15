'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Theme } from '@/types';

// ── DB row shape (snake_case) ─────────────────────────────────────────────────
interface DbTheme {
  id: string;
  name: string;
  color: string;
  description: string | null;
  sort_order: number;
  is_default: boolean;
  created_at: string;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapDbToTheme(row: DbTheme): Theme {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    description: row.description ?? undefined,
    sortOrder: row.sort_order,
    isDefault: row.is_default,
  };
}

function mapThemeToDb(theme: Partial<Theme>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (theme.name !== undefined) row.name = theme.name;
  if (theme.color !== undefined) row.color = theme.color;
  if (theme.description !== undefined) row.description = theme.description ?? null;
  if (theme.sortOrder !== undefined) row.sort_order = theme.sortOrder;
  if (theme.isDefault !== undefined) row.is_default = theme.isDefault;
  return row;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchThemes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('themes')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) throw new Error(fetchError.message);

      setThemes((data as DbTheme[]).map(mapDbToTheme));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch themes';
      setError(message);
      console.error('[useThemes] fetch error:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('themes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'themes' },
        () => { fetchThemes(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchThemes]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addTheme = useCallback(
    async (data: Omit<Theme, 'id' | 'sortOrder'>) => {
      const sortOrder = themes.length + 1;
      const optimisticId = `theme-${Date.now()}`;
      const optimistic: Theme = { ...data, id: optimisticId, sortOrder };

      // Optimistic update
      setThemes((prev) => [...prev, optimistic]);

      try {
        const supabase = createClient();
        const { data: inserted, error: insertError } = await supabase
          .from('themes')
          .insert({
            name: data.name,
            color: data.color,
            description: data.description ?? null,
            sort_order: sortOrder,
            is_default: data.isDefault,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);

        // Replace optimistic entry with real row
        const real = mapDbToTheme(inserted as DbTheme);
        setThemes((prev) => prev.map((t) => (t.id === optimisticId ? real : t)));
      } catch (err) {
        // Rollback
        setThemes((prev) => prev.filter((t) => t.id !== optimisticId));
        const message = err instanceof Error ? err.message : 'Failed to add theme';
        setError(message);
        console.error('[useThemes] addTheme error:', message);
      }
    },
    [themes.length],
  );

  const updateTheme = useCallback(
    async (id: string, updates: Partial<Theme>) => {
      // Capture previous state for rollback
      const previous = themes;

      // Optimistic update
      setThemes((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

      try {
        const supabase = createClient();
        const dbUpdates = mapThemeToDb(updates);
        const { error: updateError } = await supabase
          .from('themes')
          .update(dbUpdates)
          .eq('id', id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setThemes(previous);
        const message = err instanceof Error ? err.message : 'Failed to update theme';
        setError(message);
        console.error('[useThemes] updateTheme error:', message);
      }
    },
    [themes],
  );

  const deleteTheme = useCallback(
    async (id: string) => {
      const previous = themes;

      // Optimistic update
      setThemes((prev) => prev.filter((t) => t.id !== id));

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('themes')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
      } catch (err) {
        setThemes(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete theme';
        setError(message);
        console.error('[useThemes] deleteTheme error:', message);
      }
    },
    [themes],
  );

  const reorderThemes = useCallback(
    async (reordered: Theme[]) => {
      const previous = themes;

      // Optimistic update
      setThemes(reordered);

      try {
        const supabase = createClient();

        // Update sort_order for each theme
        const updates = reordered.map((t, i) =>
          supabase
            .from('themes')
            .update({ sort_order: i + 1 })
            .eq('id', t.id),
        );

        const results = await Promise.all(updates);
        const failed = results.find((r) => r.error);
        if (failed?.error) throw new Error(failed.error.message);
      } catch (err) {
        setThemes(previous);
        const message = err instanceof Error ? err.message : 'Failed to reorder themes';
        setError(message);
        console.error('[useThemes] reorderThemes error:', message);
      }
    },
    [themes],
  );

  return {
    themes,
    isLoading,
    error,
    addTheme,
    updateTheme,
    deleteTheme,
    reorderThemes,
    refetch: fetchThemes,
  };
}
