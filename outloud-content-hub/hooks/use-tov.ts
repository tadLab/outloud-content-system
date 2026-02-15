'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  TovGuideline,
  TovExample,
  TovBlockedPhrase,
  TovDo,
  TovDont,
  VoiceSplitAccount,
  VoiceComparison,
  WritingStyleRule,
} from '@/types';

// ── DB row shapes (snake_case) ────────────────────────────────────────────────

interface DbTovGuideline {
  id: string;
  title: string;
  content: string;
  sort_order: number;
}

interface DbWritingStyle {
  id: string;
  title: string;
  content: string;
  sort_order: number;
}

interface DbTovDo {
  id: string;
  item: string;
  example: string;
  sort_order: number;
}

interface DbTovDont {
  id: string;
  phrase: string;
  fix: string;
  sort_order: number;
}

interface DbTovExample {
  id: string;
  type: string;
  title: string | null;
  before_text: string | null;
  after_text: string;
  tags: string[] | null;
  sort_order: number;
}

interface DbVoiceSplit {
  id: string;
  account: string;
  voice_name: string;
  characteristics: string[] | null;
  example: string | null;
  sort_order: number;
}

interface DbVoiceComparison {
  id: string;
  aspect: string;
  outloud: string | null;
  ondrej: string | null;
  sort_order: number;
}

interface DbBlockedPhrase {
  id: string;
  phrase: string;
  suggestion: string | null;
  severity: string;
  sort_order: number;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapDbToGuideline(row: DbTovGuideline): TovGuideline {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    sortOrder: row.sort_order,
  };
}

function mapDbToWritingStyle(row: DbWritingStyle): WritingStyleRule {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
  };
}

function mapDbToDo(row: DbTovDo): TovDo & { id: string } {
  return {
    id: row.id,
    item: row.item,
    example: row.example,
  };
}

function mapDbToDont(row: DbTovDont): TovDont & { id: string } {
  return {
    id: row.id,
    phrase: row.phrase,
    fix: row.fix,
  };
}

function mapDbToExample(row: DbTovExample): TovExample {
  return {
    id: row.id,
    type: row.type as TovExample['type'],
    title: row.title ?? undefined,
    beforeText: row.before_text ?? undefined,
    afterText: row.after_text,
    tags: row.tags ?? [],
    sortOrder: row.sort_order,
  };
}

function mapDbToVoiceSplit(row: DbVoiceSplit): VoiceSplitAccount {
  return {
    account: row.account,
    voiceName: row.voice_name,
    characteristics: row.characteristics ?? [],
    example: row.example ?? '',
  };
}

function mapDbToVoiceComparison(row: DbVoiceComparison): VoiceComparison {
  return {
    aspect: row.aspect,
    outloud: row.outloud ?? '',
    ondrej: row.ondrej ?? '',
  };
}

function mapDbToBlockedPhrase(row: DbBlockedPhrase): TovBlockedPhrase {
  return {
    id: row.id,
    phrase: row.phrase,
    suggestion: row.suggestion ?? '',
    severity: row.severity as TovBlockedPhrase['severity'],
    appliesTo: [],
  };
}

// ── Internal types with id for dos/donts ────────────────────────────────────

