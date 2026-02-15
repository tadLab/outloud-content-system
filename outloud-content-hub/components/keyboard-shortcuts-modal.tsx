'use client';

import { useAppStore } from '@/stores/app-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SHORTCUTS = [
  {
    section: 'General',
    items: [
      { keys: 'N', description: 'Create new post' },
      { keys: '/ or ⌘K', description: 'Focus search' },
      { keys: '?', description: 'Show this help' },
      { keys: 'Esc', description: 'Close modal / clear selection' },
    ],
  },
  {
    section: 'Post Editor',
    items: [
      { keys: '⌘S', description: 'Save draft' },
      { keys: '⌘Enter', description: 'Submit for review' },
      { keys: '⌘⇧C', description: 'Run AI & ToV check' },
    ],
  },
  {
    section: 'Navigation',
    items: [
      { keys: 'G then D', description: 'Go to Dashboard' },
      { keys: 'G then P', description: 'Go to Posts' },
      { keys: 'G then S', description: 'Go to Settings' },
    ],
  },
];

export function KeyboardShortcutsModal() {
  const { isShortcutsModalOpen, setShortcutsModalOpen } = useAppStore();

  return (
    <Dialog open={isShortcutsModalOpen} onOpenChange={setShortcutsModalOpen}>
      <DialogContent className="bg-[#0F0F0F] border-[var(--border-default)] text-[var(--text-primary)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {SHORTCUTS.map(({ section, items }) => (
            <div key={section}>
              <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2">{section}</div>
              <div className="space-y-1.5">
                {items.map(({ keys, description }) => (
                  <div key={keys} className="flex items-center justify-between py-1">
                    <span className="text-sm text-[var(--text-primary)]">{description}</span>
                    <kbd className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded px-2 py-0.5 font-mono">
                      {keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
