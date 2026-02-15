import { Post, User, Comment, ActivityItem, Theme, ContentPlan, ContentPillar, CadenceSummary, WeeklySlot, MonthlyWeek, MonthlyTheme, TeamMember, WorkflowStep, CombinedWeeklyGrid, TovGuideline, TovDo, TovDont, TovExample, TovBlockedPhrase, VoiceSplitAccount, VoiceComparison, WritingStyleRule } from '@/types';

export const USERS: Record<string, User> = {
  tade: { id: 'tade', name: 'Tade', initial: 'T', color: '#E85A2C', role: 'admin', roleLabel: 'Head of Media' },
  martin: { id: 'martin', name: 'Martin', initial: 'M', color: '#3B82F6', role: 'designer', roleLabel: 'Designer' },
  ondrej: { id: 'ondrej', name: 'Ondrej', initial: 'O', color: '#8B5CF6', role: 'approver', roleLabel: 'CEO' },
};

export const MOCK_THEMES: Theme[] = [
  { id: 'theme-1', name: 'Case Study', color: '#3B82F6', description: 'Project showcases, client work', sortOrder: 1, isDefault: true },
  { id: 'theme-2', name: 'Behind the Scenes', color: '#8B5CF6', description: 'Process, messy middle, how we work', sortOrder: 2, isDefault: true },
  { id: 'theme-3', name: 'Hiring', color: '#22C55E', description: 'Job posts, team culture', sortOrder: 3, isDefault: true },
  { id: 'theme-4', name: 'Opinion', color: '#F59E0B', description: 'Hot takes, thought leadership', sortOrder: 4, isDefault: true },
  { id: 'theme-5', name: 'Educational', color: '#06B6D4', description: 'How-to, tips, tutorials', sortOrder: 5, isDefault: true },
  { id: 'theme-6', name: 'Announcement', color: '#EF4444', description: 'News, launches, updates', sortOrder: 6, isDefault: true },
  { id: 'theme-7', name: 'Personal', color: '#EC4899', description: 'Ondrej personal content', sortOrder: 7, isDefault: true },
];

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Questim case study – one team built everything',
    content: `Questim needed a name, a brand, a game, a mobile app, a tournament system, an advertising platform, a back-office, and anti-cheat protection.

They hired one team.

16 months later: live in CZ/SK, 4 prize tournaments with €17,000+ in real rewards, and 2,000+ competing players. No entry fees. No forced ads. No scam vibes.

We took this project from a blank page (literally — no name existed when we started) through brand identity, product design, Flutter development, in-app game creation with Flame engine, and a full management system for tournaments, advertisers, players, and prize fulfillment.

One product. One team. Everything connected.

Full case study on our site.`,
    platform: 'linkedin',
    account: 'Outloud',
    aiScore: 73,
    tovScore: 89,
    comments: [],
    hasCreative: true,
    mediaFiles: [
      { id: 'mf-1a', url: '/placeholder/questim-hero.jpg', filename: 'questim-hero.jpg', size: 1240000, type: 'image', mimeType: 'image/jpeg', width: 1200, height: 627 },
      { id: 'mf-1b', url: '/placeholder/questim-detail.png', filename: 'questim-detail.png', size: 865000, type: 'image', mimeType: 'image/png', width: 1080, height: 1080 },
    ],
    creativeApproved: false,
    author: 'tade',
    status: 'draft',
    flaggedPhrases: ['delivers top-tier', 'seamless'],
    tovSuggestions: ['Consider more specific numbers'],
    revisionCount: 0,
    createdAt: '2025-02-13T14:30:00Z',
    themeId: 'theme-1',
  },
  {
    id: '2',
    title: "Why we don't do discovery calls anymore",
    platform: 'x',
    account: 'Ondrej',
    aiScore: 12,
    tovScore: 94,
    comments: [],
    hasCreative: false,
    mediaFiles: [],
    creativeApproved: false,
    author: 'tade',
    status: 'draft',
    revisionCount: 0,
    createdAt: '2025-02-13T15:00:00Z',
    themeId: 'theme-4',
  },
  {
    id: '3',
    title: 'IDS BK – tickets without registration',
    platform: 'x',
    account: 'Outloud',
    aiScore: 28,
    tovScore: 91,
    comments: [],
    hasCreative: true,
    mediaFiles: [
      { id: 'mf-3a', url: '/placeholder/ids-bk-ticket.jpg', filename: 'ids-bk-ticket.jpg', size: 542000, type: 'image', mimeType: 'image/jpeg', width: 800, height: 600 },
    ],
    creativeApproved: false,
    author: 'tade',
    status: 'design_review',
    waitingFor: 'Martin',
    revisionCount: 1,
    creativeDenied: true,
    creativeDeniedBy: 'martin',
    creativeDenialReason: 'The hero image needs more contrast. Try using the darker brand palette.',
    creativeDeniedAt: 'Feb 13, 16:30',
    createdAt: '2025-02-12T10:00:00Z',
    themeId: 'theme-1',
  },
  {
    id: '4',
    title: 'Hiring senior designers who ship',
    platform: 'linkedin',
    account: 'Outloud',
    aiScore: 22,
    tovScore: 88,
    comments: [],
    hasCreative: true,
    mediaFiles: [
      { id: 'mf-4a', url: '/placeholder/hiring-banner.jpg', filename: 'hiring-banner.jpg', size: 980000, type: 'image', mimeType: 'image/jpeg', width: 1200, height: 627 },
    ],
    creativeApproved: false,
    author: 'tade',
    status: 'design_review',
    waitingFor: 'Martin',
    revisionCount: 0,
    createdAt: '2025-02-13T09:00:00Z',
    themeId: 'theme-3',
  },
  {
    id: '5',
    title: 'SaaS scaling lessons after 7 figures',
    content: `We hit 7 figures without VC money. Here's what actually worked – the decisions, the tradeoffs, and the things we'd do differently...`,
    platform: 'linkedin',
    account: 'Ondrej',
    aiScore: 18,
    tovScore: 94,
    comments: [],
    hasCreative: true,
    mediaFiles: [
      { id: 'mf-5a', url: '/placeholder/saas-chart.png', filename: 'saas-chart.png', size: 720000, type: 'image', mimeType: 'image/png', width: 1200, height: 627 },
    ],
    creativeApproved: true,
    creativeApprovedBy: 'martin',
    creativeApprovedAt: 'Feb 14, 09:15',
    finalApproved: true,
    finalApprovedBy: 'ondrej',
    finalApprovedAt: 'Feb 14, 14:30',
    author: 'tade',
    status: 'approved',
    revisionCount: 0,
    createdAt: '2025-02-12T14:00:00Z',
    themeId: 'theme-7',
  },
  {
    id: '6',
    title: 'Behind the scenes: Questim game design',
    platform: 'instagram',
    account: 'Outloud',
    aiScore: 15,
    tovScore: 92,
    comments: [],
    hasCreative: true,
    mediaFiles: [
      { id: 'mf-6a', url: '/placeholder/questim-bts.mp4', filename: 'questim-bts.mp4', size: 12400000, type: 'video', mimeType: 'video/mp4', width: 1080, height: 1920, duration: 32 },
    ],
    creativeApproved: true,
    author: 'tade',
    status: 'scheduled',
    scheduledDate: 'Feb 15',
    scheduledTime: '10:00',
    scheduledISO: '2026-02-15T10:00:00Z',
    revisionCount: 0,
    createdAt: '2025-02-11T10:00:00Z',
    themeId: 'theme-2',
  },
  {
    id: '7',
    title: 'Full case study: Questim from 0 to launch',
    platform: 'linkedin',
    account: 'Outloud',
    aiScore: 19,
    tovScore: 96,
    comments: [],
    hasCreative: true,
    mediaFiles: [
      { id: 'mf-7a', url: '/placeholder/questim-case-study.jpg', filename: 'questim-case-study.jpg', size: 1450000, type: 'image', mimeType: 'image/jpeg', width: 1200, height: 627 },
      { id: 'mf-7b', url: '/placeholder/questim-screens.png', filename: 'questim-screens.png', size: 2100000, type: 'image', mimeType: 'image/png', width: 1920, height: 1080 },
    ],
    creativeApproved: true,
    author: 'tade',
    status: 'scheduled',
    scheduledDate: 'Feb 17',
    scheduledTime: '14:00',
    scheduledISO: '2026-02-17T14:00:00Z',
    revisionCount: 0,
    createdAt: '2025-02-10T16:00:00Z',
    themeId: 'theme-1',
  },
  {
    id: '8',
    title: 'Why we stopped doing discovery calls',
    content: 'Discovery calls sound smart until you realize 80% of them end with "let me think about it." We replaced them with async briefs and our close rate went up 40%.',
    platform: 'linkedin',
    account: 'Ondrej',
    aiScore: 14,
    tovScore: 91,
    comments: [],
    hasCreative: false,
    mediaFiles: [],
    creativeApproved: false,
    author: 'tade',
    status: 'missed',
    scheduledDate: 'Feb 10',
    scheduledTime: '10:00',
    scheduledISO: '2026-02-10T10:00:00Z',
    revisionCount: 0,
    createdAt: '2025-02-08T09:00:00Z',
    themeId: 'theme-4',
  },
  {
    id: '9',
    title: 'Product updates Q1 2026',
    content: 'What we shipped in Q1: new onboarding flow, performance dashboard, and API v2. Here is what it means for your workflow.',
    platform: 'linkedin',
    account: 'Outloud',
    aiScore: 20,
    tovScore: 88,
    comments: [],
    hasCreative: true,
    mediaFiles: [
      { id: 'mf-9a', url: '/placeholder/q1-updates.jpg', filename: 'q1-updates.jpg', size: 890000, type: 'image', mimeType: 'image/jpeg', width: 1200, height: 627 },
    ],
    creativeApproved: true,
    author: 'tade',
    status: 'posted',
    scheduledDate: 'Feb 8',
    scheduledTime: '09:00',
    scheduledISO: '2026-02-08T09:00:00Z',
    postUrl: 'https://linkedin.com/posts/outloud-product-updates-q1',
    postedAt: 'Feb 8, 09:15',
    revisionCount: 0,
    createdAt: '2025-02-06T14:00:00Z',
    themeId: 'theme-6',
  },
  {
    id: '10',
    title: 'Hiring: Senior Flutter developer',
    content: 'We are looking for a senior Flutter developer to join our mobile team. You will work on Questim and other products.',
    platform: 'linkedin',
    account: 'Outloud',
    aiScore: 25,
    tovScore: 85,
    comments: [],
    hasCreative: true,
    mediaFiles: [
      { id: 'mf-10a', url: '/placeholder/flutter-hiring.jpg', filename: 'flutter-hiring.jpg', size: 760000, type: 'image', mimeType: 'image/jpeg', width: 1200, height: 627 },
    ],
    creativeApproved: true,
    author: 'tade',
    status: 'scheduled',
    scheduledDate: 'Feb 20',
    scheduledTime: '11:00',
    scheduledISO: '2026-02-20T11:00:00Z',
    revisionCount: 0,
    createdAt: '2025-02-12T11:00:00Z',
    themeId: 'theme-3',
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    postId: '1',
    authorId: 'ondrej',
    content: '"They hired one team" – love this line. But the ending feels weak. Can we add a clearer CTA?',
    createdAt: '2 hours ago',
  },
  {
    id: 'c2',
    postId: '1',
    authorId: 'tade',
    content: 'Good point. Updated – check the new version.',
    createdAt: '1 hour ago',
  },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', postId: '1', userId: 'tade', action: 'created draft', createdAt: 'Feb 13, 14:30' },
  { id: 'a2', postId: '1', action: 'AI Check: 73% detected', createdAt: 'Feb 13, 15:45' },
  { id: 'a3', postId: '1', userId: 'tade', action: 'updated content', createdAt: 'Feb 13, 16:00' },
  { id: 'a4', postId: '1', userId: 'martin', action: 'approved creative', createdAt: 'Feb 14, 09:15' },
];

