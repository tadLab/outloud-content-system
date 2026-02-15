'use client';

import { useState, useRef, useEffect } from 'react';
import { useThemes } from '@/hooks/use-themes';
import { ChevronDown, Plus, Search } from 'lucide-react';

interface ThemeSelectorProps {
  value: string | undefined;
  onChange: (themeId: string | undefined) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const { themes, addTheme } = useThemes();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selectedTheme = themes.find((t) => t.id === value);
  const filteredThemes = themes.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const canCreate = search.trim().length > 0 && !themes.some(
    (t) => t.name.toLowerCase() === search.trim().toLowerCase()
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = async () => {
    const colors = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#06B6D4', '#EF4444', '#EC4899'];
    const color = colors[themes.length % colors.length];
    addTheme({ name: search.trim(), color, isDefault: false });
    // The hook updates themes optimistically — find the new theme after a tick
    setTimeout(() => {
      // themes array in the hook updates via state, so the component will re-render
      // Use the name match to select it
      setSearch('');
      setIsOpen(false);
    }, 100);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-left hover:border-[var(--border-hover)] transition-colors"
      >
        {selectedTheme ? (
          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedTheme.color }}
            />
            <span className="text-[var(--text-primary)]">{selectedTheme.name}</span>
          </span>
        ) : (
          <span className="text-[var(--text-disabled)]">Select theme...</span>
        )}
        <ChevronDown size={14} className="text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2 bg-[var(--bg-primary)] rounded-md px-2.5 py-2">
              <Search size={13} className="text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search or create..."
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-[200px] overflow-y-auto py-1">
            {/* None option */}
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
                setSearch('');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-[var(--bg-tertiary)] transition-colors ${
                !value ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full border border-[var(--text-disabled)]" />
              <span>None</span>
            </button>

            {filteredThemes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  onChange(theme.id);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-[var(--bg-tertiary)] transition-colors ${
                  value === theme.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: theme.color }}
                />
                <span>{theme.name}</span>
              </button>
            ))}

            {/* Create new */}
            {canCreate && (
              <button
                type="button"
                onClick={handleCreate}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left text-[var(--accent-color)] hover:bg-[var(--bg-tertiary)] transition-colors border-t border-[var(--border-default)]"
              >
                <Plus size={14} />
                <span>Create &quot;{search.trim()}&quot;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
