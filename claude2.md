# Outloud Content Hub – v1.1 Features

## Overview

This document covers features for v1.1, building on top of the MVP spec in `CLAUDE.md`.

---

## Feature 1: Create New Post

### User Flow

1. User clicks "+ New Post" button in header
2. Modal/sheet opens with post creation form
3. User fills in:
   - Title (required)
   - Content (required)
   - Platform (LinkedIn / X / Instagram)
   - Account (Outloud / Ondrej)
   - Creative (optional upload)
4. User clicks "Save as Draft" or "Submit for Review"
5. Post appears in appropriate Kanban column

### UI Components

**New Post Modal:**
```
┌─────────────────────────────────────────────────────────────┐
│ Create New Post                                        [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Title                                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Post title...                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Platform & Account                                         │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ LinkedIn      ▾ │  │ Outloud       ▾ │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                             │
│  Content                                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │ Write your post content here...                       │  │
│  │                                                       │  │
│  │                                                       │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                    0 chars  │
│                                                             │
│  Creative (optional)                                        │
│  ┌─────────────┐                                            │
│  │      +      │  Drag & drop or click to upload           │
│  │    Add      │  PNG, JPG, MP4 up to 10MB                  │
│  └─────────────┘                                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    [Cancel]  [Save Draft]  [Submit →]       │
└─────────────────────────────────────────────────────────────┘
```

### Logic

```typescript
// Post creation states
type PostStatus = 
  | 'draft'           // Just created, not submitted
  | 'design_review'   // Submitted, waiting for Martin
  | 'final_review'    // Creative approved, waiting for Ondrej
  | 'approved'        // Ondrej approved, ready to schedule
  | 'scheduled'       // Date/time set by Tade
  | 'posted';         // Published

// On "Save as Draft"
// → status = 'draft'
// → stays in Draft column

// On "Submit for Review"
// → if hasCreative: status = 'design_review' (goes to Martin)
// → if !hasCreative: status = 'final_review' (goes to Ondrej)
```

### Database

```sql
-- Insert new post
INSERT INTO posts (
  title,
  content,
  account_id,
  author_id,
  status,
  creative_urls
) VALUES (
  $title,
  $content,
  $accountId,
  $authorId,
  'draft', -- or 'design_review'/'final_review' on submit
  $creativeUrls
);

-- Log activity
INSERT INTO activity_log (post_id, user_id, action, details)
VALUES ($postId, $userId, 'created', '{"title": "..."}');
```

---

## Feature 2: Approval & Denial System

### Current Problem
When Martin or Ondrej approves/denies, the post moves but there's no clear history of who did what and when.

### Solution
Track approval/denial with:
- Who approved/denied
- When
- Optional comment (reason for denial)
- Visual badge showing approval status

### UI: Approval Actions

**Martin's Design Review:**
```
┌──────────────────────────────────────────────────────────┐
│ [View Post]                                              │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ ✓ Approve Creative                                 │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ ✗ Request Changes                                  │   │
│ └────────────────────────────────────────────────────┘   │
│   └─ Opens comment input for feedback                    │
└──────────────────────────────────────────────────────────┘
```

**Ondrej's Final Review:**
```
┌──────────────────────────────────────────────────────────┐
│ [Edit]                                                   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ ✓ Approve                                          │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ ↩ Return for Edits                                 │   │
│ └────────────────────────────────────────────────────┘   │
│   └─ Opens comment input for feedback                    │
└──────────────────────────────────────────────────────────┘
```

### UI: Denial Flow (Request Changes / Return for Edits)

When clicking "Request Changes" or "Return for Edits":

```
┌─────────────────────────────────────────────────────────────┐
│ Return Post for Edits                                  [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What needs to be changed?                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │ The hook is too generic. Try leading with the        │  │
│  │ specific result instead...                           │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Return to:                                                 │
│  ○ Draft (Tade can edit and resubmit)                       │
│  ○ Design Review (needs new creative from Martin)           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                              [Cancel]  [Return Post]        │
└─────────────────────────────────────────────────────────────┘
```

### UI: Approval Status Badges on Cards

**Post Card with Approval History:**
```
┌─────────────────────────────────────────┐
│ ▣ LI  Outloud                           │
│─────────────────────────────────────────│
│ Questim case study – one team...        │
│                                         │
│ ⚠️ AI 73%    ✓ ToV 89%                  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Creative approved                 │ │
│ │   by Martin · Feb 14, 09:15         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 👤 Waiting for Ondrej                   │
│                                         │
│─────────────────────────────────────────│
│ 👤 Tade                          💬 2   │
└─────────────────────────────────────────┘
```

