'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import { PlatformBadge } from './platform-badge';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

export function DesignReviewQueue() {
  const { setSelectedPostId, openDenialModal, filters } = useAppStore();
  const { user, getUserByKey } = useUserContext();
  const { posts, approveCreative } = usePosts(user?.id);

  const designPosts = useMemo(() => {
    return posts.filter((post) => {
      if (post.status !== 'design_review') return false;
      if (filters.platforms.length > 0 && !filters.platforms.includes(post.platform)) return false;
      if (filters.account && post.account !== filters.account) return false;
      if (filters.theme && post.themeId !== filters.theme) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !post.title.toLowerCase().includes(q) &&
          !(post.content?.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [posts, filters]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
        Design Review Queue
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-8">
        {designPosts.length} posts waiting for creative approval
      </p>

      <div className="flex flex-col gap-4">
        {designPosts.map((post) => (
          <div
            key={post.id}
            className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border-default)]"
          >
            <div className="flex gap-5">
              {/* Image preview */}
              <div className="w-[120px] h-[120px] bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center shrink-0">
                <span className="text-[32px]">🖼️</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <PlatformBadge platform={post.platform} />
                  <span className="text-xs text-[var(--text-secondary)]">{post.account}</span>
                </div>
                <h3 className="text-base font-medium text-[var(--text-primary)] mb-2 truncate">
                  {post.title}
                </h3>
                <div className="text-xs text-[var(--text-secondary)] mb-2">
                  Requested by {getUserByKey(post.author)?.name}
                </div>
                {post.revisionCount > 0 && (
                  <div className="text-[11px] text-[#FFB800]">
                    Revision #{post.revisionCount}
                  </div>
                )}
                {post.creativeDenied && post.creativeDenialReason && (
                  <div className="mt-2 bg-[#FF3B3010] border border-[#FF3B3020] rounded-md px-2.5 py-1.5">
                    <div className="text-[10px] text-[#FF3B30]">Previous feedback:</div>
                    <div className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{post.creativeDenialReason}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => setSelectedPostId(post.id)}
                  className="flex items-center gap-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-5 py-2.5 text-[var(--text-primary)] text-[13px] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <Eye size={14} />
                  View Post
                </button>
                <button
                  onClick={() => approveCreative(post.id)}
                  className="flex items-center gap-2 bg-[#34C75920] border border-[#34C75940] rounded-lg px-5 py-2.5 text-[#34C759] text-[13px] font-medium hover:bg-[#34C75930] transition-colors"
                >
                  <CheckCircle size={14} />
                  Approve
                </button>
                <button
                  onClick={() => openDenialModal(post.id, 'creative')}
                  className="flex items-center gap-2 bg-[#FF3B3020] border border-[#FF3B3040] rounded-lg px-5 py-2.5 text-[#FF3B30] text-[13px] font-medium hover:bg-[#FF3B3030] transition-colors"
                >
                  <XCircle size={14} />
                  Request Changes
                </button>
              </div>
            </div>
          </div>
        ))}

        {designPosts.length === 0 && (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <div className="text-4xl mb-3">✨</div>
            <div className="text-sm">No posts waiting for design review</div>
          </div>
        )}
      </div>
    </div>
  );
}
