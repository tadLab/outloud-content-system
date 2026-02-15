export type Platform = 'linkedin' | 'x' | 'instagram';
export type PostStatus = 'draft' | 'design_review' | 'final_review' | 'approved' | 'scheduled' | 'posted' | 'missed';
export type UserRole = 'admin' | 'designer' | 'approver';
export type UserId = 'tade' | 'martin' | 'ondrej';

export interface User {
  id: UserId;
  name: string;
  initial: string;
  color: string;
  role: UserRole;
  roleLabel: string;
}

export interface MediaFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  platform: Platform;
  account: string;
  aiScore: number;
  tovScore: number;
  comments: Comment[];
  hasCreative: boolean;
  creativeApproved: boolean;
  creativeApprovedBy?: UserId;
  creativeApprovedAt?: string;
  creativeDenied?: boolean;
  creativeDeniedBy?: UserId;
  creativeDenialReason?: string;
  creativeDeniedAt?: string;
  finalApproved?: boolean;
  finalApprovedBy?: UserId;
  finalApprovedAt?: string;
  finalDenied?: boolean;
  finalDeniedBy?: UserId;
  finalDenialReason?: string;
  finalDeniedAt?: string;
  revisionCount: number;
  author: UserId;
  status: PostStatus;
  waitingFor?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledISO?: string;
  postUrl?: string;
  postedAt?: string;
  flaggedPhrases?: string[];
  tovSuggestions?: string[];
  mediaFiles: MediaFile[];
  createdAt: string;
  themeId?: string;
}

export interface Theme {
  id: string;
  name: string;
  color: string;
  description?: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: UserId;
  content: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  postId: string;
  userId?: UserId;
  action: string;
  details?: string;
  createdAt: string;
}

export interface ScoreStatus {
  icon: string;
  color: string;
  label: string;
}

export interface PlatformConfig {
  bg: string;
  label: string;
  isGradient?: boolean;
}

export interface KanbanColumnConfig {
  id: PostStatus;
  title: string;
  accentColor: string;
}

export interface PostFilters {
  platforms: Platform[];
  account: string | null;
  search: string;
  theme: string | null;
}

export interface NewPostFormData {
  title: string;
  content: string;
  platform: Platform;
  account: string;
  themeId?: string;
  mediaFiles?: MediaFile[];
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  compactMode: boolean;
}

export interface NotificationSettings {
  emailReviewReady: boolean;
  emailPostApproved: boolean;
  emailPostReturned: boolean;
  emailNewComment: boolean;
  emailDailyDigest: boolean;
  showBadges: boolean;
  playSound: boolean;
}

export type SettingsTab = 'appearance' | 'themes' | 'accounts' | 'team' | 'notifications';

export type LibraryTab = 'all' | 'drafts' | 'scheduled' | 'posted';
export type CalendarView = 'month' | 'week';

// Content Plan types
export type PlanStatus = 'draft' | 'active' | 'archived';
export type PlanTab = 'overview' | 'pillars' | 'cadence' | 'weekly' | 'monthly' | 'team';

export interface NorthStarGoal {
  id: string;
  icon: string;
  title: string;
  description: string;
  target: string;
}

export interface KPIItem {
  label: string;
  note?: string;
}

export interface KPISection {
  primary: KPIItem[];
  secondary: KPIItem[];
}

export interface ContentPlan {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  northStar: NorthStarGoal[];
  kpis: KPISection;
  brandVoiceNotes: string;
}

export interface ContentPillar {
  id: string;
  planId: string;
  name: string;
  description: string;
  formats: string[];
  frequency: string;
  goal: string;
  color: string;
  sortOrder: number;
  targetPerMonth: number;
}

export interface CadenceEntry {
  id: string;
  planId: string;
  account: string;
  platform: Platform;
  frequency: string;
  days: string;
  preferredTime: string;
  notes?: string;
}

export interface CadenceSummary {
  account: string;
  weeklyTotal: string;
  monthlyTotal: string;
  entries: CadenceEntry[];
}

export interface WeeklySlot {
  id: string;
  planId: string;
  dayOfWeek: string;
  slotName: string;
  account: string;
  goal: string;
  formats: string[];
  pillar: string;
  ctaExamples?: string[];
  topics?: string[];
}

export interface MonthlyWeek {
  weekNumber: number;
  weekName: string;
  postA: { description: string; format: string };
  postB: { description: string; format: string };
  ondrejTue: string;
  ondrejThu: string;
}

export interface MonthlyTheme {
  id: string;
  month: string;
  themeName: string;
  emoji: string;
  status: 'planned' | 'current' | 'completed';
}

export interface TeamMember {
  userId: UserId;
  responsibilities: string[];
}

export interface WorkflowStep {
  step: number;
  who: UserId;
  day: string;
  task: string;
  time: string;
}

export interface CombinedWeeklyGrid {
  platform: string;
  days: Record<string, string>;
}

export interface BrandVoice {
  tagline: string;
  threeWords: string[];
  dos: string[];
  donts: string[];
}

// ── Tone of Voice types ──────────────────────────────────────────────
export type TovTab = 'guidelines' | 'dos-donts' | 'examples' | 'voice-split';

export interface TovGuideline {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
}

export interface TovExample {
  id: string;
  type: 'good' | 'bad_to_good' | 'hook';
  title?: string;
  beforeText?: string;
  afterText: string;
  explanation?: string;
  tags: string[];
  sortOrder: number;
}

export interface TovBlockedPhrase {
  id: string;
  phrase: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
  appliesTo: string[];
}

export interface TovDo {
  item: string;
  example: string;
}

export interface TovDont {
  phrase: string;
  fix: string;
}

export interface VoiceSplitAccount {
  account: string;
  voiceName: string;
  characteristics: string[];
  example: string;
  topics?: string[];
}

export interface VoiceComparison {
  aspect: string;
  outloud: string;
  ondrej: string;
}

// ── Best Times to Post types ─────────────────────────────────────────
export interface PostingTimeSlot {
  time: string;
  label: string;
  engagement: 'highest' | 'high' | 'medium';
}

export interface PlatformPostingConfig {
  name: string;
  icon: string;
  bestDays: string[];
  bestTimes: PostingTimeSlot[];
  avoidTimes: string[];
  avoidDays: string[];
  notes: string;
  timezone: string;
}

// ── ToV Checker result types ─────────────────────────────────────────
export interface TovIssue {
  phrase: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
}

export interface TovCheckResult {
  score: number;
  issues: TovIssue[];
}

// ── Writing Style types ──────────────────────────────────────────────
export interface WritingStyleRule {
  id: string;
  title: string;
  content: string;
}