**Post Card After Denial:**
```
┌─────────────────────────────────────────┐
│ ▣ LI  Outloud                           │
│─────────────────────────────────────────│
│ IDS BK – tickets without registration   │
│                                         │
│ ⚠️ AI 45%    ✓ ToV 91%                  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ↩ Returned by Ondrej                │ │
│ │   "Hook needs work" · Feb 14, 11:30 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│─────────────────────────────────────────│
│ 👤 Tade                          💬 4   │
└─────────────────────────────────────────┘
```

### Database Schema Addition

```sql
-- Add approval tracking columns to posts table
ALTER TABLE posts ADD COLUMN creative_denied BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN creative_denied_by UUID REFERENCES profiles(id);
ALTER TABLE posts ADD COLUMN creative_denied_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE posts ADD COLUMN creative_denial_reason TEXT;

ALTER TABLE posts ADD COLUMN final_denied BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN final_denied_by UUID REFERENCES profiles(id);
ALTER TABLE posts ADD COLUMN final_denied_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE posts ADD COLUMN final_denial_reason TEXT;

-- Track how many times a post has been returned
ALTER TABLE posts ADD COLUMN revision_count INTEGER DEFAULT 0;
```

### Approval Logic

```typescript
// Martin approves creative
async function approveCreative(postId: string, userId: string) {
  await supabase.from('posts').update({
    creative_approved: true,
    creative_approved_by: userId,
    creative_approved_at: new Date().toISOString(),
    creative_denied: false,
    creative_denial_reason: null,
    status: 'final_review' // Move to Ondrej
  }).eq('id', postId);
  
  await logActivity(postId, userId, 'creative_approved');
}

// Martin requests changes
async function requestCreativeChanges(postId: string, userId: string, reason: string) {
  await supabase.from('posts').update({
    creative_denied: true,
    creative_denied_by: userId,
    creative_denied_at: new Date().toISOString(),
    creative_denial_reason: reason,
    status: 'draft', // Return to Tade
    revision_count: sql`revision_count + 1`
  }).eq('id', postId);
  
  // Auto-add comment with denial reason
  await supabase.from('comments').insert({
    post_id: postId,
    author_id: userId,
    content: `🖼️ Creative changes requested: ${reason}`
  });
  
  await logActivity(postId, userId, 'creative_denied', { reason });
}

// Ondrej approves
async function approveFinal(postId: string, userId: string) {
  await supabase.from('posts').update({
    final_approved: true,
    final_approved_by: userId,
    final_approved_at: new Date().toISOString(),
    final_denied: false,
    final_denial_reason: null,
    status: 'approved' // Ready for Tade to schedule
  }).eq('id', postId);
  
  await logActivity(postId, userId, 'final_approved');
}

// Ondrej returns for edits
async function returnForEdits(postId: string, userId: string, reason: string, returnTo: 'draft' | 'design_review') {
  await supabase.from('posts').update({
    final_denied: true,
    final_denied_by: userId,
    final_denied_at: new Date().toISOString(),
    final_denial_reason: reason,
    status: returnTo,
    revision_count: sql`revision_count + 1`
  }).eq('id', postId);
  
  // Auto-add comment with denial reason
  await supabase.from('comments').insert({
    post_id: postId,
    author_id: userId,
    content: `↩ Returned for edits: ${reason}`
  });
  
  await logActivity(postId, userId, 'final_denied', { reason, returnTo });
}
```

---

## Feature 3: Filtering

### Filter Options

**By Platform:**
- All Platforms
- LinkedIn
- X (Twitter)
- Instagram

**By Account:**
- All Accounts
- Outloud
- Ondrej

**By Status:**
- All Statuses
- Draft
- Design Review
- Final Review
- Approved
- Scheduled

**By Approval State:**
- All
- Waiting for Martin
- Waiting for Ondrej
- Returned (needs edits)

**By Author:**
- All Authors
- Tade
- (expandable for future team members)

**By Date Range:**
- All Time
- This Week
- This Month
- Custom Range

### UI: Filter Bar

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Content Hub                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Platform  ▾ │ │ Account   ▾ │ │ Status    ▾ │ │ Time      ▾ │  [Clear]   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                                             │
│  Active filters: LinkedIn · Outloud · This Week                    3 posts  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### UI: Filter Dropdown Example

```
┌─────────────────┐
│ Platform      ▾ │
├─────────────────┤
│ ☑ All Platforms │
│ ☐ LinkedIn      │
│ ☐ X             │
│ ☐ Instagram     │
└─────────────────┘
```

### Filter State Management

