'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Link, Clock } from 'lucide-react';

export function MarkPostedModal() {
  const { isMarkPostedModalOpen, closeMarkPostedModal, markPostedTargetPostId } = useAppStore();
  const { user } = useUserContext();
  const { posts, markAsPosted } = usePosts(user?.id);
  const [postUrl, setPostUrl] = useState('');
  const [postedDate, setPostedDate] = useState('');
  const [postedTime, setPostedTime] = useState('');

  const post = posts.find((p) => p.id === markPostedTargetPostId);

  const handleClose = () => {
    closeMarkPostedModal();
    setPostUrl('');
    setPostedDate('');
    setPostedTime('');
  };

  const handleSubmit = () => {
    if (!markPostedTargetPostId) return;

    let postedAt: string | undefined;
    if (postedDate) {
      const dateObj = new Date(postedDate + 'T00:00:00');
      const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      postedAt = postedTime ? `${formatted}, ${postedTime}` : formatted;
    }

    markAsPosted(markPostedTargetPostId, postUrl || undefined, postedAt);
    setPostUrl('');
    setPostedDate('');
    setPostedTime('');
  };

  return (
    <Dialog open={isMarkPostedModalOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="bg-[#0F0F0F] border-[var(--border-default)] text-[var(--text-primary)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
            Mark as Posted
          </DialogTitle>
          <DialogDescription className="text-[var(--text-secondary)] text-sm">
            {post ? (
              <>This post was scheduled but not auto-published. If you posted it manually, enter the details below.</>
            ) : (
              'Confirm manual posting'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Post URL */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              <Link size={12} />
              Post URL (optional)
            </label>
            <input
              type="url"
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder="https://linkedin.com/posts/..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-hover)] transition-colors placeholder:text-[var(--text-disabled)]"
            />
          </div>

          {/* Posted at */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              <Clock size={12} />
              Posted at (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={postedDate}
                onChange={(e) => setPostedDate(e.target.value)}
                className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-hover)] transition-colors [color-scheme:dark]"
              />
              <input
                type="time"
                value={postedTime}
                onChange={(e) => setPostedTime(e.target.value)}
                className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-3 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-hover)] transition-colors [color-scheme:dark]"
              />
            </div>
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
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-lg px-5 py-2.5 text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            Confirm as Posted
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