// ── Content Plan Mock Data ──────────────────────────────────────────────

export const MOCK_CONTENT_PLAN: ContentPlan = {
  id: 'plan-1',
  name: 'Q1 2026 Content Strategy',
  description: 'First quarter content strategy focusing on Questim case study and establishing Outloud voice.',
  startDate: '2026-01-01',
  endDate: '2026-03-31',
  status: 'active',
  northStar: [
    {
      id: 'ns-1',
      icon: '🎯',
      title: 'Pipeline',
      description: 'Create conversations in DMs / intro from network',
      target: '5+ inbound conversations per week',
    },
    {
      id: 'ns-2',
      icon: '⭐',
      title: 'Credibility',
      description: '"These people ship premium products"',
      target: 'Consistent case study presence',
    },
    {
      id: 'ns-3',
      icon: '👥',
      title: 'Hiring (Secondary)',
      description: 'Attract senior talent who want deep work & ownership',
      target: '2+ quality applications per open role',
    },
  ],
  kpis: {
    primary: [
      { label: 'LinkedIn: comments per post, dwell time, clicks' },
      { label: 'Instagram: saves, shares, profile visits' },
      { label: 'DMs: # inbound conversations per week' },
    ],
    secondary: [
      { label: 'Follower growth', note: '(side effect, not goal)' },
      { label: 'Likes', note: '(vanity metric, ignore)' },
    ],
  },
  brandVoiceNotes: 'Outloud Voice = Calm Premium Confidence. 3 Words: Precise / Premium / Pragmatic.',
};

