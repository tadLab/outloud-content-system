'use client';

import { useState, useMemo } from 'react';
import { LibraryTab } from '@/types';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import { PlatformBadge } from '@/components/posts/platform-badge';
import { ThemeBadge } from '@/components/posts/theme-badge';
import { STATUS_DISPLAY } from '@/lib/constants';
import { ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface LibraryTableProps {
  tab: LibraryTab;
}

type SortField = 'title' | 'date' | 'status' | 'platform';
type SortDirection = 'asc' | 'desc';

export function LibraryTable({ tab }: LibraryTableProps) {
  const { setSelectedPostId, selectedPostId, filters } = useAppStore();
  const { user } = useUserContext();
  const { posts: allPosts } = usePosts(user?.id);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Apply filters locally, then filter by tab
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      if (filters.platforms.length > 0 && !filters.platforms.includes(post.platform)) return false;
      if (filters.account && post.account !== filters.account) return false;
      if (filters.theme && post.themeId !== filters.theme) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!post.title.toLowerCase().includes(q) && !(post.content || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allPosts, filters]);

  let posts = filteredPosts;

  if (tab === 'drafts') {
    posts = posts.filter(p => p.status === 'draft' || p.status === 'design_review' || p.status === 'final_review' || p.status === 'approved');
  } else if (tab === 'scheduled') {
    posts = posts.filter(p => p.status === 'scheduled' || p.status === 'missed');
  } else if (tab === 'posted') {
    posts = posts.filter(p => p.status === 'posted');
  }

  // Sort
  const sorted = [...posts].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'title':
        return dir * a.title.localeCompare(b.title);
      case 'date':
        return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'status':
        return dir * a.status.localeCompare(b.status);
      case 'platform':
        return dir * a.platform.localeCompare(b.platform);
      default:
        return 0;
    }
  });

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-[var(--text-disabled)]" />;
    return sortDirection === 'asc'
      ? <ArrowUp size={12} className="text-[var(--accent-color)]" />
      : <ArrowDown size={12} className="text-[var(--accent-color)]" />;
  };

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-3xl mb-3">
          {tab === 'drafts' ? '✏️' : tab === 'scheduled' ? '📅' : tab === 'posted' ? '✅' : '📚'}
        </div>
        <p className="text-[15px] text-[var(--text-secondary)] mb-1">No posts found</p>
        <p className="text-[13px] text-[var(--text-muted)]">
          {tab === 'all' ? 'Create your first post to get started' : `No ${tab} posts yet`}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Table */}
      <div className="border border-[var(--border-default)] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_80px_1fr_120px_120px_100px_100px_32px] bg-[#0F0F0F] border-b border-[var(--border-default)] px-4 py-3">
          <div />
          <button onClick={() => handleSort('platform')} className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--text-secondary)]">
            Platform <SortIcon field="platform" />
          </button>
          <button onClick={() => handleSort('title')} className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--text-secondary)]">
            Title <SortIcon field="title" />
          </button>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Account</div>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Theme</div>
          <button onClick={() => handleSort('status')} className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--text-secondary)]">
            Status <SortIcon field="status" />
          </button>
          <button onClick={() => handleSort('date')} className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--text-secondary)]">
            Date <SortIcon field="date" />
          </button>
          <div />
        </div>

        {/* Rows */}
        {paginated.map((post) => {
          const statusDisplay = STATUS_DISPLAY[post.status];
          const dateStr = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div
              key={post.id}
              onClick={() => setSelectedPostId(post.id)}
              className={`grid grid-cols-[40px_80px_1fr_120px_120px_100px_100px_32px] px-4 py-3 border-b border-[var(--border-subtle)] cursor-pointer transition-colors ${
                selectedPostId === post.id
                  ? 'bg-[var(--bg-tertiary)]'
                  : 'hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {/* Checkbox placeholder */}
              <div className="flex items-center">
                <div className="w-4 h-4 rounded border border-[var(--border-default)] bg-[var(--bg-secondary)]" />
              </div>

              {/* Platform */}
              <div className="flex items-center">
                <PlatformBadge platform={post.platform} />
              </div>

              {/* Title */}
              <div className="flex items-center">
                <span className="text-[13px] text-[var(--text-primary)] truncate">{post.title}</span>
              </div>

              {/* Account */}
              <div className="flex items-center">
                <span className="text-[12px] text-[var(--text-secondary)]">{post.account}</span>
              </div>

              {/* Theme */}
              <div className="flex items-center">
                {post.themeId ? <ThemeBadge themeId={post.themeId} size="sm" /> : <span className="text-[12px] text-[var(--text-disabled)]">—</span>}
              </div>

              {/* Status */}
              <div className="flex items-center">
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ color: statusDisplay.color, backgroundColor: statusDisplay.bg }}
                >
                  {statusDisplay.label}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center">
                <span className="text-[12px] text-[var(--text-muted)]">{dateStr}</span>
              </div>

              {/* Chevron */}
              <div className="flex items-center justify-center">
                <ChevronRight size={14} className="text-[var(--text-disabled)]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-[12px] text-[var(--text-muted)]">
            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-[12px] rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-[12px] text-[var(--text-muted)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-[12px] rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