type TovDoWithId = TovDo & { id: string };
type TovDontWithId = TovDont & { id: string };

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTov() {
  const [guidelines, setGuidelines] = useState<TovGuideline[]>([]);
  const [writingStyle, setWritingStyle] = useState<WritingStyleRule[]>([]);
  const [dos, setDos] = useState<TovDoWithId[]>([]);
  const [donts, setDonts] = useState<TovDontWithId[]>([]);
  const [examples, setExamples] = useState<TovExample[]>([]);
  const [voiceSplit, setVoiceSplit] = useState<VoiceSplitAccount[]>([]);
  const [voiceComparison, setVoiceComparison] = useState<VoiceComparison[]>([]);
  const [blockedPhrases, setBlockedPhrases] = useState<TovBlockedPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We need to keep DB IDs for voice comparison rows (indexed by position)
  const [voiceComparisonIds, setVoiceComparisonIds] = useState<string[]>([]);
  const [voiceSplitIds, setVoiceSplitIds] = useState<Record<string, string>>({});

  // ── Fetch all data ────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const [
        guidelinesRes,
        writingStyleRes,
        dosRes,
        dontsRes,
        examplesRes,
        voiceSplitRes,
        voiceCompRes,
        blockedRes,
      ] = await Promise.all([
        supabase.from('tov_guidelines').select('*').order('sort_order', { ascending: true }),
        supabase.from('tov_writing_style').select('*').order('sort_order', { ascending: true }),
        supabase.from('tov_dos').select('*').order('sort_order', { ascending: true }),
        supabase.from('tov_donts').select('*').order('sort_order', { ascending: true }),
        supabase.from('tov_examples').select('*').order('sort_order', { ascending: true }),
        supabase.from('tov_voice_split').select('*').order('sort_order', { ascending: true }),
        supabase.from('tov_voice_comparison').select('*').order('sort_order', { ascending: true }),
        supabase.from('tov_blocked_phrases').select('*').order('sort_order', { ascending: true }),
      ]);

      if (guidelinesRes.data && !guidelinesRes.error) {
        setGuidelines((guidelinesRes.data as DbTovGuideline[]).map(mapDbToGuideline));
      }

      if (writingStyleRes.data && !writingStyleRes.error) {
        setWritingStyle((writingStyleRes.data as DbWritingStyle[]).map(mapDbToWritingStyle));
      }

      if (dosRes.data && !dosRes.error) {
        setDos((dosRes.data as DbTovDo[]).map(mapDbToDo));
      }

      if (dontsRes.data && !dontsRes.error) {
        setDonts((dontsRes.data as DbTovDont[]).map(mapDbToDont));
      }

      if (examplesRes.data && !examplesRes.error) {
        setExamples((examplesRes.data as DbTovExample[]).map(mapDbToExample));
      }

      if (voiceSplitRes.data && !voiceSplitRes.error) {
        const rows = voiceSplitRes.data as DbVoiceSplit[];
        setVoiceSplit(rows.map(mapDbToVoiceSplit));
        const idMap: Record<string, string> = {};
        for (const row of rows) {
          idMap[row.account] = row.id;
        }
        setVoiceSplitIds(idMap);
      }

      if (voiceCompRes.data && !voiceCompRes.error) {
        const rows = voiceCompRes.data as DbVoiceComparison[];
        setVoiceComparison(rows.map(mapDbToVoiceComparison));
        setVoiceComparisonIds(rows.map((r) => r.id));
      }

      if (blockedRes.data && !blockedRes.error) {
        setBlockedPhrases((blockedRes.data as DbBlockedPhrase[]).map(mapDbToBlockedPhrase));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ToV data';
      setError(message);
      console.error('[useTov] fetch error:', message);
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
      'tov_guidelines', 'tov_writing_style', 'tov_dos', 'tov_donts',
      'tov_examples', 'tov_voice_split', 'tov_voice_comparison',
      'tov_blocked_phrases',
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
  // GUIDELINES
  // ═══════════════════════════════════════════════════════════════════════════

  const addGuideline = useCallback(
    async (data: Omit<TovGuideline, 'id'>) => {
      const optimisticId = `tg-${Date.now()}`;
      const optimistic: TovGuideline = { ...data, id: optimisticId };

      setGuidelines((prev) => [...prev, optimistic]);

      try {
        const supabase = createClient();
        const { data: inserted, error: insertError } = await supabase
          .from('tov_guidelines')
          .insert({
            title: data.title,
            content: data.content,
            sort_order: data.sortOrder,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        const real = mapDbToGuideline(inserted as DbTovGuideline);
        setGuidelines((prev) => prev.map((g) => (g.id === optimisticId ? real : g)));
      } catch (err) {
        setGuidelines((prev) => prev.filter((g) => g.id !== optimisticId));
        const message = err instanceof Error ? err.message : 'Failed to add guideline';
        setError(message);
        console.error('[useTov] addGuideline error:', message);
      }
    },
    [],
  );

  const updateGuideline = useCallback(
    async (id: string, updates: Partial<TovGuideline>) => {
      const previous = guidelines;
      setGuidelines((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));

      try {
        const supabase = createClient();
        const dbUpdates: Record<string, unknown> = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.content !== undefined) dbUpdates.content = updates.content;
        if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

        const { error: updateError } = await supabase
          .from('tov_guidelines')
          .update(dbUpdates)
          .eq('id', id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setGuidelines(previous);
        const message = err instanceof Error ? err.message : 'Failed to update guideline';
        setError(message);
        console.error('[useTov] updateGuideline error:', message);
      }
    },
    [guidelines],
  );

  const deleteGuideline = useCallback(
    async (id: string) => {
      const previous = guidelines;
      setGuidelines((prev) => prev.filter((g) => g.id !== id));

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('tov_guidelines')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
      } catch (err) {
        setGuidelines(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete guideline';
        setError(message);
        console.error('[useTov] deleteGuideline error:', message);
      }
    },
    [guidelines],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // WRITING STYLE
  // ═══════════════════════════════════════════════════════════════════════════

  const updateWritingStyleRule = useCallback(
    async (id: string, updates: Partial<WritingStyleRule>) => {
      const previous = writingStyle;
      setWritingStyle((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));

      try {
        const supabase = createClient();
        const dbUpdates: Record<string, unknown> = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.content !== undefined) dbUpdates.content = updates.content;

        const { error: updateError } = await supabase
          .from('tov_writing_style')
          .update(dbUpdates)
          .eq('id', id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setWritingStyle(previous);
        const message = err instanceof Error ? err.message : 'Failed to update writing style rule';
        setError(message);
        console.error('[useTov] updateWritingStyleRule error:', message);
      }
    },
    [writingStyle],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DOS
  // ═══════════════════════════════════════════════════════════════════════════

  const addDo = useCallback(
    async (item: TovDo) => {
      const optimisticId = `do-${Date.now()}`;
      const optimistic: TovDoWithId = { ...item, id: optimisticId };

      setDos((prev) => [...prev, optimistic]);

      try {
        const supabase = createClient();
        const { data: inserted, error: insertError } = await supabase
          .from('tov_dos')
          .insert({
            item: item.item,
            example: item.example,
            sort_order: dos.length + 1,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        const real = mapDbToDo(inserted as DbTovDo);
        setDos((prev) => prev.map((d) => (d.id === optimisticId ? real : d)));
      } catch (err) {
        setDos((prev) => prev.filter((d) => d.id !== optimisticId));
        const message = err instanceof Error ? err.message : 'Failed to add do';
        setError(message);
        console.error('[useTov] addDo error:', message);
      }
    },
    [dos.length],
  );

  const updateDo = useCallback(
    async (index: number, item: TovDo) => {
      const previous = dos;
      const target = dos[index];
      if (!target) return;

      setDos((prev) => prev.map((d, i) => (i === index ? { ...d, ...item } : d)));

      try {
        const supabase = createClient();
        const { error: updateError } = await supabase
          .from('tov_dos')
          .update({ item: item.item, example: item.example })
          .eq('id', target.id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setDos(previous);
        const message = err instanceof Error ? err.message : 'Failed to update do';
        setError(message);
        console.error('[useTov] updateDo error:', message);
      }
    },
    [dos],
  );

  const deleteDo = useCallback(
    async (index: number) => {
      const previous = dos;
      const target = dos[index];
      if (!target) return;

      setDos((prev) => prev.filter((_, i) => i !== index));

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('tov_dos')
          .delete()
          .eq('id', target.id);

        if (deleteError) throw new Error(deleteError.message);
      } catch (err) {
        setDos(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete do';
        setError(message);
        console.error('[useTov] deleteDo error:', message);
      }
    },
    [dos],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DONTS
  // ═══════════════════════════════════════════════════════════════════════════

  const addDont = useCallback(
    async (item: TovDont) => {
      const optimisticId = `dont-${Date.now()}`;
      const optimistic: TovDontWithId = { ...item, id: optimisticId };

      setDonts((prev) => [...prev, optimistic]);

      try {
        const supabase = createClient();
        const { data: inserted, error: insertError } = await supabase
          .from('tov_donts')
          .insert({
            phrase: item.phrase,
            fix: item.fix,
            sort_order: donts.length + 1,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        const real = mapDbToDont(inserted as DbTovDont);
        setDonts((prev) => prev.map((d) => (d.id === optimisticId ? real : d)));
      } catch (err) {
        setDonts((prev) => prev.filter((d) => d.id !== optimisticId));
        const message = err instanceof Error ? err.message : 'Failed to add dont';
        setError(message);
        console.error('[useTov] addDont error:', message);
      }
    },
    [donts.length],
  );

  const updateDont = useCallback(
    async (index: number, item: TovDont) => {
      const previous = donts;
      const target = donts[index];
      if (!target) return;

      setDonts((prev) => prev.map((d, i) => (i === index ? { ...d, ...item } : d)));

      try {
        const supabase = createClient();
        const { error: updateError } = await supabase
          .from('tov_donts')
          .update({ phrase: item.phrase, fix: item.fix })
          .eq('id', target.id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setDonts(previous);
        const message = err instanceof Error ? err.message : 'Failed to update dont';
        setError(message);
        console.error('[useTov] updateDont error:', message);
      }
    },
    [donts],
  );

  const deleteDont = useCallback(
    async (index: number) => {
      const previous = donts;
      const target = donts[index];
      if (!target) return;

      setDonts((prev) => prev.filter((_, i) => i !== index));

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('tov_donts')
          .delete()
          .eq('id', target.id);

        if (deleteError) throw new Error(deleteError.message);
      } catch (err) {
        setDonts(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete dont';
        setError(message);
        console.error('[useTov] deleteDont error:', message);
      }
    },
    [donts],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // EXAMPLES
  // ═══════════════════════════════════════════════════════════════════════════

  const addExample = useCallback(
    async (data: Omit<TovExample, 'id'>) => {
      const optimisticId = `ex-${Date.now()}`;
      const optimistic: TovExample = { ...data, id: optimisticId };

      setExamples((prev) => [...prev, optimistic]);

      try {
        const supabase = createClient();
        const { data: inserted, error: insertError } = await supabase
          .from('tov_examples')
          .insert({
            type: data.type,
            title: data.title ?? null,
            before_text: data.beforeText ?? null,
            after_text: data.afterText,
            tags: data.tags,
            sort_order: data.sortOrder,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        const real = mapDbToExample(inserted as DbTovExample);
        setExamples((prev) => prev.map((e) => (e.id === optimisticId ? real : e)));
      } catch (err) {
        setExamples((prev) => prev.filter((e) => e.id !== optimisticId));
        const message = err instanceof Error ? err.message : 'Failed to add example';
        setError(message);
        console.error('[useTov] addExample error:', message);
      }
    },
    [],
  );

  const updateExample = useCallback(
    async (id: string, updates: Partial<TovExample>) => {
      const previous = examples;
      setExamples((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));

      try {
        const supabase = createClient();
        const dbUpdates: Record<string, unknown> = {};
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.title !== undefined) dbUpdates.title = updates.title ?? null;
        if (updates.beforeText !== undefined) dbUpdates.before_text = updates.beforeText ?? null;
        if (updates.afterText !== undefined) dbUpdates.after_text = updates.afterText;
        if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
        if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

        const { error: updateError } = await supabase
          .from('tov_examples')
          .update(dbUpdates)
          .eq('id', id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setExamples(previous);
        const message = err instanceof Error ? err.message : 'Failed to update example';
        setError(message);
        console.error('[useTov] updateExample error:', message);
      }
    },
    [examples],
  );

  const deleteExample = useCallback(
    async (id: string) => {
      const previous = examples;
      setExamples((prev) => prev.filter((e) => e.id !== id));

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('tov_examples')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
      } catch (err) {
        setExamples(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete example';
        setError(message);
        console.error('[useTov] deleteExample error:', message);
      }
    },
    [examples],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE SPLIT
  // ═══════════════════════════════════════════════════════════════════════════

  const updateVoiceSplit = useCallback(
    async (account: string, updates: Partial<VoiceSplitAccount>) => {
      const previous = voiceSplit;
      setVoiceSplit((prev) =>
        prev.map((v) => (v.account === account ? { ...v, ...updates } : v)),
      );

      try {
        const supabase = createClient();
        const dbId = voiceSplitIds[account];
        if (!dbId) throw new Error(`No DB id for voice split account: ${account}`);

        const dbUpdates: Record<string, unknown> = {};
        if (updates.voiceName !== undefined) dbUpdates.voice_name = updates.voiceName;
        if (updates.characteristics !== undefined) dbUpdates.characteristics = updates.characteristics;
        if (updates.example !== undefined) dbUpdates.example = updates.example;

        const { error: updateError } = await supabase
          .from('tov_voice_split')
          .update(dbUpdates)
          .eq('id', dbId);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setVoiceSplit(previous);
        const message = err instanceof Error ? err.message : 'Failed to update voice split';
        setError(message);
        console.error('[useTov] updateVoiceSplit error:', message);
      }
    },
    [voiceSplit, voiceSplitIds],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE COMPARISON
  // ═══════════════════════════════════════════════════════════════════════════

  const updateVoiceComparison = useCallback(
    async (index: number, updates: Partial<VoiceComparison>) => {
      const previous = voiceComparison;
      setVoiceComparison((prev) =>
        prev.map((c, i) => (i === index ? { ...c, ...updates } : c)),
      );

      try {
        const supabase = createClient();
        const dbId = voiceComparisonIds[index];
        if (!dbId) throw new Error(`No DB id for voice comparison at index ${index}`);

        const dbUpdates: Record<string, unknown> = {};
        if (updates.aspect !== undefined) dbUpdates.aspect = updates.aspect;
        if (updates.outloud !== undefined) dbUpdates.outloud = updates.outloud;
        if (updates.ondrej !== undefined) dbUpdates.ondrej = updates.ondrej;

        const { error: updateError } = await supabase
          .from('tov_voice_comparison')
          .update(dbUpdates)
          .eq('id', dbId);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setVoiceComparison(previous);
        const message = err instanceof Error ? err.message : 'Failed to update voice comparison';
        setError(message);
        console.error('[useTov] updateVoiceComparison error:', message);
      }
    },
    [voiceComparison, voiceComparisonIds],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCKED PHRASES
  // ═══════════════════════════════════════════════════════════════════════════

  const addBlockedPhrase = useCallback(
    async (data: Omit<TovBlockedPhrase, 'id'>) => {
      const optimisticId = `bp-${Date.now()}`;
      const optimistic: TovBlockedPhrase = { ...data, id: optimisticId };

      setBlockedPhrases((prev) => [...prev, optimistic]);

      try {
        const supabase = createClient();
        const { data: inserted, error: insertError } = await supabase
          .from('tov_blocked_phrases')
          .insert({
            phrase: data.phrase,
            suggestion: data.suggestion,
            severity: data.severity,
            sort_order: blockedPhrases.length + 1,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        const real = mapDbToBlockedPhrase(inserted as DbBlockedPhrase);
        setBlockedPhrases((prev) => prev.map((p) => (p.id === optimisticId ? real : p)));
      } catch (err) {
        setBlockedPhrases((prev) => prev.filter((p) => p.id !== optimisticId));
        const message = err instanceof Error ? err.message : 'Failed to add blocked phrase';
        setError(message);
        console.error('[useTov] addBlockedPhrase error:', message);
      }
    },
    [blockedPhrases.length],
  );

  const updateBlockedPhrase = useCallback(
    async (id: string, updates: Partial<TovBlockedPhrase>) => {
      const previous = blockedPhrases;
      setBlockedPhrases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );

      try {
        const supabase = createClient();
        const dbUpdates: Record<string, unknown> = {};
        if (updates.phrase !== undefined) dbUpdates.phrase = updates.phrase;
        if (updates.suggestion !== undefined) dbUpdates.suggestion = updates.suggestion;
        if (updates.severity !== undefined) dbUpdates.severity = updates.severity;

        const { error: updateError } = await supabase
          .from('tov_blocked_phrases')
          .update(dbUpdates)
          .eq('id', id);

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        setBlockedPhrases(previous);
        const message = err instanceof Error ? err.message : 'Failed to update blocked phrase';
        setError(message);
        console.error('[useTov] updateBlockedPhrase error:', message);
      }
    },
    [blockedPhrases],
  );

  const deleteBlockedPhrase = useCallback(
    async (id: string) => {
      const previous = blockedPhrases;
      setBlockedPhrases((prev) => prev.filter((p) => p.id !== id));

      try {
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('tov_blocked_phrases')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
      } catch (err) {
        setBlockedPhrases(previous);
        const message = err instanceof Error ? err.message : 'Failed to delete blocked phrase';
        setError(message);
        console.error('[useTov] deleteBlockedPhrase error:', message);
      }
    },
    [blockedPhrases],
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // Data
    guidelines,
    writingStyle,
    dos: dos as TovDo[],
    donts: donts as TovDont[],
    examples,
    voiceSplit,
    voiceComparison,
    blockedPhrases,
    isLoading,
    error,

    // Guidelines
    addGuideline,
    updateGuideline,
    deleteGuideline,

    // Writing style
    updateWritingStyleRule,

    // Dos
    addDo,
    updateDo,
    deleteDo,

    // Donts
    addDont,
    updateDont,
    deleteDont,

    // Examples
    addExample,
    updateExample,
    deleteExample,

    // Voice split
    updateVoiceSplit,

    // Voice comparison
    updateVoiceComparison,

    // Blocked phrases
    addBlockedPhrase,
    updateBlockedPhrase,
    deleteBlockedPhrase,

    // Refetch
    refetch: fetchAll,
  };
}
