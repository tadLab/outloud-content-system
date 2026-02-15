'use client';

import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { useSettingsContext } from '@/providers/settings-provider';
import { SettingsTab } from '@/types';
import { ACCOUNTS } from '@/lib/constants';
import { AppearanceSettings } from './appearance-settings';
import { ThemeManager } from './theme-manager';
import { UserAvatar } from '@/components/posts/user-avatar';
import { Palette, Tag, Link2, Users, Bell } from 'lucide-react';

const SETTINGS_NAV: { id: SettingsTab; label: string; icon: typeof Palette }[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'themes', label: 'Themes', icon: Tag },
  { id: 'accounts', label: 'Accounts', icon: Link2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

function AccountsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Connected Accounts</h2>
        <p className="text-sm text-[var(--text-muted)]">Social media accounts managed through Content Hub.</p>
      </div>
      <div className="space-y-2">
        {ACCOUNTS.map((account) => (
          <div
            key={account}
            className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-gradient-end)] flex items-center justify-center text-white text-sm font-semibold">
              {account[0]}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--text-primary)]">{account}</div>
              <div className="text-[11px] text-[var(--text-muted)]">LinkedIn, X, Instagram</div>
            </div>
            <span className="text-[11px] text-[#34C759] bg-[#34C75910] px-2 py-0.5 rounded-full">
              Connected
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSection() {
  const { allProfiles } = useUserContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Team</h2>
        <p className="text-sm text-[var(--text-muted)]">Members with access to Content Hub.</p>
      </div>
      <div className="space-y-2">
        {allProfiles.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl"
          >
            <UserAvatar userId={profile.userKey} size={36} />
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--text-primary)]">{profile.fullName}</div>
              <div className="text-[11px] text-[var(--text-muted)]">{profile.roleLabel}</div>
            </div>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                color: profile.color,
                backgroundColor: `${profile.color}15`,
              }}
            >
              {profile.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsSection() {
  const { notifications, updateNotifications } = useSettingsContext();

  const emailOptions = [
    { key: 'emailReviewReady' as const, label: 'Post ready for my review' },
    { key: 'emailPostApproved' as const, label: 'My post was approved' },
    { key: 'emailPostReturned' as const, label: 'My post was returned for edits' },
    { key: 'emailNewComment' as const, label: 'New comment on my post' },
    { key: 'emailDailyDigest' as const, label: 'Daily digest of pending items' },
  ];

  const inAppOptions = [
    { key: 'showBadges' as const, label: 'Show notification badges' },
    { key: 'playSound' as const, label: 'Play sound on new notification' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Notifications</h2>
        <p className="text-sm text-[var(--text-muted)]">Configure how you want to be notified.</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Email Notifications</label>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden">
          {emailOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateNotifications({ [key]: !notifications[key] })}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${
                  notifications[key]
                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                    : 'border-[#4A4A4A] text-transparent'
                }`}
              >
                ✓
              </div>
              <span className="text-sm text-[var(--text-primary)]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* In-App */}
      <div>
        <label className="block text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wider">In-App Notifications</label>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden">
          {inAppOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateNotifications({ [key]: !notifications[key] })}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${
                  notifications[key]
                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                    : 'border-[#4A4A4A] text-transparent'
                }`}
              >
                ✓
              </div>
              <span className="text-sm text-[var(--text-primary)]">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsPageContent() {
  const { settingsTab, setSettingsTab } = useAppStore();

  return (
    <div className="flex-1 p-8 overflow-auto">
      <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Settings</h1>

      <div className="flex gap-8">
        {/* Sidebar */}
        <nav className="w-48 flex-shrink-0 space-y-1">
          {SETTINGS_NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSettingsTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                settingsTab === id
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {settingsTab === 'appearance' && <AppearanceSettings />}
          {settingsTab === 'themes' && <ThemeManager />}
          {settingsTab === 'accounts' && <AccountsSection />}
          {settingsTab === 'team' && <TeamSection />}
          {settingsTab === 'notifications' && <NotificationsSection />}
        </div>
      </div>
    </div>
  );
}
