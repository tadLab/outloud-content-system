# Outloud Content Hub – v1.3 Features

## Overview

This document covers features for v1.3, building on MVP (`CLAUDE.md`), v1.1 (`V1.1-FEATURES.md`), and v1.2 (`V1.2-FEATURES.md`).

---

## Feature 1: Remove "View As" Panel from Posts Page

### Problem
The "View as: Tade / Martin / Ondrej" role switcher is useful on Dashboard (Kanban) for demo/testing purposes, but it's confusing and irrelevant on the Posts page.

### Solution
- Show "View as" panel **only** on Dashboard (`/dashboard`)
- Hide it on Posts (`/posts`), Calendar (`/calendar`), Settings (`/settings`), and Content Plan (`/plan`)

### Implementation

```typescript
// In layout.tsx or header component
const pathname = usePathname();
const showRoleSwitcher = pathname === '/dashboard';

return (
  <>
    <Header />
    {showRoleSwitcher && <RoleSwitcherPanel />}
    {children}
  </>
);
```

### Alternative: Move to Settings
For production, consider moving role switcher to Settings > Team as "Impersonate user" (admin only) for support/debugging purposes.

---

## Feature 2: Differentiate Posts Page from Dashboard

### Problem
Dashboard (Kanban) and Posts page serve similar purposes. The pencil icon (✎) suggests "create/edit" but leads to a page that looks like another dashboard.

### Solution
Make Posts page distinctly different with focus on:
1. **Content Library** – All posts in searchable table/grid
2. **Quick Actions** – Bulk operations, exports
3. **Analytics Preview** – Performance stats per post
4. **Templates** – Saved post templates

### Renamed: "Posts" → "Content Library"

### UI: Content Library Page

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ◉ Outloud Content Hub                                           [Tade ●]      │
├─────────┬──────────────────────────────────────────────────────────────────────┤
│         │                                                                       │
│  ◫      │  Content Library                                      [+ New Post]   │
│  Dashboard                                                                      │
│         │  ┌─ Stats Bar ────────────────────────────────────────────────────┐  │
│  📚     │  │  Total: 47    Draft: 8    In Review: 5    Scheduled: 12        │  │
│  Library←│  │  Posted this month: 22   Avg. engagement: 4.2%                 │  │
│         │  └────────────────────────────────────────────────────────────────┘  │
│  📅     │                                                                       │
│  Calendar│  ┌─ Tabs ────────────────────────────────────────────────────────┐  │
│         │  │  [All Posts]  [Drafts]  [Scheduled]  [Posted]  [Templates]     │  │
│  ☰      │  └────────────────────────────────────────────────────────────────┘  │
│  Content│                                                                       │
│  Plan   │  ┌─ Search & Filter ──────────────────────────────────────────────┐  │
│         │  │ 🔍 Search...  [Platform▾] [Account▾] [Theme▾] [Date▾] [Sort▾]  │  │
│  ⚙️     │  └────────────────────────────────────────────────────────────────┘  │
│  Settings│                                                                       │
│         │  ┌─ Post Table ───────────────────────────────────────────────────┐  │
│         │  │ ☐ │ Platform │ Title              │ Theme    │ Status  │ Date  │  │
│         │  │───┼──────────┼────────────────────┼──────────┼─────────┼───────│  │
│         │  │ ☐ │ ▣ LI     │ Questim case study │ Case St. │ Draft   │ Feb 13│  │
│         │  │ ☐ │ ▣ X      │ Why we don't do... │ Opinion  │ Approved│ Feb 12│  │
│         │  │ ☐ │ ▣ LI     │ Hiring designers   │ Hiring   │ Sched.  │ Feb 15│  │
│         │  │ ☐ │ ▣ IG     │ Behind the scenes  │ BTS      │ Posted  │ Feb 10│  │
│         │  │ ☐ │ ▣ LI     │ IDS BK tickets     │ Case St. │ Posted  │ Feb 8 │  │
│         │  └────────────────────────────────────────────────────────────────┘  │
│         │                                                                       │
│         │  ┌─ Pagination ───────────────────────────────────────────────────┐  │
│         │  │  ← Previous    Page 1 of 5    Next →       Showing 10 of 47    │  │
│         │  └────────────────────────────────────────────────────────────────┘  │
│         │                                                                       │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

### Key Differences: Dashboard vs Content Library