export const MOCK_PILLARS: ContentPillar[] = [
  {
    id: 'pillar-1',
    planId: 'plan-1',
    name: 'Proof of Craft',
    description: 'Motion, UI, micro-interactions, before/after',
    formats: ['Video loops', 'Carousels', 'Screen recordings'],
    frequency: '1-2x per week',
    goal: 'Show craft quality, attract clients',
    color: '#3B82F6',
    sortOrder: 1,
    targetPerMonth: 6,
  },
  {
    id: 'pillar-2',
    planId: 'plan-1',
    name: 'Messy Middle',
    description: 'Rejected concepts, tradeoffs, "this took 3 days"',
    formats: ['Carousel (graveyard of ideas)', 'BTS screenshots'],
    frequency: '1x per week',
    goal: 'Build trust through transparency',
    color: '#8B5CF6',
    sortOrder: 2,
    targetPerMonth: 4,
  },
  {
    id: 'pillar-3',
    planId: 'plan-1',
    name: 'Opinions that Matter',
    description: 'Strategic hot takes, without toxic tone',
    formats: ['Text posts', 'Quote cards', 'Threads'],
    frequency: '1x per week',
    goal: 'Positioning, spark dialogue',
    color: '#F59E0B',
    sortOrder: 3,
    targetPerMonth: 4,
  },
  {
    id: 'pillar-4',
    planId: 'plan-1',
    name: 'Client Voice',
    description: 'Quote/mini-interview, their problem in their words',
    formats: ['Quote card', 'Testimonial carousel'],
    frequency: '2x per month',
    goal: 'Social proof, trust',
    color: '#22C55E',
    sortOrder: 4,
    targetPerMonth: 2,
  },
  {
    id: 'pillar-5',
    planId: 'plan-1',
    name: 'Culture that Ships',
    description: 'Async/deep work/ownership — NOT party lifestyle',
    formats: ['Team photos', 'Process snapshots', 'Hiring posts'],
    frequency: '1-2x per month',
    goal: 'Attract right talent, show culture',
    color: '#EC4899',
    sortOrder: 5,
    targetPerMonth: 2,
  },
];

