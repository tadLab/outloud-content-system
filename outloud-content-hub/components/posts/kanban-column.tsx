'use client';

import { Post } from '@/types';
import { PostCard } from './post-card';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  posts: Post[];
  accentColor: string;
  onPostClick: (post: Post) => void;
}

export function KanbanColumn({ id, title, count, posts, accentColor, onPostClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      {/* Column Header */}
      <div
        className="flex items-center justify-between mb-4 pb-3"
        style={{ borderBottom: `2px solid ${accentColor}` }}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            {title}
          </h3>
          <span className="bg-[var(--border-default)] text-[var(--text-secondary)] text-[11px] px-2 py-0.5 rounded-full font-medium">
            {count}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="min-h-[200px]">
        <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-2xl mb-2">
                {id === 'draft' && '✏️'}
                {id === 'design_review' && '🎨'}
                {id === 'final_review' && '👀'}
                {id === 'approved' && '✅'}
                {id === 'scheduled' && '📅'}
              </div>
              <p className="text-[13px] text-[var(--text-muted)]">No posts here</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onClick={onPostClick} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
