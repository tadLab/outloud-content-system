'use client';

import { BestTimesHeatmap } from './best-times-heatmap';
import { Platform } from '@/types';

const PLATFORMS: Platform[] = ['linkedin', 'x', 'instagram'];

export function BestTimesSection() {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
      <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
        Best Times to Post
      </h3>
      <p className="text-[12px] text-[var(--text-muted)] mb-5">
        Based on industry research. Adjust based on your audience analytics.
      </p>

      <div className="space-y-8">
        {PLATFORMS.map((platform) => (
          <BestTimesHeatmap key={platform} platform={platform} />
        ))}
      </div>
    </div>
  );
}
