-- ============================================================================
-- Outloud Content Hub — Complete Database Schema
-- Run this in Supabase SQL Editor to set up the entire database.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ── Profiles (extends auth.users) ───────────────────────────────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'designer', 'approver')),
  user_key TEXT UNIQUE NOT NULL,    -- 'tade', 'martin', 'ondrej'
  initial TEXT NOT NULL,             -- 'T', 'M', 'O'
  color TEXT NOT NULL,               -- hex color for avatar
  role_label TEXT NOT NULL,          -- 'Head of Media', 'Designer', 'CEO'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Themes ──────────────────────────────────────────────────────────────────
CREATE TABLE themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Posts ────────────────────────────────────────────────────────────────────
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'x', 'instagram')),
  account TEXT NOT NULL DEFAULT 'Outloud',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'design_review', 'final_review', 'approved',
    'scheduled', 'posted', 'missed'
  )),
  author_id UUID REFERENCES profiles(id) NOT NULL,
  theme_id UUID REFERENCES themes(id),

  -- AI & ToV scores
  ai_score INTEGER DEFAULT 0,
  tov_score INTEGER DEFAULT 0,
  flagged_phrases JSONB DEFAULT '[]',
  tov_suggestions JSONB DEFAULT '[]',

  -- Creative
  has_creative BOOLEAN DEFAULT FALSE,
  creative_approved BOOLEAN DEFAULT FALSE,
  creative_approved_by UUID REFERENCES profiles(id),
  creative_approved_at TIMESTAMPTZ,

  -- Creative denial
  creative_denied BOOLEAN DEFAULT FALSE,
  creative_denied_by UUID REFERENCES profiles(id),
  creative_denial_reason TEXT,
  creative_denied_at TIMESTAMPTZ,

  -- Final approval
  final_approved BOOLEAN DEFAULT FALSE,
  final_approved_by UUID REFERENCES profiles(id),
  final_approved_at TIMESTAMPTZ,

  -- Final denial
  final_denied BOOLEAN DEFAULT FALSE,
  final_denied_by UUID REFERENCES profiles(id),
  final_denial_reason TEXT,
  final_denied_at TIMESTAMPTZ,

  -- Workflow
  revision_count INTEGER DEFAULT 0,
  waiting_for TEXT,

  -- Scheduling
  scheduled_date TEXT,
  scheduled_time TEXT,
  scheduled_iso TIMESTAMPTZ,

  -- Posted
  post_url TEXT,
  posted_at TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Media Files ─────────────────────────────────────────────────────────────
CREATE TABLE media_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'document')),
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration INTEGER,              -- seconds, for video
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Comments ────────────────────────────────────────────────────────────────
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Activity Log ────────────────────────────────────────────────────────────
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- CONTENT PLAN TABLES
-- ============================================================================

-- ── Content Plans ───────────────────────────────────────────────────────────
CREATE TABLE content_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  north_star_goals JSONB DEFAULT '[]',
  kpi_primary TEXT,
  kpi_secondary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Content Pillars ─────────────────────────────────────────────────────────
CREATE TABLE content_pillars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  formats JSONB DEFAULT '[]',
  frequency TEXT,
  goal TEXT,
  sort_order INTEGER DEFAULT 0
);

-- ── Cadence Summaries ───────────────────────────────────────────────────────
CREATE TABLE cadence_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_name TEXT NOT NULL,
  total_per_week TEXT,
  entries JSONB DEFAULT '[]'
);

-- ── Combined Weekly Grid ────────────────────────────────────────────────────
CREATE TABLE combined_weekly_grid (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  monday TEXT DEFAULT '-',
  tuesday TEXT DEFAULT '-',
  wednesday TEXT DEFAULT '-',
  thursday TEXT DEFAULT '-',
  friday TEXT DEFAULT '-',
  saturday TEXT DEFAULT '-',
  sunday TEXT DEFAULT '-'
);

-- ── Weekly Slots ────────────────────────────────────────────────────────────
CREATE TABLE weekly_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day TEXT NOT NULL,
  slot_name TEXT NOT NULL,
  goal TEXT,
  formats TEXT,
  pillar_id UUID REFERENCES content_pillars(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0
);

-- ── Monthly Weeks ───────────────────────────────────────────────────────────
CREATE TABLE monthly_weeks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL,
  theme TEXT,
  posts JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0
);

-- ── Monthly Themes ──────────────────────────────────────────────────────────
CREATE TABLE monthly_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  emoji TEXT,
  theme TEXT NOT NULL,
  status TEXT DEFAULT 'planned',
  sort_order INTEGER DEFAULT 0
);

