'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import { PostStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function DenialModal() {
  const { isDenialModalOpen, closeDenialModal, denialType, denialTargetPostId } = useAppStore();
  const { user } = useUserContext();
  const { posts, submitDenial } = usePosts(user?.id);
  const [reason, setReason] = useState('');
  const [returnTo, setReturnTo] = useState<PostStatus>('draft');
  const [reasonError, setReasonError] = useState(false);

  const post = posts.find((p) => p.id === denialTargetPostId);

  const handleClose = () => {
    closeDenialModal();
    setReason('');
    setReturnTo('draft');
    setReasonError(false);
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      setReasonError(true);
      return;
    }
    if (!denialTargetPostId || !denialType) return;
    submitDenial(denialTargetPostId, denialType, reason.trim(), returnTo);
    setReason('');
    setReturnTo('draft');
    setReasonError(false);
    closeDenialModal();
  };

  const isCreative = denialType === 'creative';
  const title = isCreative ? 'Request Creative Changes' : 'Return for Edits';

  return (
    <Dialog open={isDenialModalOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="bg-[#0F0F0F] border-[var(--border-default)] text-[var(--text-primary)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </DialogTitle>
          {post && (
            <DialogDescription className="text-[var(--text-secondary)] text-sm">
              {post.title}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Reason */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              What needs to be changed?
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setReasonError(false);
              }}
              placeholder="Describe what needs to change..."
              className={`w-full min-h-[120px] bg-[var(--bg-secondary)] border rounded-lg p-3.5 text-[var(--text-primary)] text-sm leading-relaxed resize-y outline-none placeholder:text-[var(--text-disabled)] transition-colors ${
                reasonError ? 'border-[#FF3B30]' : 'border-[var(--border-default)] focus:border-[var(--border-hover)]'
              }`}
            />
            {reasonError && (
              <p className="text-[#FF3B30] text-xs mt-1">A reason is required</p>
            )}
          </div>

          {/* Return to */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
              Return to
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setReturnTo('draft')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                  returnTo === 'draft'
                    ? 'border-[var(--accent-color)] bg-[#E85A2C10]'
                    : 'border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    returnTo === 'draft' ? 'border-[var(--accent-color)]' : 'border-[var(--text-disabled)]'
                  }`}
                >
                  {returnTo === 'draft' && (
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-color)]" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-[var(--text-primary)]">Draft</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Tade can edit and resubmit</div>
                </div>
              </button>

              <button
                onClick={() => setReturnTo('design_review')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                  returnTo === 'design_review'
                    ? 'border-[var(--accent-color)] bg-[#E85A2C10]'
                    : 'border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    returnTo === 'design_review' ? 'border-[var(--accent-color)]' : 'border-[var(--text-disabled)]'
                  }`}
                >
                  {returnTo === 'design_review' && (
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-color)]" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-[var(--text-primary)]">Design Review</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Needs new creative from Martin</div>
                </div>
              </button>
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
            className="bg-[#FF3B3020] border border-[#FF3B3040] rounded-lg px-4 py-2.5 text-[#FF3B30] text-[13px] font-medium hover:bg-[#FF3B3030] transition-colors"
          >
            Return Post
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
