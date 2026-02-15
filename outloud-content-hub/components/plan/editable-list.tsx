'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { InlineEdit } from './inline-edit';

interface EditableListProps {
  items: string[];
  onAdd: (item: string) => void;
  onUpdate: (index: number, item: string) => void;
  onDelete: (index: number) => void;
  bulletIcon?: string;
  bulletColor?: string;
  addLabel?: string;
  emptyMessage?: string;
  itemClassName?: string;
}

export function EditableList({
  items,
  onAdd,
  onUpdate,
  onDelete,
  bulletIcon = '•',
  bulletColor = 'var(--text-muted)',
  addLabel = 'Add item',
  emptyMessage = 'No items yet. Add your first one.',
  itemClassName = 'text-[13px] text-[var(--text-primary)]',
}: EditableListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = () => {
    const trimmed = newValue.trim();
    if (trimmed) {
      onAdd(trimmed);
      setNewValue('');
      // Keep input open for quick multi-add
    }
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsAdding(false);
      setNewValue('');
    }
  };

  if (items.length === 0 && !isAdding) {
    return (
      <div>
        <p className="text-[12px] text-[var(--text-disabled)] italic mb-2">
          {emptyMessage}
        </p>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          type="button"
        >
          <Plus size={12} />
          {addLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div key={index} className="group flex items-start gap-2">
          <span className="mt-0.5 text-[12px] flex-shrink-0" style={{ color: bulletColor }}>
            {bulletIcon}
          </span>
          <InlineEdit
            value={item}
            onSave={(val) => onUpdate(index, val)}
            className={itemClassName}
            emptyText="Click to edit..."
          />
          <button
            onClick={() => onDelete(index)}
            className="opacity-0 group-hover:opacity-100 mt-0.5 text-[var(--text-disabled)] hover:text-[#EF4444] transition-all flex-shrink-0"
            type="button"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {/* Add input */}
      {isAdding ? (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[12px] flex-shrink-0" style={{ color: bulletColor }}>
            {bulletIcon}
          </span>
          <input
            ref={addInputRef}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleAddKeyDown}
            onBlur={() => {
              handleAdd();
              setIsAdding(false);
            }}
            placeholder="Type and press Enter..."
            className={`bg-transparent border-b border-[var(--border-hover)] outline-none w-full ${itemClassName}`}
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mt-1"
          type="button"
        >
          <Plus size={12} />
          {addLabel}
        </button>
      )}
    </div>
  );
}
