# Outloud Content Hub – Technical Specification

## Project Overview

**Name:** Outloud Content Hub  
**Type:** Web application (Next.js)  
**Purpose:** Internal content management system for Outloud's social media workflow  
**Users:** 3 people (Tade, Martin, Ondrej) with role-based permissions

### Core Problem
Currently using Notion + Buffer + Slack = 3 disconnected tools. Content approval is slow, ToV consistency is manual, and there's no AI detection check before publishing.

### Solution
Single web app with:
- Kanban-based content pipeline
- Role-based approval workflow
- AI detection scoring
- Tone of Voice checking against Outloud brand guidelines
- Team comments with avatars
- Scheduling (manual for MVP, auto-post in v1.0)

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (customized to Outloud brand)
- **State:** React hooks + Zustand (for global state)
- **Icons:** Lucide React

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (magic link or Google OAuth)
- **Storage:** Supabase Storage (for creative assets)
- **Real-time:** Supabase Realtime (for comments, status updates)

### AI/ML Services
- **AI Detection:** GPTZero API or Originality.ai API
- **ToV Check:** Claude API (Anthropic) with custom prompt

### Deployment
- **Hosting:** Vercel
- **Domain:** contenthub.outloud.sk (or similar)

---

## Brand Guidelines

### Colors
```css
:root {
  /* Backgrounds */
  --bg-primary: #0A0A0A;
  --bg-secondary: #141414;
  --bg-tertiary: #1A1A1A;
  
  /* Borders */
  --border-subtle: #1A1A1A;
  --border-default: #2A2A2A;
  --border-hover: #3A3A3A;
  
  /* Accent - Outloud Orange Gradient */
  --accent-start: #E85A2C;
  --accent-end: #8B2E1A;
  --accent-solid: #E85A2C;
  
  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #9A9A9A;
  --text-muted: #6A6A6A;
  --text-disabled: #4A4A4A;
  
  /* Status Colors */
  --success: #34C759;
  --warning: #FFB800;
  --error: #FF3B30;
  --info: #3B82F6;
  
  /* Role Colors */
  --role-tade: #E85A2C;
  --role-martin: #3B82F6;
  --role-ondrej: #8B5CF6;
  
  /* Platform Colors */
  --platform-linkedin: #0A66C2;
  --platform-x: #1D1D1D;
  --platform-instagram: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
}
```

### Typography
- **Font Family:** Inter (fallback: -apple-system, system-ui, sans-serif)
- **Headings:** Semibold (600)
- **Body:** Regular (400) / Medium (500)
- **Sizes:** 11px (labels), 12px (small), 13px (body), 14px (body-lg), 16-24px (headings)

### Logo
- **Location:** `/public/logo/outloud-logo.svg` (to be uploaded)
- **Favicon:** `/public/favicon.ico`
- **App icon:** Orange gradient square with "O"

---

## Database Schema (Supabase)

### Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'designer', 'approver')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social accounts (LinkedIn, X, Instagram)
CREATE TABLE accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL, -- 'Outloud' or 'Ondrej'
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'x', 'instagram')),
  platform_user_id TEXT, -- For future API integration
  access_token TEXT, -- Encrypted, for future API integration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'design_review', 'final_review', 'approved', 'scheduled', 'posted')),
  
  -- AI & ToV scores
  ai_score INTEGER, -- 0-100
  ai_flagged_phrases JSONB, -- ["phrase1", "phrase2"]
  tov_score INTEGER, -- 0-100
  tov_suggestions JSONB, -- ["suggestion1", "suggestion2"]
  last_checked_at TIMESTAMP WITH TIME ZONE,
  
  -- Creative
  creative_urls TEXT[], -- Array of storage URLs
  creative_approved BOOLEAN DEFAULT FALSE,
  creative_approved_by UUID REFERENCES profiles(id),
  creative_approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Final approval
  final_approved BOOLEAN DEFAULT FALSE,
  final_approved_by UUID REFERENCES profiles(id),
  final_approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  post_url TEXT, -- URL to the live post after publishing
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log
CREATE TABLE activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'ai_checked', 'approved', 'scheduled', 'posted'
  details JSONB, -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content pillars (for Content Plan feature in v1.5)
CREATE TABLE content_pillars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color
  target_per_month INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post to pillar relationship