| Aspect | Dashboard | Content Library |
|--------|-----------|-----------------|
| **View** | Kanban (visual pipeline) | Table (data-focused) |
| **Purpose** | Workflow management | Content archive & search |
| **Focus** | What needs action now | Find any post ever |
| **Actions** | Drag & drop, quick approve | Bulk select, export, analytics |
| **Filtering** | Basic (this week) | Advanced (date range, multiple filters) |
| **Analytics** | None | Per-post performance preview |

### Sidebar Icon Change

```
Old:  ✎ Posts
New:  📚 Library  (or use a grid/archive icon)
```

### Templates Tab

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Templates                                                    [+ New Template]  │
│                                                                                 │
│  Save time by creating reusable post structures.                                │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │  📄 Case Study Template                                                   │ │
│  │     "{{client}} needed {{problem}}. We built {{solution}}. Results:..."   │ │
│  │     Used 12 times · Last used Feb 10                                      │ │
│  │                                                          [Use] [Edit] [×] │ │
│  │                                                                           │ │
│  ├───────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                           │ │
│  │  📄 Hiring Announcement                                                   │ │
│  │     "We're looking for a {{role}} to join our {{team}} team..."           │ │
│  │     Used 5 times · Last used Jan 28                                       │ │
│  │                                                          [Use] [Edit] [×] │ │
│  │                                                                           │ │
│  ├───────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                           │ │
│  │  📄 Opinion Thread (X)                                                    │ │
│  │     "Hot take: {{opinion}}. Here's why: 1. {{reason1}} 2. {{reason2}}..." │ │
│  │     Used 8 times · Last used Feb 5                                        │ │
│  │                                                          [Use] [Edit] [×] │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Database: Templates

```sql
CREATE TABLE templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT, -- Optional: pre-select platform
  account_id UUID REFERENCES accounts(id), -- Optional: pre-select account
  theme_id UUID REFERENCES themes(id), -- Optional: pre-select theme
  variables JSONB, -- ["client", "problem", "solution"]
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Feature 3: Calendar Page

### Purpose
Visual calendar showing:
- Scheduled posts (future)
- Posted content (past)
- Gaps in content schedule
- Expired scheduled posts (missed)

### UI: Calendar Page Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ◉ Outloud Content Hub                                           [Tade ●]      │
├─────────┬──────────────────────────────────────────────────────────────────────┤
│         │                                                                       │
│  ◫      │  Calendar                              [◀ Feb 2026 ▶]  [Month][Week] │
│  Dashboard                                                                      │
│         │  ┌─ Legend ───────────────────────────────────────────────────────┐  │
│  📚     │  │  ● Scheduled   ● Posted   ● Missed (expired)   ○ Gap          │  │
│  Library│  └────────────────────────────────────────────────────────────────┘  │
│         │                                                                       │
│  📅 ←   │  ┌─ Calendar Grid ────────────────────────────────────────────────┐  │
│  Calendar│  │                                                                │  │
│         │  │   Mon        Tue        Wed        Thu        Fri        Sat   │  │
│  ☰      │  │ ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐  │  │
│  Content│  │ │   10   ││   11   ││   12   ││   13   ││   14   ││   15   │  │  │
│  Plan   │  │ │        ││ ▣ LI ● ││        ││ ▣ X  ● ││ ▣ LI ● ││ ▣ IG ○ │  │  │
│         │  │ │        ││ Posted ││  GAP   ││ Posted ││ Sched. ││ Sched. │  │  │
│  ⚙️     │  │ │        ││        ││        ││        ││ 10:00  ││ 14:00  │  │  │
│  Settings│  │ └────────┘└────────┘└────────┘└────────┘└────────┘└────────┘  │  │
│         │  │ ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐  │  │
│         │  │ │   17   ││   18   ││   19   ││   20   ││   21   ││   22   │  │  │
│         │  │ │ ▣ LI ○ ││        ││ ▣ X  ⚠ ││ ▣ LI ○ ││        ││        │  │  │
│         │  │ │ Sched. ││  GAP   ││ MISSED ││ Sched. ││  GAP   ││  GAP   │  │  │
│         │  │ │ 09:00  ││        ││ 10:00  ││ 14:00  ││        ││        │  │  │
│         │  │ └────────┘└────────┘└────────┘└────────┘└────────┘└────────┘  │  │
│         │  │                                                                │  │
│         │  └────────────────────────────────────────────────────────────────┘  │
│         │                                                                       │
│         │  ┌─ Upcoming (Next 7 days) ───────────────────────────────────────┐  │
│         │  │  Feb 15, 10:00  ▣ LI Outloud  "Questim case study..."         │  │
│         │  │  Feb 15, 14:00  ▣ IG Outloud  "Behind the scenes..."          │  │
│         │  │  Feb 17, 09:00  ▣ LI Outloud  "Hiring designers..."           │  │
│         │  └────────────────────────────────────────────────────────────────┘  │
│         │                                                                       │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

### Calendar Cell States

| State | Color | Icon | Meaning |
|-------|-------|------|---------|
| Scheduled | Blue `#3B82F6` | ○ | Future post, waiting |
| Posted | Green `#22C55E` | ● | Successfully published |
| Missed | Red/Orange `#EF4444` | ⚠ | Scheduled time passed, not posted |
| Gap | Gray dashed | — | No content scheduled |

