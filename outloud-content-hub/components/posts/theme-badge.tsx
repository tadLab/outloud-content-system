'use client';

import { useThemes } from '@/hooks/use-themes';

interface ThemeBadgeProps {
  themeId: string;
  size?: 'sm' | 'md';
}

export function ThemeBadge({ themeId, size = 'sm' }: ThemeBadgeProps) {
  const { themes } = useThemes();
  const theme = themes.find((t) => t.id === themeId);
  if (!theme) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        size === 'sm' ? 'text-[10px]' : 'text-[11px]'
      }`}
    >
      <span
        className={`rounded-full flex-shrink-0 ${size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
        style={{ backgroundColor: theme.color }}
      />
      <span className="text-[var(--text-secondary)] truncate">{theme.name}</span>
    </span>
  );
}