// Map pillar IDs to theme IDs for progress tracking
export const PILLAR_THEME_MAP: Record<string, string[]> = {
  'pillar-1': ['theme-1'],          // Proof of Craft → Case Study
  'pillar-2': ['theme-2'],          // Messy Middle → Behind the Scenes
  'pillar-3': ['theme-4'],          // Opinions that Matter → Opinion
  'pillar-4': ['theme-1'],          // Client Voice → Case Study (overlaps)
  'pillar-5': ['theme-3', 'theme-7'], // Culture that Ships → Hiring, Personal
};

export const MOCK_CADENCE: CadenceSummary[] = [
  {
    account: 'Outloud',
    weeklyTotal: '6-9 posts',
    monthlyTotal: '~28 posts',
    entries: [
      { id: 'cad-1', planId: 'plan-1', account: 'Outloud', platform: 'linkedin', frequency: '2-3x weekly', days: 'Mon, Wed, Fri (opt)', preferredTime: '10:00' },
      { id: 'cad-2', planId: 'plan-1', account: 'Outloud', platform: 'instagram', frequency: '2-3x weekly', days: 'Cross from LI + native', preferredTime: '14:00' },
      { id: 'cad-3', planId: 'plan-1', account: 'Outloud', platform: 'x', frequency: '2-3x weekly', days: 'Cross-post + threads', preferredTime: 'varies' },
    ],
  },
  {
    account: 'Ondrej',
    weeklyTotal: '4 posts',
    monthlyTotal: '~16 posts',
    entries: [
      { id: 'cad-4', planId: 'plan-1', account: 'Ondrej', platform: 'linkedin', frequency: '2x weekly', days: 'Tue, Thu', preferredTime: '09:00' },
      { id: 'cad-5', planId: 'plan-1', account: 'Ondrej', platform: 'x', frequency: '2x weekly', days: 'Cross-post + native', preferredTime: 'varies' },
    ],
  },
];

