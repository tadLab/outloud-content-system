'use client';

import { Platform } from '@/types';

interface ProgressBarProps {
  current: number;
  target: number;
  platform?: Platform;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const platformIcons: Record<Platform, string> = {
  linkedin: '\u25A3',
  x: '\uD835\uDD4F',
  instagram: '\uD83D\uDCF7',
};

const platformColors: Record<Platform, string> = {
  linkedin: '#0A66C2',
  x: '#888888',
  instagram: '#E4405F',
};

export function ProgressBar({
  current,
  target,
  platform,
  showIcon = true,
  size = 'md',
  color,
}: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = current >= target;

  const barHeight = size === 'sm' ? 6 : size === 'lg' ? 10 : 8;
  const barColor = isComplete
    ? 'var(--success)'
    : color || (platform ? platformColors[platform] : 'var(--accent-color)');

  return (
    <div className="flex items-center gap-3">
      {showIcon && platform && (
        <span className="text-[14px] w-5 text-center">{platformIcons[platform]}</span>
      )}
      {showIcon && platform && (
        <span className="text-[12px] text-[var(--text-secondary)] w-16 capitalize">
          {platform === 'x' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1)}
        </span>
      )}

      <div
        className="flex-1 bg-[var(--border-default)] rounded-full overflow-hidden"
        style={{ height: barHeight }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>

      <span className="text-[12px] text-[var(--text-secondary)] min-w-[32px] text-right">
        {current}/{target}
      </span>

      <span className="text-[11px] min-w-[70px]">
        {isComplete ? (
          <span className="text-[var(--success)]">&#10003; Complete</span>
        ) : current === 0 ? (
          <span className="text-[var(--warning)]">&#9888; Start this!</span>
        ) : (
          <span className="text-[var(--text-muted)]">
            {target - current} to go
          </span>
        )}
      </span>
    </div>
  );
}
