'use client';

import { useState } from 'react';
import { LibraryTab } from '@/types';
import { LibraryStatsBar } from './library-stats-bar';
import { LibraryTable } from './library-table';

const TABS: { id: LibraryTab; label: string }[] = [
  { id: 'all', label: 'All Posts' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'posted', label: 'Posted' },
];

export function LibraryPage() {
  const [activeLibraryTab, setActiveLibraryTab] = useState<LibraryTab>('all');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Content Library</h2>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <LibraryStatsBar />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border-default)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLibraryTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
              activeLibraryTab === tab.id
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.label}
            {activeLibraryTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-color)]" />
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <LibraryTable tab={activeLibraryTab} />
    </div>
  );
}