export const MOCK_COMBINED_GRID: CombinedWeeklyGrid[] = [
  { platform: 'LI', days: { Mon: 'OL', Tue: 'OK', Wed: 'OL', Thu: 'OK', Fri: 'OL?', Sat: '-', Sun: '-' } },
  { platform: 'X', days: { Mon: 'OL', Tue: 'OK', Wed: 'OL', Thu: 'OK', Fri: 'OL?', Sat: '-', Sun: '-' } },
  { platform: 'IG', days: { Mon: 'OL', Tue: '-', Wed: 'OL', Thu: '-', Fri: 'OL?', Sat: '-', Sun: '-' } },
];

export const MOCK_WEEKLY_SLOTS: WeeklySlot[] = [
  {
    id: 'ws-1',
    planId: 'plan-1',
    dayOfWeek: 'Monday',
    slotName: 'Post A — Cross-platform Hero',
    account: 'Outloud',
    goal: 'Reach + clicks + top-of-funnel credibility',
    formats: ['Video loop', 'Motion showcase', 'Carousel (5 slides)'],
    pillar: 'Proof of Craft or Messy Middle',
    ctaExamples: ['Want a breakdown?', 'Which detail do you struggle with?'],
  },
  {
    id: 'ws-2',
    planId: 'plan-1',
    dayOfWeek: 'Tuesday',
    slotName: 'Ondrej — Founder POV',
    account: 'Ondrej',
    goal: 'Authority + network + inbound intros',
    formats: ['Talking head video (30-90s)', 'Text post (150-250 words)'],
    pillar: 'Opinions that Matter',
    topics: ['Opinions', 'Decisions', 'Frameworks', '"Why we said no"'],
  },
  {
    id: 'ws-3',
    planId: 'plan-1',
    dayOfWeek: 'Wednesday / Friday',
    slotName: 'Post B — Platform-native',
    account: 'Outloud',
    goal: 'Comments (dialogue density) + positioning',
    formats: ['LI text post', 'LI doc carousel', 'Quote card on IG'],
    pillar: 'Opinions that Matter or Culture that Ships',
    ctaExamples: ['Question', 'A/B choice', 'Spark debate'],
  },
  {
    id: 'ws-4',
    planId: 'plan-1',
    dayOfWeek: 'Thursday',
    slotName: 'Ondrej — Founder POV',
    account: 'Ondrej',
    goal: 'Authority + network + inbound intros',
    formats: ['BTS snippets', 'Mini-carousel (3 slides)', 'Decision moments'],
    pillar: 'Messy Middle or Culture that Ships',
    topics: ['BTS', 'Decision-making', 'Team discussions'],
  },
];

