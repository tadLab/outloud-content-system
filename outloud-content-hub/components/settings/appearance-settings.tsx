'use client';

import { useSettingsContext } from '@/providers/settings-provider';
import { DEFAULT_THEME_COLORS } from '@/lib/constants';
import { Sun, Moon, Monitor } from 'lucide-react';

export function AppearanceSettings() {
  const { appearance, updateAppearance } = useSettingsContext();

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Appearance</h2>
        <p className="text-sm text-[var(--text-muted)]">Customize the look and feel of your workspace.</p>
      </div>

      {/* Theme Toggle */}
      <div>
        <label className="block text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Theme</label>
        <div className="flex gap-2">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => updateAppearance({ theme: value })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors text-sm ${
                appearance.theme === value
                  ? 'border-[var(--accent-color)] bg-[#E85A2C10] text-[var(--text-primary)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <label className="block text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Accent Color</label>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {DEFAULT_THEME_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => updateAppearance({ accentColor: color })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  appearance.accentColor === color
                    ? 'border-white scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 ml-3">
            <span className="text-xs text-[var(--text-muted)]">Custom:</span>
            <input
              type="text"
              value={appearance.accentColor}
              onChange={(e) => updateAppearance({ accentColor: e.target.value })}
              className="w-24 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-md px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-hover)]"
            />
          </div>
        </div>
      </div>

      {/* Compact Mode */}
      <div>
        <label className="block text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Display</label>
        <button
          onClick={() => updateAppearance({ compactMode: !appearance.compactMode })}
          className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] transition-colors w-full text-left"
        >
          <div
            className={`w-10 h-5 rounded-full relative transition-colors ${
              appearance.compactMode ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-hover)]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                appearance.compactMode ? 'left-5' : 'left-0.5'
              }`}
            />
          </div>
          <div>
            <div className="text-sm text-[var(--text-primary)]">Compact Mode</div>
            <div className="text-[11px] text-[var(--text-muted)]">Show smaller cards in Kanban board</div>
          </div>
        </button>
      </div>
    </div>
  );
}
