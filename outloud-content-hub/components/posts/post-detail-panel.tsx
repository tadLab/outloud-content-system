'use client';

import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import { PlatformBadge } from './platform-badge';
import { UserAvatar } from './user-avatar';
import { AccountAvatar } from '@/components/ui/account-avatar';
import { ThemeSelector } from './theme-selector';
import { SubmitButton } from './submit-button';
import { getAiScoreStatus, getTovScoreStatus } from '@/lib/utils';
import { PLATFORM_CHAR_LIMITS } from '@/lib/constants';
import { UserId } from '@/types';
import { CreativeUpload } from './creative-upload';
import { ArrowLeft, RefreshCw, Copy, Save, AlertTriangle, ExternalLink, Calendar } from 'lucide-react';
import { useState } from 'react';

export function PostDetailPanel() {
  const { selectedPostId, setSelectedPostId, openScheduleModal, openMarkPostedModal } = useAppStore();
  const { user, userKey, getUserByKey } = useUserContext();
  const { posts, addComment, updatePost, duplicatePost, moveToDraft } = usePosts(user?.id);
  const post = posts.find((p) => p.id === selectedPostId);
  const [commentText, setCommentText] = useState('');
  const [contentValue, setContentValue] = useState('');
  const [contentDirty, setContentDirty] = useState(false);

  if (!post) return null;

  const aiStatus = getAiScoreStatus(post.aiScore);
  const tovStatus = getTovScoreStatus(post.tovScore);
  // Activity log will come from Supabase later; use empty array for now
  const activity: { id: string; createdAt: string; userId?: string; action: string }[] = [];

  const charLimit = PLATFORM_CHAR_LIMITS[post.platform];
  const currentContent = contentDirty ? contentValue : (post.content || '');
  const charCount = currentContent.length;
  const isOverLimit = charCount > charLimit;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleSaveDraft = () => {
    if (contentDirty) {
      updatePost(post.id, { content: contentValue });
      setContentDirty(false);
    }
  };

  const handleDuplicate = () => {
    duplicatePost(post.id);
    setSelectedPostId(null);
  };

  const handleContentChange = (value: string) => {
    setContentValue(value);
    setContentDirty(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[99]"
        onClick={() => setSelectedPostId(null)}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 w-[55%] max-w-[720px] h-screen bg-[#0F0F0F] border-l border-[var(--border-subtle)] shadow-[-20px_0_60px_rgba(0,0,0,0.5)] z-[100] flex flex-col animate-slide-in">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <button
            onClick={() => setSelectedPostId(null)}
            className="flex items-center gap-2 bg-transparent text-[var(--text-secondary)] text-[13px] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[var(--text-secondary)] text-[13px] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              title="Duplicate post"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2 text-[var(--text-primary)] text-[13px] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <Save size={13} />
              Save Draft
            </button>
            {post.status === 'draft' && (
              <SubmitButton post={post} />
            )}
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Title */}
          <h2 className="text-[22px] font-semibold text-[var(--text-primary)] leading-tight mb-6">
            {post.title}
          </h2>

          {/* Platform, Account & Theme */}
          <div className="flex items-center gap-3 mb-4 p-4 bg-[var(--bg-secondary)] rounded-[10px]">
            <PlatformBadge platform={post.platform} />
            <AccountAvatar account={post.account} size={20} />
            <span className="text-[var(--text-primary)] text-sm">{post.account}</span>
            <span className="text-[var(--text-disabled)]">·</span>
            <span className="text-[var(--text-secondary)] text-[13px]">
              {post.scheduledDate
                ? `${post.scheduledDate}, ${post.scheduledTime}`
                : 'Not scheduled'}
            </span>
          </div>

          {/* Missed status banner */}
          {post.status === 'missed' && (
            <div className="bg-[#EF444410] border border-[#EF444420] rounded-[10px] p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-[#EF4444]" />
                <span className="text-[13px] text-[#EF4444] font-medium">MISSED</span>
              </div>
              {post.scheduledDate && (
                <p className="text-[12px] text-[var(--text-muted)] mb-3">
                  Was scheduled for {post.scheduledDate}, {post.scheduledTime}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => openScheduleModal(post.id)}
                  className="flex items-center gap-1.5 bg-[#3B82F620] border border-[#3B82F640] rounded-lg px-3 py-2 text-[#3B82F6] text-[12px] font-medium hover:bg-[#3B82F630] transition-colors"
                >
                  <Calendar size={12} />
                  Reschedule
                </button>
                <button
                  onClick={() => openMarkPostedModal(post.id)}
                  className="flex items-center gap-1.5 bg-[#22C55E20] border border-[#22C55E40] rounded-lg px-3 py-2 text-[#22C55E] text-[12px] font-medium hover:bg-[#22C55E30] transition-colors"
                >
                  Mark as Posted
                </button>
                <button
                  onClick={() => moveToDraft(post.id)}
                  className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[var(--text-secondary)] text-[12px] font-medium hover:text-[var(--text-primary)] transition-colors"
                >
                  Move to Draft
                </button>
              </div>
            </div>
          )}

          {/* Posted status banner */}
          {post.status === 'posted' && (
            <div className="bg-[#22C55E10] border border-[#22C55E20] rounded-[10px] p-4 mb-4">
              <div className="text-[13px] text-[#22C55E] font-medium mb-1">POSTED</div>
              {post.postedAt && (
                <p className="text-[12px] text-[var(--text-muted)]">{post.postedAt}</p>
              )}
              {post.postUrl && (
                <a
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] text-[#3B82F6] hover:text-[#60A5FA] mt-2 transition-colors"
                >
                  <ExternalLink size={11} />
                  View on {post.platform === 'linkedin' ? 'LinkedIn' : post.platform === 'x' ? 'X' : 'Instagram'}
                </a>
              )}
            </div>
          )}

          {/* Theme selector */}
          <div className="mb-6">
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
              Theme
            </label>
            <ThemeSelector
              value={post.themeId}
              onChange={(themeId) => updatePost(post.id, { themeId })}
            />
          </div>

          {/* Content Editor */}
          <div className="mb-6">
            <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Content
            </label>
            <textarea
              value={contentDirty ? contentValue : (post.content || '')}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full min-h-[200px] bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[10px] p-4 text-[var(--text-primary)] text-sm leading-relaxed resize-y outline-none focus:border-[var(--border-hover)] transition-colors"
              placeholder="Write your post content..."
            />
            <div className={`flex justify-end mt-2 text-xs ${isOverLimit ? 'text-[#FF3B30]' : 'text-[var(--text-muted)]'}`}>
              {charCount.toLocaleString()} / {charLimit.toLocaleString()} chars
              {isOverLimit && <span className="ml-1.5 font-medium">Over limit!</span>}
            </div>
          </div>

          {/* AI & ToV Checks */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* AI Check */}
            <div
              className="bg-[var(--bg-secondary)] rounded-[10px] p-4"
              style={{ border: `1px solid ${aiStatus.color}30` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                  AI Detection
                </span>
                <span className="text-[11px]" style={{ color: aiStatus.color }}>
                  {aiStatus.label}
                </span>
              </div>
              <div
                className="text-[28px] font-semibold mb-3"
                style={{ color: aiStatus.color }}
              >
                {aiStatus.icon} {post.aiScore}%
              </div>
              <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {post.flaggedPhrases && post.flaggedPhrases.length > 0 ? (
                  <>
                    Flagged phrases:{' '}
                    {post.flaggedPhrases.map((phrase, i) => (
                      <span key={i}>
                        <span className="text-[#FFB800]">&quot;{phrase}&quot;</span>
                        {i < post.flaggedPhrases!.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </>
                ) : (
                  'No flagged phrases'
                )}
              </div>
            </div>

            {/* ToV Check */}
            <div
              className="bg-[var(--bg-secondary)] rounded-[10px] p-4"
              style={{ border: `1px solid ${tovStatus.color}30` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                  Tone of Voice
                </span>
                <span className="text-[11px]" style={{ color: tovStatus.color }}>
                  {tovStatus.label}
                </span>
              </div>
              <div
                className="text-[28px] font-semibold mb-3"
                style={{ color: tovStatus.color }}
              >
                {tovStatus.icon} {post.tovScore}%
              </div>
              <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {post.tovSuggestions?.[0] || 'No suggestions'}
              </div>
            </div>
          </div>

          {/* Re-check button */}
          <button className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg p-3 text-[var(--text-primary)] text-[13px] hover:bg-[var(--bg-tertiary)] transition-colors mb-6 flex items-center justify-center gap-2">
            <RefreshCw size={14} />
            Re-check AI & ToV
          </button>

          {/* Creative */}
          <div className="mb-6">
            <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Creative
            </label>
            <CreativeUpload
              files={post.mediaFiles}
              onFilesChange={(files) => updatePost(post.id, { mediaFiles: files, hasCreative: files.length > 0 })}
              platform={post.platform}
              disabled={userKey !== 'tade'}
            />
            <div
              className="flex items-center gap-2 mt-3 text-xs"
              style={{
                color: post.creativeApproved ? '#34C759' : '#FFB800',
              }}
            >
              {post.creativeApproved ? '✓' : '⏳'}
              {post.creativeApproved
                ? 'Creative approved by Martin'
                : "Waiting for Martin's approval"}
            </div>
          </div>

          {/* Comments */}
          <div className="mb-6">
            <label className="block text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
              Comments ({post.comments.length})
            </label>

            <div className="bg-[var(--bg-secondary)] rounded-[10px] p-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 mb-4 last:mb-0">
                  <UserAvatar userId={comment.authorId} size={32} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-medium text-[var(--text-primary)]">
                        {getUserByKey(comment.authorId)?.name}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {comment.createdAt}
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--text-primary)] leading-relaxed m-0">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add comment */}
              <div className="flex gap-3 pt-4 border-t border-[var(--border-default)]">
                {userKey && <UserAvatar userId={userKey} size={32} />}
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add comment..."
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg px-3.5 py-2.5 text-[var(--text-primary)] text-[13px] outline-none focus:border-[var(--border-hover)] placeholder:text-[var(--text-disabled)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
              Activity
            </label>
            <div className="text-xs text-[var(--text-muted)] leading-8">
              {activity.length === 0 ? (
                <div className="text-[var(--text-disabled)]">No activity yet</div>
              ) : (
                activity.map((item) => (
                  <div key={item.id}>
                    {item.createdAt} · {item.userId ? `${getUserByKey(item.userId as UserId)?.name} ` : ''}
                    {item.action}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