### Post Status Colors in Calendar

```css
.calendar-post-scheduled {
  background: #3B82F620;
  border-left: 3px solid #3B82F6;
}

.calendar-post-posted {
  background: #22C55E20;
  border-left: 3px solid #22C55E;
}

.calendar-post-missed {
  background: #EF444420;
  border-left: 3px solid #EF4444;
}

.calendar-gap {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    #2A2A2A 5px,
    #2A2A2A 10px
  );
}
```

### Week View

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Week of Feb 10-16, 2026                                        [Month][Week]  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Time    │ Mon 10    │ Tue 11    │ Wed 12    │ Thu 13    │ Fri 14    │ Sat 15  │
│  ────────┼───────────┼───────────┼───────────┼───────────┼───────────┼─────────│
│  09:00   │           │           │           │           │           │         │
│  10:00   │           │ ▣ LI ●    │           │           │ ▣ LI ○    │         │
│          │           │ IDS BK    │           │           │ Questim   │         │
│  11:00   │           │           │           │           │           │         │
│  12:00   │           │           │           │           │           │         │
│  13:00   │           │           │           │           │           │         │
│  14:00   │           │           │           │ ▣ X  ●    │           │ ▣ IG ○  │
│          │           │           │           │ Opinion   │           │ BTS     │
│  15:00   │           │           │           │           │           │         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Click on Calendar Cell

Opens post detail slide-over (same as Dashboard).

### Drag & Drop in Calendar

- Drag scheduled post to different date/time → Reschedule
- Drag from "Approved" list to calendar → Schedule

---

## Feature 4: Auto-Expiration of Scheduled Posts

### Problem
If a scheduled post's date passes without being published (e.g., API failure, manual posting, forgotten), it sits in "Scheduled" forever.

### Solution
Automated job that:
1. Checks for scheduled posts where `scheduled_for < NOW()`
2. Marks them as "missed" (new status) or "posted" (if manually confirmed)
3. Moves them out of Scheduled column
4. Shows them in Calendar with special styling

### New Status: `missed`

```sql
-- Add 'missed' to status enum
-- Full flow: draft → design_review → final_review → approved → scheduled → posted | missed

ALTER TABLE posts 
ADD CONSTRAINT posts_status_check 
CHECK (status IN ('draft', 'design_review', 'final_review', 'approved', 'scheduled', 'posted', 'missed'));
```

### Cron Job / Scheduled Function

```typescript
// Run every hour (or every 15 minutes)
// Supabase Edge Function or Vercel Cron

async function checkExpiredScheduledPosts() {
  const now = new Date().toISOString();
  
  // Find posts that should have been posted
  const { data: expiredPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'scheduled')
    .lt('scheduled_for', now);
  
  for (const post of expiredPosts) {
    // Check if more than 1 hour past scheduled time
    const scheduledTime = new Date(post.scheduled_for);
    const hoursPast = (Date.now() - scheduledTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursPast >= 1) {
      // Mark as missed
      await supabase.from('posts').update({
        status: 'missed',
        updated_at: now
      }).eq('id', post.id);
      
      // Log activity
      await supabase.from('activity_log').insert({
        post_id: post.id,
        action: 'auto_marked_missed',
        details: { 
          scheduled_for: post.scheduled_for,
          hours_past: hoursPast
        }
      });
      
      // Optionally: Send notification to Tade
      await sendNotification({
        user_id: post.author_id,
        type: 'post_missed',
        message: `Post "${post.title}" was scheduled for ${post.scheduled_for} but wasn't published.`
      });
    }
  }
}
```

### UI: Missed Post Card

```
┌─────────────────────────────────────────┐
│ ▣ LI  Outloud           ⚠️ MISSED       │
│─────────────────────────────────────────│
│ Why we don't do discovery calls         │
│                                         │
│ Was scheduled: Feb 12, 10:00            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [Reschedule]  [Mark as Posted]      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│─────────────────────────────────────────│
│ 👤 Tade                                 │
└─────────────────────────────────────────┘
```

### Actions for Missed Posts

1. **Reschedule** – Opens date picker, moves back to "Scheduled"
2. **Mark as Posted** – If it was manually posted, enter URL and mark as "Posted"
3. **Move to Draft** – If it needs rework, move back to draft

### Mark as Posted Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Mark as Posted                                         [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This post was scheduled but not auto-published.            │
│  If you posted it manually, enter the details below.        │
│                                                             │
│  Post URL (optional)                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ https://linkedin.com/posts/...                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Posted at                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Feb 12, 2026  11:30 AM                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                             [Cancel]  [Confirm as Posted]   │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 5: Additional Improvements

### 5.1 Quick Stats Dashboard Widget

Add stats overview to Dashboard header:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  This Week                                                                      │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐        │
│  │ Scheduled     │ │ Posted        │ │ In Review     │ │ Missed        │        │
│  │      8        │ │      12       │ │      3        │ │      1 ⚠️     │        │
│  │  ↑ 2 vs last  │ │  ↑ 4 vs last  │ │               │ │               │        │
│  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Post Performance Preview (Content Library)

Show basic metrics for posted content:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ☐ │ ▣ LI │ IDS BK case study    │ Case Study │ Posted │ Feb 8  │ 📊 2.4k views │
└─────────────────────────────────────────────────────────────────────────────────┘
```

