'use client';

import { useUserContext } from '@/providers/user-provider';
import { UserId } from '@/types';

interface UserAvatarProps {
  userId: UserId;
  size?: number;
  showName?: boolean;
}

export function UserAvatar({ userId, size = 28, showName = false }: UserAvatarProps) {
  const { getUserByKey } = useUserContext();
  const user = getUserByKey(userId);

  const fontSize = size < 24 ? 8 : size < 32 ? 10 : 12;

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: user.color,
          fontSize,
        }}
        title={user.name}
      >
        {user.initial}
      </div>
      {showName && (
        <span className="text-[12px] text-[var(--text-primary)]">{user.name}</span>
      )}
    </div>
  );
}
