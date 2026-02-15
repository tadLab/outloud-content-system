import { KanbanColumnConfig, Platform, PlatformConfig, PlatformPostingConfig, PostStatus } from '@/types';

export const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  linkedin: { bg: '#0A66C2', label: 'LI' },
  x: { bg: '#1D1D1D', label: '𝕏' },
  instagram: { bg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', label: 'IG', isGradient: true },
};

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X' },
  { value: 'instagram', label: 'Instagram' },
];

export const ACCOUNTS = ['Outloud', 'Ondrej'] as const;

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { id: 'draft', title: 'Draft', accentColor: '#6A6A6A' },
  { id: 'design_review', title: 'Design Review', accentColor: '#3B82F6' },
  { id: 'final_review', title: 'Final Review', accentColor: '#8B5CF6' },
  { id: 'approved', title: 'Approved', accentColor: '#22C55E' },
  { id: 'scheduled', title: 'Scheduled', accentColor: '#34C759' },
];

export const USER_COLORS = {
  tade: '#E85A2C',
  martin: '#3B82F6',
  ondrej: '#8B5CF6',
} as const;

export const STATUS_COLORS = {
  success: '#34C759',
  warning: '#FFB800',
  error: '#FF3B30',
  info: '#3B82F6',
} as const;

export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  linkedin: 3000,
  x: 280,
  instagram: 2200,
};

export const DEFAULT_THEME_COLORS = [
  '#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B',
  '#06B6D4', '#EF4444', '#EC4899', '#6B7280',
] as const;

export const STATUS_DISPLAY: Record<PostStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: '#9A9A9A', bg: '#9A9A9A20' },
  design_review: { label: 'Design Review', color: '#3B82F6', bg: '#3B82F620' },
  final_review: { label: 'Final Review', color: '#8B5CF6', bg: '#8B5CF620' },
  approved: { label: 'Approved', color: '#22C55E', bg: '#22C55E20' },
  scheduled: { label: 'Scheduled', color: '#3B82F6', bg: '#3B82F620' },
  posted: { label: 'Posted', color: '#22C55E', bg: '#22C55E20' },
  missed: { label: 'Missed', color: '#EF4444', bg: '#EF444420' },
};

export const ACCOUNT_IMAGES: Record<string, string> = {
  'Outloud': '/accounts/outloud-logo.jpeg',
  'Ondrej': '/accounts/ondrej-logo.png',
};

export const CALENDAR_STATUS_COLORS = {
  scheduled: { bg: '#3B82F620', border: '#3B82F6' },
  posted: { bg: '#22C55E20', border: '#22C55E' },
  missed: { bg: '#EF444420', border: '#EF4444' },
} as const;

// ── Best Posting Times ───────────────────────────────────────────────
export const BEST_POSTING_TIMES: Record<Platform, PlatformPostingConfig> = {
  linkedin: {
    name: 'LinkedIn',
    icon: '\u25A3',
    bestDays: ['tuesday', 'wednesday', 'thursday'],
    bestTimes: [
      { time: '07:30', label: 'Early Morning', engagement: 'high' },
      { time: '08:00', label: 'Morning Commute', engagement: 'highest' },
      { time: '10:00', label: 'Mid-Morning', engagement: 'high' },
      { time: '12:00', label: 'Lunch Break', engagement: 'medium' },
      { time: '17:00', label: 'End of Workday', engagement: 'high' },
      { time: '18:00', label: 'Evening Commute', engagement: 'medium' },
    ],
    avoidTimes: ['22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00'],
    avoidDays: ['saturday', 'sunday'],
    notes: 'B2B audience. Best during work hours. Tuesday-Thursday peak engagement.',
    timezone: 'CET',
  },
  x: {
    name: 'X (Twitter)',
    icon: '\uD835\uDD4F',
    bestDays: ['monday', 'tuesday', 'wednesday', 'thursday'],
    bestTimes: [
      { time: '08:00', label: 'Morning', engagement: 'high' },
      { time: '09:00', label: 'Work Start', engagement: 'highest' },
      { time: '12:00', label: 'Lunch', engagement: 'high' },
      { time: '17:00', label: 'End of Day', engagement: 'high' },
      { time: '20:00', label: 'Evening', engagement: 'medium' },
    ],
    avoidTimes: ['02:00', '03:00', '04:00', '05:00'],
    avoidDays: ['sunday'],
    notes: 'Fast-moving feed. Multiple posts per day work well. Engage with replies.',
    timezone: 'CET',
  },
  instagram: {
    name: 'Instagram',
    icon: '\uD83D\uDCF7',
    bestDays: ['monday', 'tuesday', 'wednesday', 'friday'],
    bestTimes: [
      { time: '06:00', label: 'Early Birds', engagement: 'medium' },
      { time: '07:00', label: 'Morning', engagement: 'high' },
      { time: '11:00', label: 'Late Morning', engagement: 'highest' },
      { time: '13:00', label: 'Lunch Break', engagement: 'high' },
      { time: '19:00', label: 'Evening', engagement: 'highest' },
      { time: '21:00', label: 'Night', engagement: 'high' },
    ],
    avoidTimes: ['01:00', '02:00', '03:00', '04:00', '05:00'],
    avoidDays: ['sunday'],
    notes: 'Visual platform. Stories anytime, feed posts during peak hours.',
    timezone: 'CET',
  },
};

// ── Media Requirements ──────────────────────────────────────────────
export const ACCEPTED_FILE_TYPES = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  video: ['.mp4', '.mov', '.webm'],
  document: ['.pdf'],
};

export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,   // 10 MB
  video: 100 * 1024 * 1024,  // 100 MB
  document: 10 * 1024 * 1024, // 10 MB
};

export const MEDIA_REQUIREMENTS: Record<Platform, {
  image: { recommended: { width: number; height: number }; aspectRatio: string; maxSize: string; formats: string[] };
  video: { recommended: { width: number; height: number }; aspectRatio: string; maxDuration: string; maxSize: string; formats: string[] };
  carousel?: { maxSlides: number; format: string };
}> = {
  linkedin: {
    image: {
      recommended: { width: 1200, height: 627 },
      aspectRatio: '1.91:1',
      maxSize: '5 MB',
      formats: ['jpg', 'png', 'gif'],
    },
    video: {
      recommended: { width: 1920, height: 1080 },
      aspectRatio: '16:9 or 1:1',
      maxDuration: '10 min',
      maxSize: '200 MB',
      formats: ['mp4'],
    },
    carousel: { maxSlides: 10, format: 'pdf or images' },
  },
  x: {
    image: {
      recommended: { width: 1200, height: 675 },
      aspectRatio: '16:9',
      maxSize: '5 MB',
      formats: ['jpg', 'png', 'gif', 'webp'],
    },
    video: {
      recommended: { width: 1280, height: 720 },
      aspectRatio: '16:9, 1:1, or 9:16',
      maxDuration: '2 min 20 sec',
      maxSize: '512 MB',
      formats: ['mp4', 'mov'],
    },
  },
  instagram: {
    image: {
      recommended: { width: 1080, height: 1080 },
      aspectRatio: '1:1, 4:5, or 1.91:1',
      maxSize: '8 MB',
      formats: ['jpg', 'png'],
    },
    video: {
      recommended: { width: 1080, height: 1080 },
      aspectRatio: '1:1, 4:5, or 9:16',
      maxDuration: '60 sec (feed), 90 sec (reels)',
      maxSize: '100 MB',
      formats: ['mp4', 'mov'],
    },
    carousel: { maxSlides: 10, format: 'mixed media' },
  },
};
