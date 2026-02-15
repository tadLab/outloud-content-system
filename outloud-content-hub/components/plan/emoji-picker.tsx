'use client';

import { useState, useRef, useEffect } from 'react';

const EMOJI_CATEGORIES = [
  {
    label: 'Business',
    emojis: ['🎯', '⭐', '🚀', '💡', '📊', '📈', '💰', '🏆', '💼', '🔑', '📋', '✅', '⚡', '🔥', '🎖️'],
  },
  {
    label: 'People',
    emojis: ['👥', '👤', '🤝', '💪', '👋', '🙌', '👏', '🧑‍💻', '👨‍🎨', '🧑‍🏫', '🗣️', '👀', '🧠', '❤️‍🔥'],
  },
  {
    label: 'Objects',
    emojis: ['📱', '💻', '🖥️', '🎨', '🎬', '📸', '🎮', '🎵', '📝', '📌', '🔔', '💬', '📧', '🗓️', '⏰'],
  },
  {
    label: 'Nature',
    emojis: ['🌟', '🌈', '☀️', '🌙', '🌊', '🌱', '🌲', '🏔️', '🔮', '💎', '✨', '🍀', '🌸'],
  },
  {
    label: 'Symbols',
    emojis: ['❤️', '💜', '💙', '💚', '🧡', '🤍', '⬆️', '➡️', '🔄', '🏷️', '📍', '🎪', '🛡️', '⚙️', '🧩'],
  },
  {
    label: 'Transport',
    emojis: ['🚌', '✈️', '🚂', '🚗', '🛸', '⛵', '🏠', '🏢', '🏭', '🎡'],
  },
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  size?: number;
}

export function EmojiPicker({ value, onChange, size = 20 }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:scale-110 transition-transform cursor-pointer"
        style={{ fontSize: size }}
        type="button"
      >
        {value}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-xl shadow-xl p-3 w-[280px] max-h-[320px] overflow-y-auto">
          {EMOJI_CATEGORIES.map((cat) => (
            <div key={cat.label} className="mb-2">
              <div className="text-[10px] text-[var(--text-disabled)] uppercase tracking-wider mb-1">
                {cat.label}
              </div>
              <div className="flex flex-wrap gap-0.5">
                {cat.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onChange(emoji);
                      setIsOpen(false);
                    }}
                    className={`w-8 h-8 flex items-center justify-center text-lg rounded-md hover:bg-[var(--bg-secondary)] transition-colors ${
                      emoji === value ? 'bg-[var(--bg-secondary)] ring-1 ring-[var(--accent-color)]' : ''
                    }`}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
