'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import { Platform, PostStatus, MediaFile } from '@/types';
import { PLATFORM_OPTIONS, ACCOUNTS, PLATFORM_CHAR_LIMITS } from '@/lib/constants';
import { ThemeSelector } from './theme-selector';
import { AccountAvatar } from '@/components/ui/account-avatar';
import { CreativeUpload } from './creative-upload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function CreatePostModal() {
  const { isCreatePostOpen, setCreatePostOpen } = useAppStore();
  const { user } = useUserContext();
  const { addPost } = usePosts(user?.id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<Platform>('linkedin');
  const [account, setAccount] = useState('Outloud');
  const [themeId, setThemeId] = useState<string | undefined>(undefined);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [titleError, setTitleError] = useState(false);

  const charLimit = PLATFORM_CHAR_LIMITS[platform];
  const isOverLimit = content.length > charLimit;

  const resetForm = () => {
    setTitle('');
    setContent('');
    setPlatform('linkedin');
    setAccount('Outloud');
    setThemeId(undefined);
    setMediaFiles([]);
    setTitleError(false);
  };

  const handleClose = () => {
    setCreatePostOpen(false);
    resetForm();
  };

  const handleSubmit = (status: PostStatus) => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    addPost({ title: title.trim(), content: content.trim(), platform, account, themeId, mediaFiles }, status);
    resetForm();
  };

  return (
    <Dialog open={isCreatePostOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="bg-[#0F0F0F] border-[var(--border-default)] text-[var(--text-primary)] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError(false);
              }}
              placeholder="Post title..."
              className={`w-full bg-[var(--bg-secondary)] border rounded-lg px-3.5 py-2.5 text-[var(--text-primary)] text-sm outline-none placeholder:text-[var(--text-disabled)] transition-colors ${
                titleError ? 'border-[#FF3B30]' : 'border-[var(--border-default)] focus:border-[var(--border-hover)]'
              }`}
            />
            {titleError && (
              <p className="text-[#FF3B30] text-xs mt-1">Title is required</p>
            )}
          </div>

          {/* Platform & Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] text-sm cursor-pointer outline-none focus:border-[var(--border-hover)]"
              >
                {PLATFORM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Account
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <AccountAvatar account={account} size={18} />
                </div>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg pl-9 pr-3 py-2.5 text-[var(--text-primary)] text-sm cursor-pointer outline-none focus:border-[var(--border-hover)]"
                >
                  {ACCOUNTS.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Theme (Tag)
            </label>
            <ThemeSelector value={themeId} onChange={setThemeId} />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className="w-full min-h-[160px] bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-3.5 text-[var(--text-primary)] text-sm leading-relaxed resize-y outline-none placeholder:text-[var(--text-disabled)] focus:border-[var(--border-hover)] transition-colors"
            />
            <div className={`flex justify-end mt-1 text-xs ${isOverLimit ? 'text-[#FF3B30]' : 'text-[var(--text-muted)]'}`}>
              {content.length.toLocaleString()} / {charLimit.toLocaleString()} chars
              {isOverLimit && <span className="ml-1.5 font-medium">Over limit!</span>}
            </div>
          </div>

          {/* Creative upload */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Creative (optional)
            </label>
            <CreativeUpload
              files={mediaFiles}
              onFilesChange={setMediaFiles}
              platform={platform}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            className="bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-[13px] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('final_review')}
            className="bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-gradient-end)] rounded-lg px-4 py-2.5 text-white text-[13px] font-semibold hover:scale-[1.02] transition-transform"
          >
            Submit for Review →
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