Clicking "📊" opens metrics panel:

```
┌─────────────────────────────────────────┐
│ Performance: IDS BK case study          │
├─────────────────────────────────────────┤
│                                         │
│  Impressions      2,431                 │
│  Engagements      187  (7.7%)           │
│  Reactions        142                   │
│  Comments         23                    │
│  Shares           22                    │
│  Link clicks      45                    │
│                                         │
│  Posted: Feb 8, 2026 at 10:00          │
│  Platform: LinkedIn                     │
│                                         │
│  [View on LinkedIn ↗]                   │
│                                         │
└─────────────────────────────────────────┘
```

**Note:** For MVP, metrics are manually entered. v2.0 will auto-fetch via APIs.

### 5.3 Content Gaps Alert

On Calendar, highlight days with no scheduled content:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ⚠️ Content Gap Alert                                                          │
│  No posts scheduled for: Wed Feb 12, Sat Feb 15, Mon Feb 17                    │
│  [Schedule posts for these days]                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Recurring Posts (Simple)

Option to duplicate a post for recurring content:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Schedule Post                                                                  │
│                                                                                 │
│  Date & Time                                                                    │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │ Feb 15, 2026  10:00 AM                                                    │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  Repeat                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │ ○ Don't repeat                                                            │ │
│  │ ○ Every week (same day & time)                                            │ │
│  │ ○ Every 2 weeks                                                           │ │
│  │ ○ Every month                                                             │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Notification Center

Bell icon in header showing recent activity:

```
Header:
[🔍] [🔔 3] [Tade ●] [+ New Post]

Dropdown:
┌─────────────────────────────────────────────────────────────┐
│ Notifications                              [Mark all read]  │
├─────────────────────────────────────────────────────────────┤
│ 🟢 Ondrej approved "SaaS scaling lessons"                   │
│    2 hours ago                                              │
├─────────────────────────────────────────────────────────────┤
│ 🔵 Martin commented on "Questim case study"                 │
│    "Creative looks good, just one tweak..."                 │
│    3 hours ago                                              │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ Post "Why we don't..." was marked as missed              │
│    Yesterday at 11:00                                       │
├─────────────────────────────────────────────────────────────┤
│                              [View all notifications]       │
└─────────────────────────────────────────────────────────────┘
```

### 5.6 Export Posts

Export posts to CSV/JSON for backup or analysis:

```
Content Library > [Export ▾]
┌─────────────────────┐
│ Export as CSV       │
│ Export as JSON      │
│ Export to Notion    │  ← Future integration
└─────────────────────┘
```

### 5.7 Activity Feed (Dashboard Sidebar)

Show recent team activity on Dashboard:

```
┌─ Recent Activity ──────────────────────┐
│                                        │
│ 👤 Ondrej approved a post              │
│    "SaaS scaling lessons"              │
│    2 hours ago                         │
│                                        │
│ 🖼️ Martin approved creative            │
│    "Questim case study"                │
│    3 hours ago                         │
│                                        │
│ ✎ Tade created new post               │
│    "Behind the scenes: design process" │
│    4 hours ago                         │
│                                        │
│ 📅 Post scheduled                      │
│    "Hiring designers" → Feb 17, 09:00  │
│    5 hours ago                         │
│                                        │
│ [View full activity log]               │
└────────────────────────────────────────┘
```

