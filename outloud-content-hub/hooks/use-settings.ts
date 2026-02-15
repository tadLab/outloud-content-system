'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppearanceSettings, NotificationSettings } from '@/types';

// ── DB row shape (snake_case) ─────────────────────────────────────────────────

interface DbUserSettings {
  id: string;
  user_id: string;
  appearance: AppearanceSettings | null;
  notifications: NotificationSettings | null;
  updated_at: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'dark',
  accentColor: '#E85A2C',
  compactMode: false,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailReviewReady: true,
  emailPostApproved: true,
  emailPostReturned: true,
  emailNewComment: false,
  emailDailyDigest: false,
  showBadges: true,
  playSound: true,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSettings(userId?: string) {
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [settingsRowId, setSettingsRowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw new Error(fetchError.message);

      if (data) {
        const row = data as DbUserSettings;
        setSettingsRowId(row.id);
        setAppearance(row.appearance ?? DEFAULT_APPEARANCE);
        setNotifications(row.notifications ?? DEFAULT_NOTIFICATIONS);
      } else {
        // No settings row exists yet -- create one with defaults
        const { data: inserted, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            appearance: DEFAULT_APPEARANCE,
            notifications: DEFAULT_NOTIFICATIONS,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);

        const row = inserted as DbUserSettings;
        setSettingsRowId(row.id);
        setAppearance(row.appearance ?? DEFAULT_APPEARANCE);
        setNotifications(row.notifications ?? DEFAULT_NOTIFICATIONS);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch settings';
      setError(message);
      console.error('[useSettings] fetch error:', message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const updateAppearance = useCallback(
    async (updates: Partial<AppearanceSettings>) => {
      if (!userId) return;

      const previous = appearance;
      const merged = { ...appearance, ...updates };
      setAppearance(merged);

      try {
        const supabase = createClient();

        if (settingsRowId) {
          const { error: updateError } = await supabase
            .from('user_settings')
            .update({ appearance: merged, updated_at: new Date().toISOString() })
            .eq('id', settingsRowId);

          if (updateError) throw new Error(updateError.message);
        } else {
          // Row should exist after fetch, but handle edge case
          const { data: inserted, error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: userId,
              appearance: merged,
              notifications,
            })
            .select()
            .single();

          if (insertError) throw new Error(insertError.message);
          setSettingsRowId((inserted as DbUserSettings).id);
        }
      } catch (err) {
        setAppearance(previous);
        const message = err instanceof Error ? err.message : 'Failed to update appearance';
        setError(message);
        console.error('[useSettings] updateAppearance error:', message);
      }
    },
    [userId, appearance, notifications, settingsRowId],
  );

  const updateNotifications = useCallback(
    async (updates: Partial<NotificationSettings>) => {
      if (!userId) return;

      const previous = notifications;
      const merged = { ...notifications, ...updates };
      setNotifications(merged);

      try {
        const supabase = createClient();

        if (settingsRowId) {
          const { error: updateError } = await supabase
            .from('user_settings')
            .update({ notifications: merged, updated_at: new Date().toISOString() })
            .eq('id', settingsRowId);

          if (updateError) throw new Error(updateError.message);
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: userId,
              appearance,
              notifications: merged,
            })
            .select()
            .single();

          if (insertError) throw new Error(insertError.message);
          setSettingsRowId((inserted as DbUserSettings).id);
        }
      } catch (err) {
        setNotifications(previous);
        const message = err instanceof Error ? err.message : 'Failed to update notifications';
        setError(message);
        console.error('[useSettings] updateNotifications error:', message);
      }
    },
    [userId, appearance, notifications, settingsRowId],
  );

  return {
    appearance,
    notifications,
    isLoading,
    error,
    updateAppearance,
    updateNotifications,
    refetch: fetchSettings,
  };
}
