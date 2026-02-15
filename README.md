# Outloud Content Hub

Internal content management system for Outloud's social media workflow. Replaces the disconnected Notion + Buffer + Slack setup with a single web app.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Auth:** Google OAuth with auto-profile creation
- **Deployment:** Vercel

## Features

- Kanban-based content pipeline (Draft > Design Review > Final Review > Approved > Scheduled > Posted)
- Role-based views (Admin, Designer, Approver)
- Real-time sync across all users via Supabase Realtime
- Content Library with filtering and search
- Calendar view (month/week) for scheduled posts
- Content Plan with pillars, cadence, weekly/monthly grids
- Tone of Voice guidelines, dos/don'ts, examples, voice split
- ToV Checker for content validation
- Media upload with drag & drop
- Theme switching (light/dark/system), accent colors, compact mode
- Keyboard shortcuts

## Team & Roles

| User | Role | Permissions |
|------|------|-------------|
| Tade | Admin | Create posts, upload creative, schedule, manage settings |
| Martin | Designer | Upload creative, approve/reject creative, comment |
| Ondrej | Approver | Final approval, edit content, comment |

## Setup

```bash
cd outloud-content-hub
npm install
npm run dev
```

### Environment Variables

Create `outloud-content-hub/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database

Run `outloud-content-hub/lib/supabase/schema.sql` in the Supabase SQL Editor to create all tables, RLS policies, and triggers.

Seed data: `outloud-content-hub/lib/supabase/seed.sql`

### Supabase Configuration

1. **Auth:** Enable Google OAuth provider with your Google Cloud credentials
2. **Realtime:** Enable replication on all tables (Database > Replication)
3. **Storage:** The schema creates a `media` bucket automatically

## Project Structure

```
Outloud/
├── README.md              # This file
├── CLAUDE.md              # Technical specification
└── outloud-content-hub/   # Next.js application
    ├── app/               # Pages and API routes
    ├── components/        # UI components
    ├── hooks/             # Supabase data hooks
    ├── providers/         # React context providers
    ├── stores/            # Zustand (UI-only state)
    ├── lib/               # Utilities, Supabase clients, constants
    └── types/             # TypeScript types
```

## Deploy

```bash
cd outloud-content-hub
vercel --prod
```

Add all `.env.local` variables to Vercel project settings. Update the Supabase Auth redirect URL to match your production domain.