-- ── Team Members ────────────────────────────────────────────────────────────
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  responsibilities JSONB DEFAULT '[]'
);

-- ── Workflow Steps ──────────────────────────────────────────────────────────
CREATE TABLE workflow_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  step_number INTEGER NOT NULL,
  who TEXT NOT NULL,
  day TEXT NOT NULL,
  task TEXT NOT NULL,
  time TEXT,
  sort_order INTEGER DEFAULT 0
);


-- ============================================================================
-- TONE OF VOICE TABLES
-- ============================================================================

-- ── Brand Voice ─────────────────────────────────────────────────────────────
CREATE TABLE brand_voice (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tagline TEXT,
  three_words JSONB DEFAULT '[]',
  dos JSONB DEFAULT '[]',
  donts JSONB DEFAULT '[]'
);

-- ── ToV Guidelines ──────────────────────────────────────────────────────────
CREATE TABLE tov_guidelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- ── ToV Writing Style ───────────────────────────────────────────────────────
CREATE TABLE tov_writing_style (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- ── ToV Dos ─────────────────────────────────────────────────────────────────
CREATE TABLE tov_dos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item TEXT NOT NULL,
  example TEXT,
  sort_order INTEGER DEFAULT 0
);

-- ── ToV Don'ts ──────────────────────────────────────────────────────────────
CREATE TABLE tov_donts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phrase TEXT NOT NULL,
  fix TEXT,
  sort_order INTEGER DEFAULT 0
);

-- ── ToV Examples ────────────────────────────────────────────────────────────
CREATE TABLE tov_examples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('good', 'bad_to_good', 'hook')),
  title TEXT NOT NULL,
  before_text TEXT,
  after_text TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0
);

-- ── ToV Voice Split ─────────────────────────────────────────────────────────
CREATE TABLE tov_voice_split (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  characteristics JSONB DEFAULT '[]',
  example TEXT,
  sort_order INTEGER DEFAULT 0
);

-- ── ToV Voice Comparison ────────────────────────────────────────────────────
CREATE TABLE tov_voice_comparison (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aspect TEXT NOT NULL,
  outloud TEXT NOT NULL,
  ondrej TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- ── ToV Blocked Phrases ─────────────────────────────────────────────────────
CREATE TABLE tov_blocked_phrases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phrase TEXT NOT NULL,
  suggestion TEXT,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('error', 'warning', 'info')),
  sort_order INTEGER DEFAULT 0
);


-- ============================================================================
-- USER SETTINGS
-- ============================================================================

CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  appearance JSONB DEFAULT '{"theme":"dark","accentColor":"#E85A2C","compactMode":false}',
  notifications JSONB DEFAULT '{"emailOnApproval":true,"emailOnComment":true,"emailOnStatusChange":true,"emailOnMention":true,"badgeCount":true,"soundEnabled":false}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadence_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE combined_weekly_grid ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voice ENABLE ROW LEVEL SECURITY;
ALTER TABLE tov_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tov_writing_style ENABLE ROW LEVEL SECURITY;
ALTER TABLE tov_dos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tov_donts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tov_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE tov_voice_split ENABLE ROW LEVEL SECURITY;
ALTER TABLE tov_voice_comparison ENABLE ROW LEVEL SECURITY;
ALTER TABLE tov_blocked_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ── Profiles policies ───────────────────────────────────────────────────────
CREATE POLICY "auth_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON profiles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON profiles FOR DELETE TO authenticated USING (true);

-- ── Themes policies ─────────────────────────────────────────────────────────
CREATE POLICY "auth_select" ON themes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON themes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON themes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON themes FOR DELETE TO authenticated USING (true);

-- ── Posts policies ──────────────────────────────────────────────────────────
CREATE POLICY "auth_select" ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON posts FOR DELETE TO authenticated USING (true);

-- ── Media files policies ────────────────────────────────────────────────────
CREATE POLICY "auth_select" ON media_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON media_files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON media_files FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON media_files FOR DELETE TO authenticated USING (true);

-- ── Comments policies ───────────────────────────────────────────────────────
CREATE POLICY "auth_select" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON comments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON comments FOR DELETE TO authenticated USING (true);

-- ── Activity log policies ───────────────────────────────────────────────────
CREATE POLICY "auth_select" ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON activity_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON activity_log FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON activity_log FOR DELETE TO authenticated USING (true);

-- ── Content plans policies ──────────────────────────────────────────────────
CREATE POLICY "auth_select" ON content_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON content_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON content_plans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON content_plans FOR DELETE TO authenticated USING (true);

