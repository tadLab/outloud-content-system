'use client';

import { Post } from '@/types';
import { PlatformBadge } from './platform-badge';
import { StatusPill } from './status-pill';
import { UserAvatar } from './user-avatar';
import { AccountAvatar } from '@/components/ui/account-avatar';
import { getAiScoreStatus, getTovScoreStatus } from '@/lib/utils';
import { useUserContext } from '@/providers/user-provider';
import { useAppStore } from '@/stores/app-store';
import { usePosts } from '@/hooks/use-posts';
import { ThemeBadge } from './theme-badge';
import { MessageSquare, RotateCcw, Calendar, AlertTriangle, ExternalLink, Paperclip } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  const { openScheduleModal, openMarkPostedModal } = useAppStore();
  const { user, getUserByKey } = useUserContext();
  const { moveToDraft } = usePosts(user?.id);
  const aiStatus = getAiScoreStatus(post.aiScore);
  const tovStatus = getTovScoreStatus(post.tovScore);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const denialReason = post.creativeDenialReason || post.finalDenialReason;
  const deniedBy = post.creativeDeniedBy || post.finalDeniedBy;
  const isDenied = post.creativeDenied || post.finalDenied;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(post)}
      className={`bg-[var(--bg-secondary)] rounded-xl p-4 mb-3 cursor-pointer border hover:-translate-y-0.5 transition-all ${
        post.status === 'missed'
          ? 'border-[#EF444440] hover:border-[#EF444470]'
          : 'border-transparent hover:border-[var(--accent-color)]/25'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <PlatformBadge platform={post.platform} />
        <AccountAvatar account={post.account} size={18} />
        <span className="text-xs text-[var(--text-secondary)]">{post.account}</span>
        {post.themeId && (
          <span className="ml-auto">
            <ThemeBadge themeId={post.themeId} size="sm" />
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3 line-clamp-2 leading-snug">
        {post.title}
      </h4>

      {/* Status indicators */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <StatusPill icon={aiStatus.icon} label={`AI ${post.aiScore}%`} color={aiStatus.color} />
        <StatusPill icon={tovStatus.icon} label={`ToV ${post.tovScore}%`} color={tovStatus.color} />
      </div>

      {/* Approval badge */}
      {post.creativeApproved && post.creativeApprovedBy && (
        <div className="bg-[#34C75910] border border-[#34C75920] rounded-lg px-3 py-2 mb-2">
          <div className="text-[11px] text-[#34C759] font-medium">✓ Creative approved</div>
          <div className="text-[10px] text-[var(--text-muted)]">
            by {getUserByKey(post.creativeApprovedBy)?.name}{post.creativeApprovedAt && ` · ${post.creativeApprovedAt}`}
          </div>
        </div>
      )}

      {/* Final approval badge (for approved column) */}
      {post.finalApproved && post.finalApprovedBy && post.status === 'approved' && (
        <div className="bg-[#22C55E10] border border-[#22C55E20] rounded-lg px-3 py-2 mb-2">
          <div className="text-[11px] text-[#22C55E] font-medium">
            ✓ Approved by {getUserByKey(post.finalApprovedBy)?.name}
          </div>
          {post.finalApprovedAt && (
            <div className="text-[10px] text-[var(--text-muted)]">{post.finalApprovedAt}</div>
          )}
        </div>
      )}

      {/* Schedule button (for approved column) */}
      {post.status === 'approved' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openScheduleModal(post.id);
          }}
          className="w-full bg-[#22C55E20] border border-[#22C55E40] rounded-lg px-3 py-2.5 text-[#22C55E] text-[12px] font-medium hover:bg-[#22C55E30] transition-colors mb-2 flex items-center justify-center gap-1.5"
        >
          <Calendar size={13} />
          Schedule Post
        </button>
      )}

      {/* Missed badge */}
      {post.status === 'missed' && (
        <div className="bg-[#EF444410] border border-[#EF444420] rounded-lg px-3 py-2 mb-2">
          <div className="text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
            <AlertTriangle size={11} />
            MISSED
          </div>
          {post.scheduledDate && (
            <div className="text-[10px] text-[var(--text-muted)]">
              Was scheduled: {post.scheduledDate}, {post.scheduledTime}
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={(e) => { e.stopPropagation(); openScheduleModal(post.id); }}
              className="text-[10px] text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
            >
              Reschedule
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); openMarkPostedModal(post.id); }}
              className="text-[10px] text-[#22C55E] hover:text-[#4ADE80] transition-colors"
            >
              Mark as Posted
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); moveToDraft(post.id); }}
              className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Move to Draft
            </button>
          </div>
        </div>
      )}

      {/* Posted badge */}
      {post.status === 'posted' && (
        <div className="bg-[#22C55E10] border border-[#22C55E20] rounded-lg px-3 py-2 mb-2">
          <div className="text-[11px] text-[#22C55E] font-medium">POSTED</div>
          {post.postedAt && (
            <div className="text-[10px] text-[var(--text-muted)]">{post.postedAt}</div>
          )}
          {post.postUrl && (
            <a
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-[#3B82F6] hover:text-[#60A5FA] mt-1 transition-colors"
            >
              <ExternalLink size={9} />
              View post
            </a>
          )}
        </div>
      )}

      {/* Denial badge */}
      {isDenied && denialReason && (
        <div className="bg-[#FF3B3010] border border-[#FF3B3020] rounded-lg px-3 py-2 mb-2">
          <div className="text-[11px] text-[#FF3B30] font-medium flex items-center gap-1">
            ↩ Returned{deniedBy && ` by ${getUserByKey(deniedBy)?.name}`}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] line-clamp-1">
            &quot;{denialReason}&quot;
          </div>
        </div>
      )}

      {/* Revision count */}
      {post.revisionCount > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-[#FFB800] mb-2">
          <RotateCcw size={10} />
          <span>Revision #{post.revisionCount}</span>
        </div>
      )}

      {/* Waiting indicator */}
      {post.waitingFor && !isDenied && (
        <div
          className="flex items-center gap-1.5 text-[11px] mb-2"
          style={{
            color: post.waitingFor === 'Ondrej' ? '#8B5CF6' : '#FFB800',
          }}
        >
          <span>{post.waitingFor === 'Ondrej' ? '👤' : '🖼️'}</span>
          <span>Waiting for {post.waitingFor}</span>
        </div>
      )}

      {/* Scheduled date */}
      {post.scheduledDate && (
        <div className="flex items-center gap-1.5 text-xs text-[#34C759] mb-2">
          <span>📅</span>
          <span>{post.scheduledDate}, {post.scheduledTime}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-1.5">
          <UserAvatar userId={post.author} size={20} />
          <span className="text-[11px] text-[var(--text-secondary)]">{getUserByKey(post.author)?.name}</span>
        </div>
        <div className="flex items-center gap-2.5">
          {post.mediaFiles && post.mediaFiles.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <Paperclip size={11} />
              <span>{post.mediaFiles.length}</span>
            </div>
          )}
          {post.comments.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <MessageSquare size={12} />
              <span>{post.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