ALTER TABLE posts ADD COLUMN pillar_id UUID REFERENCES content_pillars(id);
```

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Posts: All authenticated users can view, role-based create/update
CREATE POLICY "Posts are viewable by authenticated users" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all posts" ON posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Designers can update creative approval" ON posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'designer')
  );

CREATE POLICY "Approvers can update final approval" ON posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'approver')
  );

-- Comments: All authenticated users can create and view
CREATE POLICY "Comments are viewable by authenticated users" ON comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## File Structure

```
outloud-content-hub/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Redirect to /dashboard
│   ├── globals.css             # Tailwind + custom CSS variables
│   ├── (auth)/
│   │   ├── login/page.tsx      # Login page
│   │   └── callback/route.ts   # OAuth callback
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── dashboard/page.tsx  # Main Kanban view
│   │   ├── posts/
│   │   │   └── [id]/page.tsx   # Post detail/edit page
│   │   ├── calendar/page.tsx   # Calendar view (v1.5)
│   │   ├── plan/page.tsx       # Content plan (v1.5)
│   │   └── settings/page.tsx   # Settings
│   └── api/
│       ├── ai-check/route.ts   # AI detection endpoint
│       ├── tov-check/route.ts  # ToV check endpoint
│       └── webhooks/
│           └── supabase/route.ts
├── components/
│   ├── ui/                     # shadcn/ui components (customized)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   └── sheet.tsx           # For slide-over panel
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── user-menu.tsx
│   ├── posts/
│   │   ├── post-card.tsx
│   │   ├── post-detail-panel.tsx
│   │   ├── post-editor.tsx
│   │   ├── kanban-column.tsx
│   │   ├── kanban-board.tsx
│   │   ├── ai-check-card.tsx
│   │   ├── tov-check-card.tsx
│   │   ├── creative-upload.tsx
│   │   ├── platform-badge.tsx
│   │   └── status-pill.tsx
│   ├── comments/
│   │   ├── comment-thread.tsx
│   │   └── comment-input.tsx
│   └── activity/
│       └── activity-log.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware
│   ├── ai/
│   │   ├── detection.ts        # GPTZero/Originality API
│   │   └── tov-check.ts        # Claude API for ToV
│   ├── utils.ts                # Utility functions
│   └── constants.ts            # App constants
├── hooks/
│   ├── use-posts.ts            # Posts CRUD hooks
│   ├── use-comments.ts         # Comments hooks
│   ├── use-realtime.ts         # Supabase realtime subscription
│   └── use-user.ts             # Current user hook
├── stores/
│   └── app-store.ts            # Zustand store
├── types/
│   ├── database.ts             # Supabase generated types
│   └── index.ts                # App types
├── public/
│   ├── logo/
│   │   └── outloud-logo.svg    # Outloud logo (to be added)
│   └── favicon.ico
├── .env.local                  # Environment variables
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## API Endpoints

### Internal API Routes

#### `POST /api/ai-check`
Check content for AI detection score.

```typescript
// Request
{
  content: string;
  postId: string;
}

// Response
{
  score: number; // 0-100
  flaggedPhrases: string[];
  suggestions: string[];
}
```

#### `POST /api/tov-check`
Check content against Outloud Tone of Voice guidelines.

```typescript
// Request
{
  content: string;
  postId: string;
  account: 'outloud' | 'ondrej'; // Different ToV for each
}

// Response
{
  score: number; // 0-100
  issues: Array<{
    phrase: string;
    suggestion: string;
    severity: 'minor' | 'major';
  }>;
}
```

### ToV Check Prompt (Claude API)

```typescript
const TOV_SYSTEM_PROMPT = `You are a Tone of Voice checker for Outloud, a design-led software house.

OUTLOUD VOICE = Calm Premium Confidence
- Short sentences, clear point
- No hype, no "best/revolutionary"
- Craft + systems thinking + shipping
- Structure: decision → reason → outcome

3 WORDS: Precise / Premium / Pragmatic

ANTI-VOICE (NEVER use):
- "We are thrilled to announce..."
- "Proud to share..."
- "Humbled..."
- "Game-changer", "revolutionary", "excited"
- Marketing superlatives, excessive emojis
- Generic 'Trends for 2026' content

