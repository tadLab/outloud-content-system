'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import { PlatformBadge } from './platform-badge';
import { StatusPill } from './status-pill';
import { getAiScoreStatus, getTovScoreStatus } from '@/lib/utils';
import { CheckCircle, CornerDownLeft, Pencil } from 'lucide-react';

export function FinalReviewQueue() {
  const { setSelectedPostId, openDenialModal, filters } = useAppStore();
  const { user } = useUserContext();
  const { posts, approveFinal } = usePosts(user?.id);

  const finalPosts = useMemo(() => {
    return posts.filter((post) => {
      if (post.status !== 'final_review') return false;
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
        Final Review
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-8">
        {finalPosts.length} post{finalPosts.length !== 1 ? 's' : ''} ready for final approval
      </p>

      <div className="flex flex-col gap-4">
        {finalPosts.map((post) => {
          const aiStatus = getAiScoreStatus(post.aiScore);
          const tovStatus = getTovScoreStatus(post.tovScore);

          return (
            <div
              key={post.id}
              className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-default)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <PlatformBadge platform={post.platform} />
                <span className="text-[13px] text-[var(--text-secondary)]">{post.account}</span>
                {post.revisionCount > 0 && (
                  <span className="text-[11px] text-[#FFB800] ml-2">
                    Revision #{post.revisionCount}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                {post.title}
              </h3>

              {/* Preview */}
              {post.content && (
                <div className="bg-[var(--bg-primary)] rounded-lg p-4 mb-4 border border-[var(--border-subtle)]">
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed m-0 line-clamp-3">
                    {post.content}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-4 mb-5">
                <StatusPill icon={aiStatus.icon} label={`AI ${post.aiScore}%`} color={aiStatus.color} />
                <StatusPill icon={tovStatus.icon} label={`ToV ${post.tovScore}%`} color={tovStatus.color} />
                {post.creativeApproved && (
                  <StatusPill icon="✓" label="Creative approved" color="#34C759" />
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPostId(post.id)}
                  className="flex items-center gap-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-5 py-3 text-[var(--text-primary)] text-[13px] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={() => approveFinal(post.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-[#34C759] to-[#28A745] rounded-lg px-5 py-3 text-white text-[13px] font-semibold hover:scale-[1.01] transition-transform"
                >
                  <CheckCircle size={14} />
                  Approve
                </button>
                <button
                  onClick={() => openDenialModal(post.id, 'final')}
                  className="flex items-center gap-2 bg-[#FF3B3020] border border-[#FF3B3040] rounded-lg px-5 py-3 text-[#FF3B30] text-[13px] hover:bg-[#FF3B3030] transition-colors"
                >
                  <CornerDownLeft size={14} />
                  Return for Edits
                </button>
              </div>
            </div>
          );
        })}

        {finalPosts.length === 0 && (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <div className="text-4xl mb-3">✨</div>
            <div className="text-sm">No posts waiting for final review</div>
          </div>
        )}
      </div>
    </div>
  );
}
