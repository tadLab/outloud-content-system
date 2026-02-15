'use client';

import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { LayoutDashboard, BookOpen, Calendar, List, Target, Settings } from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'library', icon: BookOpen, label: 'Library' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'plan', icon: List, label: 'Content Plan' },
  { id: 'tov', icon: Target, label: 'Tone of Voice' },
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useAppStore();
  const { user, getUserByKey, userKey } = useUserContext();
  const displayUser = user ?? (userKey ? getUserByKey(userKey) : null);

  return (
    <div className="w-[var(--sidebar-width)] bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] flex flex-col items-center py-5 gap-2">
      {/* Logo */}
      <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-gradient-end)] flex items-center justify-center mb-6 text-lg font-bold text-white">
        O
      </div>

      {/* Nav items */}
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-11 h-11 rounded-[10px] flex items-center justify-center transition-all ${
            activeTab === item.id
              ? 'bg-[var(--bg-tertiary)] text-[var(--accent-color)]'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
          title={item.label}
        >
          <item.icon size={20} />
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <button
        onClick={() => setActiveTab('settings')}
        className={`w-11 h-11 rounded-[10px] flex items-center justify-center transition-all ${
          activeTab === 'settings'
            ? 'bg-[var(--bg-tertiary)] text-[var(--accent-color)]'
            : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        }`}
        title="Settings"
      >
        <Settings size={20} />
      </button>

      {/* User avatar */}
      <div className="mt-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
          style={{ backgroundColor: displayUser?.color ?? '#E85A2C' }}
        >
          {displayUser?.initial ?? 'T'}
        </div>
      </div>
    </div>
  );
}