VOICE SPLIT:
- Outloud account: Studio voice (objective, proof, craft)
- Ondrej account: Founder voice (opinionated, decisions, lessons)

Analyze the following content and return:
1. A score from 0-100 (100 = perfect Outloud voice)
2. Specific phrases that don't match the voice
3. Concrete suggestions for improvement

Return JSON only.`;
```

---

## User Roles & Permissions

| Action | Tade (admin) | Martin (designer) | Ondrej (approver) |
|--------|--------------|-------------------|-------------------|
| Create post | ✅ | ❌ | ❌ |
| Edit post content | ✅ | ❌ | ✅ (can suggest) |
| Upload creative | ✅ | ✅ | ❌ |
| Approve creative | ❌ | ✅ | ❌ |
| Final approval | ❌ | ❌ | ✅ |
| Schedule post | ✅ | ❌ | ❌ |
| Add comments | ✅ | ✅ | ✅ |
| View all posts | ✅ | ✅ (filtered) | ✅ (filtered) |
| Manage settings | ✅ | ❌ | ❌ |

### Role-based Views

**Tade (admin):**
- Full Kanban board with all columns
- Can drag posts between columns
- Access to all features

**Martin (designer):**
- Sees only "Design Review" queue
- Can approve/reject creative
- Can upload new creative
- Can add comments

**Ondrej (approver):**
- Sees only "Final Review" queue
- Can approve or return posts
- Can edit content (inline)
- Can add comments

---

## MVP Features Checklist

### Phase 1: Core (Week 1-2)
- [ ] Project setup (Next.js, Tailwind, Supabase)
- [ ] Auth (magic link login)
- [ ] Database schema + seed data
- [ ] Basic layout (sidebar, header)
- [ ] Post list/Kanban view
- [ ] Post detail panel (slide-over)
- [ ] Post editor (create/edit)
- [ ] Role-based routing

### Phase 2: Workflow (Week 2-3)
- [ ] Drag & drop between columns
- [ ] Status change logic
- [ ] Creative upload (Supabase Storage)
- [ ] Creative approval (Martin)
- [ ] Final approval (Ondrej)
- [ ] Comments with real-time updates
- [ ] Activity log

### Phase 3: AI Features (Week 3-4)
- [ ] AI detection integration (GPTZero)
- [ ] ToV check integration (Claude API)
- [ ] Score display on cards
- [ ] Flagged phrases highlighting
- [ ] Re-check button
- [ ] Auto-check on content change (debounced)

### Phase 4: Polish (Week 4)
- [ ] Keyboard shortcuts (N, ⌘S, ⌘Enter)
- [ ] Search/filter posts
- [ ] Notifications (in-app)
- [ ] Empty states
- [ ] Loading states
- [ ] Error handling
- [ ] Mobile responsive (basic)

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# AI Detection (choose one)
GPTZERO_API_KEY=xxx
# or
ORIGINALITY_API_KEY=xxx

# Claude API (for ToV check)
ANTHROPIC_API_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Generate Supabase types
npx supabase gen types typescript --project-id xxx > types/database.ts

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "zustand": "^4.5.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "lucide-react": "^0.330.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^3.3.0",
    "@anthropic-ai/sdk": "^0.14.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "supabase": "^1.142.0"
  }
}
```

---

## Future Versions

### v1.0 (After MVP)
- Auto-posting via LinkedIn/X APIs
- Email notifications
- Bulk actions

### v1.5
- Calendar view
- Content Plan with pillars
- Basic analytics (import from platforms)

### v2.0
- Multi-brand support
- Asset library
- AI-assisted drafting
- Advanced analytics

---

## Notes for Development

1. **Start with the mockup** – The React mockup (`outloud-content-hub.jsx`) is the visual reference. Match it closely.

2. **Mobile is secondary** – This is a desktop-first tool. Basic mobile support is fine, but don't over-invest.

3. **Real-time matters** – Comments and status changes should update in real-time using Supabase Realtime.

4. **AI checks are debounced** – Don't hit the API on every keystroke. Wait 2 seconds after typing stops.

5. **Keep it simple** – This is MVP. Don't over-engineer. Ship fast, iterate based on usage.

6. **Outloud brand** – Dark UI, orange accents, clean typography. Reference the Brand Identity PDF for details.