export const MOCK_MONTHLY_PROGRAM: MonthlyWeek[] = [
  {
    weekNumber: 1,
    weekName: 'Establish Voice',
    postA: { description: 'Proof of Craft (showreel snippet)', format: 'Video loop' },
    postB: { description: 'Hot take (strategic, biz)', format: 'Text post' },
    ondrejTue: '"Why we stopped X"',
    ondrejThu: 'Talking head opinion',
  },
  {
    weekNumber: 2,
    weekName: 'Messy Middle',
    postA: { description: 'Graveyard of Ideas (3 rejected + why)', format: 'Carousel' },
    postB: { description: 'Behind the build (screenshot + bullets)', format: 'LI doc' },
    ondrejTue: '"How I think about..."',
    ondrejThu: 'BTS decision moment',
  },
  {
    weekNumber: 3,
    weekName: 'Build Trust',
    postA: { description: 'Trust micro-details (micro-interactions)', format: 'Video loop' },
    postB: { description: 'Lie → Truth → Evidence', format: 'Carousel' },
    ondrejTue: 'Unpopular opinion',
    ondrejThu: 'Framework carousel',
  },
  {
    weekNumber: 4,
    weekName: 'Package & Amplify',
    postA: { description: 'Before/After (relative metrics)', format: 'Carousel' },
    postB: { description: 'Client voice (quote + context)', format: 'Quote card' },
    ondrejTue: 'Lessons from failure',
    ondrejThu: 'Culture/async take',
  },
];

export const MOCK_MONTHLY_THEMES: MonthlyTheme[] = [
  { id: 'mt-1', month: 'Feb 2026', themeName: 'Questim Case Study', emoji: '🎮', status: 'current' },
  { id: 'mt-2', month: 'Mar 2026', themeName: 'IDS BK Case Study', emoji: '🚌', status: 'planned' },
  { id: 'mt-3', month: 'Apr 2026', themeName: 'Hiring Campaign', emoji: '👥', status: 'planned' },
];

export const MOCK_TEAM_RESPONSIBILITIES: TeamMember[] = [
  {
    userId: 'tade',
    responsibilities: [
      'Copy for all posts',
      'Briefs for Martin',
      'Scheduling',
      'Monitoring & reports',
      'Video editing support',
      'Making of creatives',
    ],
  },
  {
    userId: 'martin',
    responsibilities: [
      'Motion graphics (2-3x/month)',
      'Brand check',
      'Creative approval',
    ],
  },
  {
    userId: 'ondrej',
    responsibilities: [
      'Final approval (all content)',
      'Personal posts (8x/month)',
      'Talking head videos',
      'Engagement on debates',
      'Provide insights/photos',
    ],
  },
];

export const MOCK_WORKFLOW: WorkflowStep[] = [
  { step: 1, who: 'ondrej', day: 'Mon', task: 'Send Tade 2-3 content ideas', time: '5 min' },
  { step: 2, who: 'tade', day: 'Tue', task: 'Write + schedule Week N+1', time: '2 hours' },
  { step: 3, who: 'martin', day: 'Wed', task: 'Create motion/graphics for Week N+1', time: '2 hours' },
  { step: 4, who: 'ondrej', day: 'Wed', task: 'Approve content for Week N+1', time: '15 min' },
  { step: 5, who: 'tade', day: 'Thu', task: 'Schedule in Buffer + checklist', time: '20 min' },
  { step: 6, who: 'tade', day: 'Fri', task: 'Review: comments / saves / clicks', time: '15 min' },
];

export const MOCK_BRAND_VOICE = {
  tagline: 'Outloud Voice = Calm Premium Confidence',
  threeWords: ['Precise', 'Premium', 'Pragmatic'],
  dos: [
    'Short sentences, clear point',
    'No hype, no "best/revolutionary"',
    'Craft + systems thinking + shipping',
    'Structure: decision → reason → outcome',
  ],
  donts: [
    '"We are thrilled to announce..."',
    '"Proud to share..."',
    '"Humbled..."',
    '"Game-changer", "revolutionary", "excited"',
    'Marketing superlatives, excessive emojis',
    'Generic "Trends for 2026" content',
  ],
};

// ── Tone of Voice Mock Data ──────────────────────────────────────────

