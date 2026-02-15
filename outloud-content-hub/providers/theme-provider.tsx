'use client';

import { useEffect } from 'react';
import { useSettingsContext } from '@/providers/settings-provider';

function hexToHoverHex(hex: string): string {
  // Lighten the accent color slightly for gradient end
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const darken = (v: number) => Math.max(0, Math.round(v * 0.78));
  return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { appearance } = useSettingsContext();

  // Apply theme mode
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (mode: 'light' | 'dark') => {
      root.setAttribute('data-theme', mode);
    };

    if (appearance.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      applyTheme(appearance.theme);
    }
  }, [appearance.theme]);

  // Apply accent color
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', appearance.accentColor);
    root.style.setProperty('--accent-gradient-end', hexToHoverHex(appearance.accentColor));
  }, [appearance.accentColor]);

  // Apply compact mode
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-compact', appearance.compactMode ? 'true' : 'false');
  }, [appearance.compactMode]);

  return <>{children}</>;
}
