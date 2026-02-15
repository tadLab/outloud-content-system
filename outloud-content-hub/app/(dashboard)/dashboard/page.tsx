'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useUserContext } from '@/providers/user-provider';
import { KanbanBoard } from '@/components/posts/kanban-board';
import { DesignReviewQueue } from '@/components/posts/design-review-queue';
import { FinalReviewQueue } from '@/components/posts/final-review-queue';
import { PostDetailPanel } from '@/components/posts/post-detail-panel';
import { CreatePostModal } from '@/components/posts/create-post-modal';
import { DenialModal } from '@/components/posts/denial-modal';
import { ScheduleModal } from '@/components/posts/schedule-modal';
import { MarkPostedModal } from '@/components/posts/mark-posted-modal';
import { LibraryPage } from '@/components/library/library-page';
import { CalendarPage } from '@/components/calendar/calendar-page';
import { ContentPlanPage } from '@/components/plan/content-plan-page';
import { TovPage } from '@/components/tov/tov-page';
import { SettingsPageContent } from '@/components/settings/settings-page';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';

export default function DashboardPage() {
  const { selectedPostId, activeTab, setShortcutsModalOpen, setCreatePostOpen } = useAppStore();
  const { userKey } = useUserContext();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen(true);
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setCreatePostOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShortcutsModalOpen, setCreatePostOpen]);

  // Library page
  if (activeTab === 'library') {
    return (
      <>
        <LibraryPage />
        {selectedPostId && <PostDetailPanel />}
        <CreatePostModal />
        <ScheduleModal />
        <MarkPostedModal />
        <KeyboardShortcutsModal />
      </>
    );
  }

  // Calendar page
  if (activeTab === 'calendar') {
    return (
      <>
        <CalendarPage />
        {selectedPostId && <PostDetailPanel />}
        <CreatePostModal />
        <ScheduleModal />
        <MarkPostedModal />
        <KeyboardShortcutsModal />
      </>
    );
  }

  // Content Plan page
  if (activeTab === 'plan') {
    return (
      <>
        <ContentPlanPage />
        <KeyboardShortcutsModal />
      </>
    );
  }

  // Tone of Voice page
  if (activeTab === 'tov') {
    return (
      <>
        <TovPage />
        <KeyboardShortcutsModal />
      </>
    );
  }

  // Settings page
  if (activeTab === 'settings') {
    return (
      <>
        <SettingsPageContent />
        <KeyboardShortcutsModal />
      </>
    );
  }

  // Dashboard (default)
  return (
    <>
      {userKey === 'martin' ? (
        <DesignReviewQueue />
      ) : userKey === 'ondrej' ? (
        <FinalReviewQueue />
      ) : (
        <KanbanBoard />
      )}

      {selectedPostId && <PostDetailPanel />}
      <CreatePostModal />
      <DenialModal />
      <ScheduleModal />
      <MarkPostedModal />
      <KeyboardShortcutsModal />
    </>
  );
}