export const MOCK_TOV_GUIDELINES: TovGuideline[] = [
  {
    id: 'tg-1',
    title: 'Short sentences, clear point',
    content: 'Every sentence should earn its place. If it doesn\'t add value, cut it.',
    sortOrder: 1,
  },
  {
    id: 'tg-2',
    title: 'No hype, no "best/revolutionary"',
    content: 'We don\'t need superlatives. Our work speaks for itself.',
    sortOrder: 2,
  },
  {
    id: 'tg-3',
    title: 'Craft + systems thinking + shipping',
    content: 'Talk about how we build, not just what we build. Show the process.',
    sortOrder: 3,
  },
  {
    id: 'tg-4',
    title: 'Decision \u2192 Reason \u2192 Outcome',
    content: 'Structure content as: what we decided, why, and what happened.',
    sortOrder: 4,
  },
];

export const MOCK_TOV_WRITING_STYLE: WritingStyleRule[] = [
  {
    id: 'ws-style-1',
    title: 'Sentence Length',
    content: 'Mix short punchy sentences with longer explanatory ones. Avoid walls of text. Break it up.',
  },
  {
    id: 'ws-style-2',
    title: 'Paragraphs',
    content: '1-3 sentences max. On social, single sentences as paragraphs work well.',
  },
  {
    id: 'ws-style-3',
    title: 'Punctuation',
    content: 'Use em dashes \u2014 they add rhythm. Avoid exclamation marks!!!',
  },
  {
    id: 'ws-style-4',
    title: 'Emojis',
    content: 'Minimal. 0-2 per post max. Never in the hook. Never multiple in a row.',
  },
];

export const MOCK_TOV_DOS: TovDo[] = [
  { item: 'Be specific with numbers and details', example: '"16 months, 4 tournaments, \u20AC17k in prizes"' },
  { item: 'Show the messy middle', example: '"We rejected 3 concepts before landing on this"' },
  { item: 'Use "we" naturally', example: '"We shipped this in 6 weeks" not "The team delivered"' },
  { item: 'Ask genuine questions', example: '"Which approach would you take?"' },
  { item: 'Admit tradeoffs', example: '"We chose speed over perfection here. Here\'s why."' },
  { item: 'End with value, not ask', example: 'Link to case study, not "Follow for more!"' },
];

export const MOCK_TOV_DONTS: TovDont[] = [
  { phrase: '"We are thrilled to announce..."', fix: 'Just announce it. "We shipped X."' },
  { phrase: '"Proud to share..."', fix: 'Share without the preamble.' },
  { phrase: '"Humbled by..."', fix: 'Just say thank you or skip it.' },
  { phrase: '"Game-changer", "revolutionary", "disruptive"', fix: 'Describe what it actually does.' },
  { phrase: '"Can\'t wait to...", "Excited to..."', fix: 'Just do/share the thing.' },
  { phrase: 'Multiple emojis \uD83D\uDE80\uD83D\uDD25\uD83D\uDCAA', fix: 'One or none. Let words do the work.' },
  { phrase: '"Follow for more tips!"', fix: 'End with substance, not begging.' },
  { phrase: 'Generic hooks like "Trends for 2026"', fix: 'Be specific. "3 patterns we saw in fintech apps this quarter"' },
];

export const MOCK_TOV_EXAMPLES: TovExample[] = [
  {
    id: 'ex-1',
    type: 'good',
    title: 'Questim Case Study Hook',
    afterText: 'Questim needed a name, a brand, a game, a mobile app, a tournament system, an advertising platform, a back-office, and anti-cheat protection.\n\nThey hired one team.\n\n16 months later: live in CZ/SK, 4 prize tournaments with \u20AC17,000+ in real rewards, and 2,000+ competing players.',
    explanation: 'Specific numbers. Short punchy line in the middle. Shows scope without bragging. No fluff words.',
    tags: ['numbers', 'scope', 'case-study'],
    sortOrder: 1,
  },
  {
    id: 'ex-2',
    type: 'bad_to_good',
    title: 'Announcement Transformation',
    beforeText: 'We are thrilled to announce our revolutionary new partnership with an amazing client! \uD83D\uDE80\uD83D\uDD25 Can\'t wait to share more about this game-changing project that will disrupt the industry! Stay tuned! \uD83D\uDCAA',
    afterText: 'New project: building a tournament platform for casual mobile gamers. Real prizes, no entry fees, no forced ads. First prototype in 6 weeks. Will share the design process as we go.',
    explanation: 'Removed "thrilled", "revolutionary", "game-changing", "disrupt". Removed excessive emojis. Added specifics: what, for whom, timeline. Ended with value (will share process) not ask (stay tuned).',
    tags: ['transformation', 'announcement'],
    sortOrder: 2,
  },
  {
    id: 'ex-3',
    type: 'hook',
    title: 'Hook Examples',
    afterText: 'Users don\'t trust your \'free prize\' app. Here\'s how to fix it.\nWe killed a feature 3 days before launch. Best decision we made.\nOne team built this. Here\'s why that matters.\nThe ticket purchase took 2 taps. It used to take 7.',
    explanation: 'Pattern: Specific claim or contrast. No hype. Curiosity through substance, not clickbait.',
    tags: ['hooks', 'openers'],
    sortOrder: 3,
  },
];