---

## Database Additions

```sql
-- Templates table (if not added in v1.2)
CREATE TABLE templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT,
  account_id UUID REFERENCES accounts(id),
  theme_id UUID REFERENCES themes(id),
  variables JSONB,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post metrics (manual entry for MVP)
CREATE TABLE post_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  impressions INTEGER,
  engagements INTEGER,
  reactions INTEGER,
  comments INTEGER,
  shares INTEGER,
  link_clicks INTEGER,
  fetched_at TIMESTAMP WITH TIME ZONE, -- For future API integration
  manually_entered BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL, -- 'post_approved', 'post_returned', 'comment', 'missed_post', etc.
  title TEXT NOT NULL,
  message TEXT,
  post_id UUID REFERENCES posts(id),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missed status and metrics link to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS manually_posted BOOLEAN DEFAULT FALSE;
```

---

## Implementation Checklist

### Remove Role Switcher from Posts
- [ ] Conditionally render role switcher only on `/dashboard`
- [ ] Add pathname check in layout

### Content Library Page
- [ ] Rename "Posts" to "Library" in sidebar
- [ ] Change icon from ✎ to 📚
- [ ] Create stats bar component
- [ ] Create tabs (All, Drafts, Scheduled, Posted, Templates)
- [ ] Create table view component
- [ ] Add sorting (date, title, status)
- [ ] Add pagination
- [ ] Templates tab with CRUD

### Calendar Page
- [ ] Create `/calendar` route
- [ ] Month view component
- [ ] Week view component
- [ ] Calendar cell component with status colors
- [ ] Legend component
- [ ] Upcoming posts sidebar
- [ ] Click to open post detail
- [ ] Drag & drop rescheduling
- [ ] Content gap detection

### Auto-Expiration
- [ ] Add 'missed' status to database
- [ ] Create cron job / edge function
- [ ] Missed post card styling
- [ ] Reschedule action
- [ ] Mark as posted modal
- [ ] Notification on missed post

### Additional
- [ ] Quick stats widget on Dashboard
- [ ] Post metrics display in Library
- [ ] Content gap alerts
- [ ] Notification center (bell icon)
- [ ] Activity feed sidebar
- [ ] Export functionality

---

## File Structure Additions

```
app/
├── (dashboard)/
│   ├── library/
│   │   └── page.tsx              # Content Library (renamed from posts)
│   ├── calendar/
│   │   └── page.tsx              # Calendar page
│   └── api/
│       └── cron/
│           └── check-expired/route.ts  # Cron endpoint

components/
├── library/
│   ├── stats-bar.tsx             # Stats overview
│   ├── post-table.tsx            # Table view
│   ├── table-row.tsx             # Single row
│   ├── templates-list.tsx        # Templates tab
│   └── template-form.tsx         # Create/edit template
├── calendar/
│   ├── calendar-grid.tsx         # Main calendar
│   ├── month-view.tsx            # Month layout
│   ├── week-view.tsx             # Week layout
│   ├── calendar-cell.tsx         # Single day/time cell
│   ├── calendar-post.tsx         # Post in calendar
│   ├── legend.tsx                # Status legend
│   ├── upcoming-list.tsx         # Upcoming posts sidebar
│   └── gap-alert.tsx             # Content gap warning
├── notifications/
│   ├── notification-bell.tsx     # Header bell icon
│   ├── notification-dropdown.tsx # Dropdown list
│   └── notification-item.tsx     # Single notification
├── posts/
│   ├── missed-post-card.tsx      # Missed post styling
│   ├── mark-posted-modal.tsx     # Confirm manual post
│   └── metrics-panel.tsx         # Post performance
└── dashboard/
    ├── stats-widget.tsx          # Quick stats
    └── activity-feed.tsx         # Recent activity sidebar

lib/
└── cron/
    └── check-expired-posts.ts    # Expiration logic
```

---

## Notes

1. **Role switcher is dev/demo feature** – Consider removing entirely for production or moving to admin-only settings
2. **Content Library is the archive** – Dashboard is for workflow, Library is for finding/managing content
3. **Missed posts need attention** – Red styling + notifications ensure nothing falls through cracks
4. **Calendar is planning tool** – Visual overview of content schedule, gap detection, easy rescheduling
5. **Metrics are manual for MVP** – LinkedIn/X API integration in v2.0 for auto-fetching
6. **Templates save time** – Especially for recurring content types like case studies and hiring posts
