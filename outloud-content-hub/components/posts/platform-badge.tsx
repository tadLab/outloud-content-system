import { PLATFORM_CONFIG } from '@/lib/constants';
import { Platform } from '@/types';

interface PlatformBadgeProps {
  platform: Platform;
  size?: 'sm' | 'default';
}

export function PlatformBadge({ platform, size = 'default' }: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform];
  if (!config) return null;

  return (
    <span
      className={`rounded font-semibold text-white inline-flex items-center ${
        size === 'sm' ? 'px-1 py-0.5 text-[8px]' : 'px-2 py-1 text-[11px]'
      }`}
      style={{
        background: config.bg,
      }}
    >
      {config.label}
    </span>
  );
}