export const MOCK_VOICE_SPLIT: VoiceSplitAccount[] = [
  {
    account: 'Outloud',
    voiceName: 'Studio Voice',
    characteristics: [
      'Objective, proof-driven',
      'Focus on craft and process',
      '"We built" not "I think"',
      'Case studies, BTS, hiring',
      'More visual content (carousels, videos)',
    ],
    example: 'The ticket purchase flow went from 7 steps to 2. Here\'s how we approached the redesign and what we learned about user trust.',
  },
  {
    account: 'Ondrej',
    voiceName: 'Founder Voice',
    characteristics: [
      'Opinionated, decision-focused',
      '"I" and personal experience',
      'Lessons, frameworks, hot takes',
      'More text-heavy, threads',
      'Can be more direct/provocative',
    ],
    example: 'I stopped doing discovery calls 2 years ago. Controversial? Maybe. But here\'s what happened to our close rate and why I\'d do it again.',
    topics: [
      'Business decisions and reasoning',
      'Scaling without VC',
      'Design-to-CEO journey',
      'Remote/async work philosophy',
      'Occasional personal (longevity, life philosophy)',
    ],
  },
];

export const MOCK_VOICE_COMPARISON: VoiceComparison[] = [
  { aspect: 'Pronoun', outloud: '"We"', ondrej: '"I"' },
  { aspect: 'Tone', outloud: 'Objective', ondrej: 'Opinionated' },
  { aspect: 'Content', outloud: 'Proof of work', ondrej: 'Lessons & takes' },
  { aspect: 'Format', outloud: 'Visuals, carousels', ondrej: 'Text, threads' },
  { aspect: 'CTA', outloud: '"See case study"', ondrej: '"DM me if..."' },
];

export const MOCK_BLOCKED_PHRASES: TovBlockedPhrase[] = [
  { id: 'bp-1', phrase: 'thrilled to announce', suggestion: 'Just announce it directly', severity: 'error', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-2', phrase: 'proud to share', suggestion: 'Share without the preamble', severity: 'error', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-3', phrase: 'humbled', suggestion: 'Say thank you or skip it', severity: 'error', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-4', phrase: 'game-changer', suggestion: 'Describe the specific impact', severity: 'error', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-5', phrase: 'revolutionary', suggestion: 'Describe what it actually does', severity: 'error', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-6', phrase: 'disruptive', suggestion: 'Be specific about the change', severity: 'error', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-7', phrase: 'excited to', suggestion: 'Just do/share the thing', severity: 'warning', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-8', phrase: "can't wait", suggestion: 'Just do/share the thing', severity: 'warning', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-9', phrase: 'stay tuned', suggestion: 'End with substance instead', severity: 'warning', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-10', phrase: 'follow for more', suggestion: 'End with value, not ask', severity: 'warning', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-11', phrase: '\uD83D\uDE80\uD83D\uDD25', suggestion: 'Use one emoji or none', severity: 'warning', appliesTo: ['outloud', 'ondrej'] },
  { id: 'bp-12', phrase: '\uD83D\uDCAA\uD83C\uDF89', suggestion: 'Use one emoji or none', severity: 'warning', appliesTo: ['outloud', 'ondrej'] },
];
