'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ACCOUNT_IMAGES } from '@/lib/constants';

interface AccountAvatarProps {
  account: string;
  size?: number;
}

export function AccountAvatar({ account, size = 24 }: AccountAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const imageSrc = ACCOUNT_IMAGES[account];
  const initial = account.charAt(0).toUpperCase();

  // Determine gradient colors per account
  const gradientMap: Record<string, [string, string]> = {
    'Outloud': ['#E85A2C', '#C44A24'],
    'Ondrej': ['#8B5CF6', '#6D28D9'],
  };
  const [from, to] = gradientMap[account] || ['#6A6A6A', '#4A4A4A'];

  if (!imageSrc || imgError) {
    return (
      <div
        className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${from}, ${to})`,
          fontSize: size * 0.45,
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={account}
      width={size}
      height={size}
      className="rounded-full shrink-0 object-cover"
      onError={() => setImgError(true)}
    />
  );
}
