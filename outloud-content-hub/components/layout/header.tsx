'use client';

import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { useThemes } from '@/hooks/use-themes';
import { PLATFORM_OPTIONS, PLATFORM_CONFIG, ACCOUNTS } from '@/lib/constants';
import { Search, Plus, X } from 'lucide-react';
import { Platform } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';

export function Header() {
  const {
    setCreatePostOpen,
    filters,
    setFilterPlatforms,
    setFilterAccount,
    setFilterSearch,
    setFilterTheme,
    clearFilters,
    activeTab,
  } = useAppStore();

  const { user } = useUserContext();
  const { themes } = useThemes();

  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterSearch(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, setFilterSearch]);

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlatform = useCallback((platform: Platform) => {
    const current = filters.platforms;
    if (current.includes(platform)) {
      setFilterPlatforms(current.filter((p) => p !== platform));
    } else {
      setFilterPlatforms([...current, platform]);
    }
  }, [filters.platforms, setFilterPlatforms]);

  const activeFilterCount =
    filters.platforms.length + (filters.account ? 1 : 0) + (filters.search ? 1 : 0) + (filters.theme ? 1 : 0);

  return (
    <div>
      {/* Main header */}
      <div className="h-16 px-8 flex items-center justify-between border-b border-[var(--border-subtle)]">
        {/* Left */}
        <div className="flex items-center gap-5">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Content Hub
          </h1>

          {/* Platform toggles */}
          <div className="flex gap-1">
            {PLATFORM_OPTIONS.map((opt) => {
              const isActive = filters.platforms.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => togglePlatform(opt.value)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] bg-transparent'
                  }`}
                  style={isActive ? { background: PLATFORM_CONFIG[opt.value]?.bg } : undefined}
                >
                  {PLATFORM_CONFIG[opt.value]?.label}
                </button>
              );
            })}
          </div>

          {/* Account filter */}
          <select
            value={filters.account || ''}
            onChange={(e) => setFilterAccount(e.target.value || null)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-[13px] cursor-pointer outline-none"
          >
            <option value="">All Accounts</option>
            {ACCOUNTS.map((acc) => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>

          {/* Theme filter */}
          <select
            value={filters.theme || ''}
            onChange={(e) => setFilterTheme(e.target.value || null)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-[13px] cursor-pointer outline-none"
          >
            <option value="">All Themes</option>
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>{theme.name}</option>
            ))}
          </select>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-1.5">
              {filters.platforms.map((p) => (
                <span
                  key={p}
                  className="flex items-center gap-1 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-full px-2.5 py-1 text-[11px] text-[var(--text-primary)]"
                >
                  {PLATFORM_OPTIONS.find((o) => o.value === p)?.label}
                  <X
                    size={10}
                    className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    onClick={() => togglePlatform(p)}
                  />
                </span>
              ))}
              {filters.account && (
                <span className="flex items-center gap-1 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-full px-2.5 py-1 text-[11px] text-[var(--text-primary)]">
                  {filters.account}
                  <X
                    size={10}
                    className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    onClick={() => setFilterAccount(null)}
                  />
                </span>
              )}
              {filters.theme && (
                <span className="flex items-center gap-1 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-full px-2.5 py-1 text-[11px] text-[var(--text-primary)]">
                  {themes.find((t) => t.id === filters.theme)?.name}
                  <X
                    size={10}
                    className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    onClick={() => setFilterTheme(null)}
                  />
                </span>
              )}
              <button
                onClick={() => {
                  clearFilters();
                  setSearchValue('');
                }}
                className="text-[var(--accent-color)] text-[11px] hover:underline ml-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-3 py-2">
            <Search size={14} className="text-[var(--text-muted)]" />
            <input
              ref={searchRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search posts..."
              className="bg-transparent border-none text-[var(--text-primary)] text-[13px] w-40 outline-none placeholder:text-[var(--text-disabled)]"
            />
            {!searchFocused && !searchValue && (
              <span className="text-[var(--text-disabled)] text-[11px]">&#8984;K</span>
            )}
            {searchValue && (
              <X
                size={12}
                className="text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)]"
                onClick={() => setSearchValue('')}
              />
            )}
          </div>

          {/* New post button — visible on dashboard, calendar, and library */}
          {(activeTab === 'dashboard' || activeTab === 'calendar' || activeTab === 'library') && (
            <button
              onClick={() => setCreatePostOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-gradient-end)] rounded-lg px-4 py-2.5 text-white text-[13px] font-semibold hover:scale-[1.02] transition-transform"
            >
              <Plus size={16} />
              New Post
            </button>
          )}
        </div>
      </div>

      {/* Current user display — only on Dashboard */}
      {activeTab === 'dashboard' && user && (
        <div className="flex gap-2 px-8 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
          <span className="text-xs text-[var(--text-muted)] mr-2 self-center">Logged in as:</span>
          <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)]">
            <div
              className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-semibold text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.initial}
            </div>
            {user.fullName}
            <span className="text-[10px] text-[var(--text-disabled)] ml-1">{user.roleLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
