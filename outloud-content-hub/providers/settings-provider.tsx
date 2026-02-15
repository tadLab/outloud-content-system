'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserContext } from '@/providers/user-provider';
import { useSettings } from '@/hooks/use-settings';
import { AppearanceSettings, NotificationSettings } from '@/types';

// ── Context value type ──────────────────────────────────────────────────────

interface SettingsContextValue {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  updateAppearance: (updates: Partial<AppearanceSettings>) => Promise<void>;
  updateNotifications: (updates: Partial<NotificationSettings>) => Promise<void>;
  refetch: () => Promise<void>;
}

// ── Context ─────────────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextValue | null>(null);

// ── Provider component ──────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useUserContext();
  const settings = useSettings(user?.id);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

// ── Consumer hook ───────────────────────────────────────────────────────────

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettingsContext must be used within a <SettingsProvider>');
  }
  return ctx;
}