```typescript
// Filter state type
interface PostFilters {
  platforms: ('linkedin' | 'x' | 'instagram')[];
  accounts: string[]; // account IDs or names
  statuses: PostStatus[];
  waitingFor: ('martin' | 'ondrej' | 'returned')[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  search: string; // title search
}

// Default state (show all)
const defaultFilters: PostFilters = {
  platforms: [],
  accounts: [],
  statuses: [],
  waitingFor: [],
  dateRange: { start: null, end: null },
  search: ''
};

// Zustand store for filters
interface FilterStore {
  filters: PostFilters;
  setFilter: <K extends keyof PostFilters>(key: K, value: PostFilters[K]) => void;
  clearFilters: () => void;
  activeFilterCount: () => number;
}
```

### Database Query with Filters

```typescript
async function fetchPosts(filters: PostFilters) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      account:accounts(*),
      author:profiles(*),
      comments(count)
    `)
    .order('created_at', { ascending: false });
  
  // Platform filter
  if (filters.platforms.length > 0) {
    query = query.in('accounts.platform', filters.platforms);
  }
  
  // Account filter
  if (filters.accounts.length > 0) {
    query = query.in('account_id', filters.accounts);
  }
  
  // Status filter
  if (filters.statuses.length > 0) {
    query = query.in('status', filters.statuses);
  }
  
  // Waiting for filter
  if (filters.waitingFor.includes('martin')) {
    query = query.eq('status', 'design_review');
  }
  if (filters.waitingFor.includes('ondrej')) {
    query = query.eq('status', 'final_review');
  }
  if (filters.waitingFor.includes('returned')) {
    query = query.or('creative_denied.eq.true,final_denied.eq.true');
  }
  
  // Date range filter
  if (filters.dateRange.start) {
    query = query.gte('created_at', filters.dateRange.start.toISOString());
  }
  if (filters.dateRange.end) {
    query = query.lte('created_at', filters.dateRange.end.toISOString());
  }
  
  // Search filter
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }
  
  return query;
}
```

### Keyboard Shortcuts for Filters

| Shortcut | Action |
|----------|--------|
| `/` or `⌘K` | Focus search input |
| `Esc` | Clear search / close dropdown |
| `⌘⇧L` | Filter: LinkedIn only |
| `⌘⇧X` | Filter: X only |
| `⌘⇧I` | Filter: Instagram only |
| `⌘⇧0` | Clear all filters |

---

## Implementation Checklist

### Create New Post
- [ ] "New Post" button in header
- [ ] Modal/sheet component
- [ ] Post form (title, content, platform, account)
- [ ] Creative upload to Supabase Storage
- [ ] Save as Draft functionality
- [ ] Submit for Review functionality
- [ ] Form validation
- [ ] Success/error toasts

### Approval System
- [ ] Approve Creative action (Martin)
- [ ] Request Changes action (Martin) with reason modal
- [ ] Approve action (Ondrej)
- [ ] Return for Edits action (Ondrej) with reason modal
- [ ] Approval status badges on post cards
- [ ] Denial reason display
- [ ] Auto-comment on denial
- [ ] Activity log entries
- [ ] Revision count tracking

### Filtering
- [ ] Filter bar component
- [ ] Platform filter dropdown
- [ ] Account filter dropdown
- [ ] Status filter dropdown
- [ ] Date range picker
- [ ] Search input
- [ ] Active filter pills
- [ ] Clear filters button
- [ ] Filter count badge
- [ ] URL sync (filters in query params)
- [ ] Keyboard shortcuts

---

## Component Files to Create

```
components/
├── posts/
│   ├── create-post-modal.tsx      # New post modal
│   ├── approval-actions.tsx       # Approve/deny buttons
│   ├── denial-modal.tsx           # Reason input modal
│   ├── approval-badge.tsx         # Shows who approved/denied
│   └── revision-indicator.tsx     # Shows revision count
├── filters/
│   ├── filter-bar.tsx             # Main filter container
│   ├── platform-filter.tsx        # Platform dropdown
│   ├── account-filter.tsx         # Account dropdown
│   ├── status-filter.tsx          # Status dropdown
│   ├── date-range-filter.tsx      # Date picker
│   ├── active-filters.tsx         # Filter pills
│   └── search-input.tsx           # Search box
└── ui/
    ├── modal.tsx                  # Reusable modal
    ├── dropdown.tsx               # Filter dropdown base
    └── date-picker.tsx            # Date range picker
```

---

## Notes

1. **Denial always requires a reason** – Forces constructive feedback
2. **Filters persist in URL** – Shareable filtered views
3. **Returned posts show badge** – Clear visual that action is needed
4. **Revision count visible** – Shows how many times a post was returned (helps identify problematic content patterns)