-- ── Content pillars policies ────────────────────────────────────────────────
CREATE POLICY "auth_select" ON content_pillars FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON content_pillars FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON content_pillars FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON content_pillars FOR DELETE TO authenticated USING (true);

-- ── Cadence summaries policies ──────────────────────────────────────────────
CREATE POLICY "auth_select" ON cadence_summaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON cadence_summaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON cadence_summaries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON cadence_summaries FOR DELETE TO authenticated USING (true);

-- ── Combined weekly grid policies ───────────────────────────────────────────
CREATE POLICY "auth_select" ON combined_weekly_grid FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON combined_weekly_grid FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON combined_weekly_grid FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON combined_weekly_grid FOR DELETE TO authenticated USING (true);

-- ── Weekly slots policies ───────────────────────────────────────────────────
CREATE POLICY "auth_select" ON weekly_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON weekly_slots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON weekly_slots FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON weekly_slots FOR DELETE TO authenticated USING (true);

-- ── Monthly weeks policies ──────────────────────────────────────────────────
CREATE POLICY "auth_select" ON monthly_weeks FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON monthly_weeks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON monthly_weeks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON monthly_weeks FOR DELETE TO authenticated USING (true);

-- ── Monthly themes policies ─────────────────────────────────────────────────
CREATE POLICY "auth_select" ON monthly_themes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON monthly_themes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON monthly_themes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON monthly_themes FOR DELETE TO authenticated USING (true);

-- ── Team members policies ───────────────────────────────────────────────────
CREATE POLICY "auth_select" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON team_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON team_members FOR DELETE TO authenticated USING (true);

-- ── Workflow steps policies ─────────────────────────────────────────────────
CREATE POLICY "auth_select" ON workflow_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON workflow_steps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON workflow_steps FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON workflow_steps FOR DELETE TO authenticated USING (true);

-- ── Brand voice policies ────────────────────────────────────────────────────
CREATE POLICY "auth_select" ON brand_voice FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON brand_voice FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON brand_voice FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON brand_voice FOR DELETE TO authenticated USING (true);

-- ── ToV guidelines policies ─────────────────────────────────────────────────
CREATE POLICY "auth_select" ON tov_guidelines FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON tov_guidelines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON tov_guidelines FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON tov_guidelines FOR DELETE TO authenticated USING (true);

-- ── ToV writing style policies ──────────────────────────────────────────────
CREATE POLICY "auth_select" ON tov_writing_style FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON tov_writing_style FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON tov_writing_style FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON tov_writing_style FOR DELETE TO authenticated USING (true);

-- ── ToV dos policies ────────────────────────────────────────────────────────
CREATE POLICY "auth_select" ON tov_dos FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON tov_dos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON tov_dos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON tov_dos FOR DELETE TO authenticated USING (true);

-- ── ToV donts policies ──────────────────────────────────────────────────────
CREATE POLICY "auth_select" ON tov_donts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON tov_donts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON tov_donts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON tov_donts FOR DELETE TO authenticated USING (true);

-- ── ToV examples policies ───────────────────────────────────────────────────
CREATE POLICY "auth_select" ON tov_examples FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON tov_examples FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON tov_examples FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON tov_examples FOR DELETE TO authenticated USING (true);

-- ── ToV voice split policies ────────────────────────────────────────────────
CREATE POLICY "auth_select" ON tov_voice_split FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON tov_voice_split FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON tov_voice_split FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON tov_voice_split FOR DELETE TO authenticated USING (true);

-- ── ToV voice comparison policies ───────────────────────────────────────────
CREATE POLICY "auth_select" ON tov_voice_comparison FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON tov_voice_comparison FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON tov_voice_comparison FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON tov_voice_comparison FOR DELETE TO authenticated USING (true);

-- ── ToV blocked phrases policies ────────────────────────────────────────────
CREATE POLICY "auth_select" ON tov_blocked_phrases FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON tov_blocked_phrases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON tov_blocked_phrases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON tov_blocked_phrases FOR DELETE TO authenticated USING (true);

-- ── User settings policies ──────────────────────────────────────────────────
CREATE POLICY "auth_select" ON user_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON user_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON user_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON user_settings FOR DELETE TO authenticated USING (true);


-- ============================================================================
-- STORAGE
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "Authenticated upload media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated delete media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media');

CREATE POLICY "Authenticated update media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media');


-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, avatar_url,
    role, user_key, initial, color, role_label
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'approver',  -- default role, admin updates manually
    LOWER(SPLIT_PART(NEW.email, '@', 1)),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 1)),
    '#8B5CF6',   -- default purple
    'Team Member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE media_files;
