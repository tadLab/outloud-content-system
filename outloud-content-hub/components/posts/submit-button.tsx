'use client';

import { useState } from 'react';
import { Post } from '@/types';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import { Send, CheckCircle, AlertTriangle } from 'lucide-react';

interface SubmitButtonProps {
  post: Post;
}

function getValidationIssue(post: Post): string | null {
  if (!post.title || post.title.trim().length === 0) return 'Title is required';
  if (!post.content || post.content.trim().length < 50) return 'Content must be at least 50 characters';
  if (!post.account) return 'Please select an account';
  if (post.aiScore >= 60) return 'AI score too high. Rewrite to sound more human.';
  if (post.tovScore > 0 && post.tovScore < 70) return 'ToV score too low. Adjust to match brand.';
  return null;
}

export function SubmitButton({ post }: SubmitButtonProps) {
  const { user } = useUserContext();
  const { submitForReview } = usePosts(user?.id);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const issue = getValidationIssue(post);
  const canSubmit = issue === null;

  const handleSubmit = async () => {
    const result = await submitForReview(post.id);
    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
    if (result.success) {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (feedback?.type === 'success') {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 text-[#34C759] text-[13px]">
        <CheckCircle size={14} />
        <span>{feedback.message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={canSubmit ? handleSubmit : undefined}
        disabled={!canSubmit}
        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all ${
          canSubmit
            ? 'bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-gradient-end)] text-white hover:opacity-90 cursor-pointer'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed'
        }`}
      >
        <Send size={13} />
        Submit for Review
      </button>
      {!canSubmit && issue && (
        <span className="flex items-center gap-1 text-[11px] text-[#FFB800]">
          <AlertTriangle size={10} />
          {issue}
        </span>
      )}
      {feedback?.type === 'error' && (
        <span className="text-[11px] text-[#FF3B30]">{feedback.message}</span>
      )}
    </div>
  );
}
