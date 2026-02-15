'use client';

import { useState } from 'react';
import { useThemes } from '@/hooks/use-themes';
import { DEFAULT_THEME_COLORS } from '@/lib/constants';
import { Theme } from '@/types';
import { GripVertical, Edit3, X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function ThemeManager() {
  const { themes, addTheme, updateTheme, deleteTheme, reorderThemes } = useThemes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#3B82F6');
  const [formDescription, setFormDescription] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingTheme(null);
    setFormName('');
    setFormColor('#3B82F6');
    setFormDescription('');
    setIsFormOpen(true);
  };

  const openEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setFormName(theme.name);
    setFormColor(theme.color);
    setFormDescription(theme.description || '');
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editingTheme) {
      updateTheme(editingTheme.id, {
        name: formName.trim(),
        color: formColor,
        description: formDescription.trim() || undefined,
      });
    } else {
      addTheme({
        name: formName.trim(),
        color: formColor,
        description: formDescription.trim() || undefined,
        isDefault: false,
      });
    }
    setIsFormOpen(false);
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const items = [...themes];
    const fromIndex = items.findIndex((t) => t.id === draggedId);
    const toIndex = items.findIndex((t) => t.id === targetId);
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    reorderThemes(items.map((t, i) => ({ ...t, sortOrder: i + 1 })));
  };
  const handleDragEnd = () => setDraggedId(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Themes (Tags)</h2>
          <p className="text-sm text-[var(--text-muted)]">Organize your posts with custom themes. Drag to reorder.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-gradient-end)] rounded-lg px-4 py-2.5 text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Add Theme
        </button>
      </div>

      {/* Theme List */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden">
        {themes.map((theme) => (
          <div
            key={theme.id}
            draggable
            onDragStart={() => handleDragStart(theme.id)}
            onDragOver={(e) => handleDragOver(e, theme.id)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors ${
              draggedId === theme.id ? 'opacity-50' : ''
            }`}
          >
            <GripVertical size={14} className="text-[var(--text-disabled)] cursor-grab" />
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: theme.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[var(--text-primary)]">{theme.name}</div>
              {theme.description && (
                <div className="text-[11px] text-[var(--text-muted)] truncate">{theme.description}</div>
              )}
            </div>
            <button
              onClick={() => openEdit(theme)}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Edit3 size={13} />
            </button>
            {!theme.isDefault && (
              <button
                onClick={() => deleteTheme(theme.id)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[#FF3B30] transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Theme Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[#0F0F0F] border-[var(--border-default)] text-[var(--text-primary)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
              {editingTheme ? 'Edit Theme' : 'Add Theme'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Theme name..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-hover)] placeholder:text-[var(--text-disabled)]"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Color</label>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {DEFAULT_THEME_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        formColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-20 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-hover)]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Description (optional)
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="What kind of posts use this theme..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-hover)] placeholder:text-[var(--text-disabled)]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formName.trim()}
              className="bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-gradient-end)] rounded-lg px-5 py-2.5 text-white text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {editingTheme ? 'Save Changes' : 'Save Theme'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
