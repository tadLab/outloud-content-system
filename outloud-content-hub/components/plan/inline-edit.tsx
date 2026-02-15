'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  as?: 'input' | 'textarea';
  emptyText?: string;
}

export function InlineEdit({
  value,
  onSave,
  placeholder,
  className = '',
  inputClassName = '',
  as = 'input',
  emptyText,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text on focus
      if (as === 'input' && inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing, as]);

  const handleSave = () => {
    const trimmed = localValue.trim();
    if (trimmed !== value) {
      onSave(trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && as === 'input') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <span
        className={`cursor-text hover:underline hover:decoration-[var(--border-hover)] decoration-dotted underline-offset-4 ${className} ${
          !value && emptyText ? 'text-[var(--text-disabled)] italic' : ''
        }`}
        onClick={() => setIsEditing(true)}
      >
        {value || emptyText || placeholder || 'Click to edit...'}
      </span>
    );
  }

  const sharedProps = {
    value: localValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setLocalValue(e.target.value),
    onBlur: handleSave,
    onKeyDown: handleKeyDown,
    placeholder,
    className: `bg-transparent border-b border-[var(--border-hover)] outline-none w-full ${className} ${inputClassName}`,
  };

  if (as === 'textarea') {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        {...sharedProps}
        rows={2}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      {...sharedProps}
    />
  );
}
