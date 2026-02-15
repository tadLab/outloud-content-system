'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { usePosts } from '@/hooks/use-posts';
import { KANBAN_COLUMNS } from '@/lib/constants';
import { KanbanColumn } from './kanban-column';
import { PlanStatsWidget } from '@/components/dashboard/plan-stats-widget';
import { Post, PostStatus } from '@/types';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';

export function KanbanBoard() {
  const { setSelectedPostId, filters, clearFilters } = useAppStore();
  const { user, userKey } = useUserContext();
  const { posts, movePost, checkAndMarkMissedPosts } = usePosts(user?.id);

  // Auto-detect expired scheduled posts
  useEffect(() => {
    checkAndMarkMissedPosts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Local filtering logic (replaces old getFilteredPostsByStatus)
  const getFilteredPostsByStatus = useMemo(() => {
    return (status: PostStatus): Post[] => {
      return posts.filter((post) => {
        if (post.status !== status) return false;
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
    };
  }, [posts, filters]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const postId = active.id as string;
    const overId = over.id as string;

    const targetColumn = KANBAN_COLUMNS.find((col) => col.id === overId);
    if (targetColumn) {
      movePost(postId, targetColumn.id);
      return;
    }

    const targetPost = posts.find((p) => p.id === overId);
    if (targetPost) {
      movePost(postId, targetPost.status);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const postId = active.id as string;
    const overId = over.id as string;

    const activePost = posts.find((p) => p.id === postId);
    if (!activePost) return;

    const targetColumn = KANBAN_COLUMNS.find((col) => col.id === overId);
    if (targetColumn && activePost.status !== targetColumn.id) {
      movePost(postId, targetColumn.id);
      return;
    }

    const overPost = posts.find((p) => p.id === overId);
    if (overPost && activePost.status !== overPost.status) {
      movePost(postId, overPost.status);
    }
  }

  const hasActiveFilters = filters.platforms.length > 0 || filters.account !== null || filters.search !== '' || filters.theme !== null;
  const allColumnsEmpty = hasActiveFilters && KANBAN_COLUMNS.every((col) => getFilteredPostsByStatus(col.id).length === 0);

  return (
    <>
      {userKey === 'tade' && <PlanStatsWidget />}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {allColumnsEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-[15px] text-[var(--text-secondary)] mb-1">No posts matching your filters</p>
            <button
              onClick={clearFilters}
              className="text-[13px] text-[var(--accent-color)] hover:text-[var(--accent-gradient-end)] transition-colors bg-transparent"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="p-8 flex gap-6 overflow-auto">
            {KANBAN_COLUMNS.map((column) => {
              const columnPosts = getFilteredPostsByStatus(column.id);
              return (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  count={columnPosts.length}
                  posts={columnPosts}
                  accentColor={column.accentColor}
                  onPostClick={(post) => setSelectedPostId(post.id)}
                />
              );
            })}
          </div>
        )}
      </DndContext>
    </>
  );
}
