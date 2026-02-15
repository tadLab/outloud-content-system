-- ============================================================================
-- Outloud Content Hub — Seed Data
-- Run this AFTER schema.sql in the Supabase SQL Editor.
--
-- NOTE: Posts and comments are NOT seeded here because they require valid
-- author_id UUIDs that only exist after users sign up via Supabase Auth.
-- ============================================================================


-- ============================================================================
-- THEMES
-- ============================================================================

INSERT INTO themes (id, name, color, description, sort_order, is_default) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Case Study',         '#3B82F6', 'Project showcases, client work',          1, true),
  ('a1b2c3d4-0001-4000-8000-000000000002', 'Behind the Scenes',  '#8B5CF6', 'Process, messy middle, how we work',      2, true),
  ('a1b2c3d4-0001-4000-8000-000000000003', 'Hiring',             '#22C55E', 'Job posts, team culture',                 3, true),
  ('a1b2c3d4-0001-4000-8000-000000000004', 'Opinion',            '#F59E0B', 'Hot takes, thought leadership',           4, true),
  ('a1b2c3d4-0001-4000-8000-000000000005', 'Educational',        '#06B6D4', 'How-to, tips, tutorials',                 5, true),
  ('a1b2c3d4-0001-4000-8000-000000000006', 'Announcement',       '#EF4444', 'News, launches, updates',                 6, true),
  ('a1b2c3d4-0001-4000-8000-000000000007', 'Personal',           '#EC4899', 'Ondrej personal content',                 7, true);


-- ============================================================================
-- CONTENT PLAN
-- ============================================================================

INSERT INTO content_plans (id, name, start_date, end_date, north_star_goals, kpi_primary, kpi_secondary) VALUES
  (
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Q1 2026 Content Strategy',
    '2026-01-01',
    '2026-03-31',
    '[
      {"id":"ns-1","icon":"🎯","title":"Pipeline","description":"Create conversations in DMs / intro from network","target":"5+ inbound conversations per week"},
      {"id":"ns-2","icon":"⭐","title":"Credibility","description":"\"These people ship premium products\"","target":"Consistent case study presence"},
      {"id":"ns-3","icon":"👥","title":"Hiring (Secondary)","description":"Attract senior talent who want deep work & ownership","target":"2+ quality applications per open role"}
    ]',
    'LinkedIn: comments per post, dwell time, clicks | Instagram: saves, shares, profile visits | DMs: # inbound conversations per week',
    'Follower growth (side effect, not goal) | Likes (vanity metric, ignore)'
  );


-- ============================================================================
-- CONTENT PILLARS
-- ============================================================================

INSERT INTO content_pillars (id, name, color, description, formats, frequency, goal, sort_order) VALUES
  (
    'c3d4e5f6-0001-4000-8000-000000000001',
    'Proof of Craft',
    '#3B82F6',
    'Motion, UI, micro-interactions, before/after',
    '["Video loops","Carousels","Screen recordings"]',
    '1-2x per week',
    'Show craft quality, attract clients',
    1
  ),
  (
    'c3d4e5f6-0001-4000-8000-000000000002',
    'Messy Middle',
    '#8B5CF6',
    'Rejected concepts, tradeoffs, "this took 3 days"',
    '["Carousel (graveyard of ideas)","BTS screenshots"]',
    '1x per week',
    'Build trust through transparency',
    2
  ),
  (
    'c3d4e5f6-0001-4000-8000-000000000003',
    'Opinions that Matter',
    '#F59E0B',
    'Strategic hot takes, without toxic tone',
    '["Text posts","Quote cards","Threads"]',
    '1x per week',
    'Positioning, spark dialogue',
    3
  ),
  (
    'c3d4e5f6-0001-4000-8000-000000000004',
    'Client Voice',
    '#22C55E',
    'Quote/mini-interview, their problem in their words',
    '["Quote card","Testimonial carousel"]',
    '2x per month',
    'Social proof, trust',
    4
  ),
  (
    'c3d4e5f6-0001-4000-8000-000000000005',
    'Culture that Ships',
    '#EC4899',
    'Async/deep work/ownership — NOT party lifestyle',
    '["Team photos","Process snapshots","Hiring posts"]',
    '1-2x per month',
    'Attract right talent, show culture',
    5
  );


-- ============================================================================
-- CADENCE SUMMARIES
-- ============================================================================

INSERT INTO cadence_summaries (account_name, total_per_week, entries) VALUES
  (
    'Outloud',
    '6-9 posts',
    '[
      {"id":"cad-1","account":"Outloud","platform":"linkedin","frequency":"2-3x weekly","days":"Mon, Wed, Fri (opt)","preferredTime":"10:00"},
      {"id":"cad-2","account":"Outloud","platform":"instagram","frequency":"2-3x weekly","days":"Cross from LI + native","preferredTime":"14:00"},
      {"id":"cad-3","account":"Outloud","platform":"x","frequency":"2-3x weekly","days":"Cross-post + threads","preferredTime":"varies"}
    ]'
  ),
  (
    'Ondrej',
    '4 posts',
    '[
      {"id":"cad-4","account":"Ondrej","platform":"linkedin","frequency":"2x weekly","days":"Tue, Thu","preferredTime":"09:00"},
      {"id":"cad-5","account":"Ondrej","platform":"x","frequency":"2x weekly","days":"Cross-post + native","preferredTime":"varies"}
    ]'
  );


-- ============================================================================
-- COMBINED WEEKLY GRID
-- ============================================================================

INSERT INTO combined_weekly_grid (platform, monday, tuesday, wednesday, thursday, friday, saturday, sunday) VALUES
  ('LI', 'OL', 'OK', 'OL', 'OK', 'OL?', '-', '-'),
  ('X',  'OL', 'OK', 'OL', 'OK', 'OL?', '-', '-'),
  ('IG', 'OL', '-',  'OL', '-',  'OL?', '-', '-');


-- ============================================================================
-- WEEKLY SLOTS
-- ============================================================================

INSERT INTO weekly_slots (day, slot_name, goal, formats, sort_order) VALUES
  (
    'Monday',
    'Post A — Cross-platform Hero',
    'Reach + clicks + top-of-funnel credibility',
    'Video loop, Motion showcase, Carousel (5 slides)',
    1
  ),
  (
    'Tuesday',
    'Ondrej — Founder POV',
    'Authority + network + inbound intros',
    'Talking head video (30-90s), Text post (150-250 words)',
    2
  ),
  (
    'Wednesday / Friday',
    'Post B — Platform-native',
    'Comments (dialogue density) + positioning',
    'LI text post, LI doc carousel, Quote card on IG',
    3
  ),
  (
    'Thursday',
    'Ondrej — Founder POV',
    'Authority + network + inbound intros',
    'BTS snippets, Mini-carousel (3 slides), Decision moments',
    4
  );


-- ============================================================================
-- MONTHLY WEEKS (monthly program template)
-- ============================================================================

INSERT INTO monthly_weeks (week_number, theme, posts, sort_order) VALUES
  (
    1,
    'Establish Voice',
    '[
      {"slot":"Post A","description":"Proof of Craft (showreel snippet)","format":"Video loop"},
      {"slot":"Post B","description":"Hot take (strategic, biz)","format":"Text post"},
      {"slot":"Ondrej Tue","description":"Why we stopped X"},
      {"slot":"Ondrej Thu","description":"Talking head opinion"}
    ]',
    1
  ),
  (
    2,
    'Messy Middle',
    '[
      {"slot":"Post A","description":"Graveyard of Ideas (3 rejected + why)","format":"Carousel"},
      {"slot":"Post B","description":"Behind the build (screenshot + bullets)","format":"LI doc"},
      {"slot":"Ondrej Tue","description":"How I think about..."},
      {"slot":"Ondrej Thu","description":"BTS decision moment"}
    ]',
    2
  ),
  (
    3,
    'Build Trust',
    '[
      {"slot":"Post A","description":"Trust micro-details (micro-interactions)","format":"Video loop"},
      {"slot":"Post B","description":"Lie → Truth → Evidence","format":"Carousel"},
      {"slot":"Ondrej Tue","description":"Unpopular opinion"},
      {"slot":"Ondrej Thu","description":"Framework carousel"}
    ]',
    3
  ),
  (
    4,
    'Package & Amplify',
    '[
      {"slot":"Post A","description":"Before/After (relative metrics)","format":"Carousel"},
      {"slot":"Post B","description":"Client voice (quote + context)","format":"Quote card"},
      {"slot":"Ondrej Tue","description":"Lessons from failure"},
      {"slot":"Ondrej Thu","description":"Culture/async take"}
    ]',
    4
  );


-- ============================================================================
-- MONTHLY THEMES
-- ============================================================================

INSERT INTO monthly_themes (month, emoji, theme, status, sort_order) VALUES
  ('Feb 2026', '🎮', 'Questim Case Study', 'current', 1),
  ('Mar 2026', '🚌', 'IDS BK Case Study',  'planned', 2),
  ('Apr 2026', '👥', 'Hiring Campaign',     'planned', 3);


-- ============================================================================
-- TEAM MEMBERS
-- ============================================================================

INSERT INTO team_members (user_id, responsibilities) VALUES
  (
    'tade',
    '["Copy for all posts","Briefs for Martin","Scheduling","Monitoring & reports","Video editing support","Making of creatives"]'
  ),
  (
    'martin',
    '["Motion graphics (2-3x/month)","Brand check","Creative approval"]'
  ),
  (
    'ondrej',
    '["Final approval (all content)","Personal posts (8x/month)","Talking head videos","Engagement on debates","Provide insights/photos"]'
  );


-- ============================================================================
-- WORKFLOW STEPS
-- ============================================================================

INSERT INTO workflow_steps (step_number, who, day, task, time, sort_order) VALUES
  (1, 'ondrej', 'Mon', 'Send Tade 2-3 content ideas',       '5 min',   1),
  (2, 'tade',   'Tue', 'Write + schedule Week N+1',          '2 hours', 2),
  (3, 'martin', 'Wed', 'Create motion/graphics for Week N+1','2 hours', 3),
  (4, 'ondrej', 'Wed', 'Approve content for Week N+1',       '15 min',  4),
  (5, 'tade',   'Thu', 'Schedule in Buffer + checklist',      '20 min',  5),
  (6, 'tade',   'Fri', 'Review: comments / saves / clicks',   '15 min',  6);


-- ============================================================================
-- BRAND VOICE
-- ============================================================================

INSERT INTO brand_voice (tagline, three_words, dos, donts) VALUES
  (
    'Outloud Voice = Calm Premium Confidence',
    '["Precise","Premium","Pragmatic"]',
    '["Short sentences, clear point","No hype, no \"best/revolutionary\"","Craft + systems thinking + shipping","Structure: decision → reason → outcome"]',
    '["\"We are thrilled to announce...\"","\"Proud to share...\"","\"Humbled...\"","\"Game-changer\", \"revolutionary\", \"excited\"","Marketing superlatives, excessive emojis","Generic \"Trends for 2026\" content"]'
  );


-- ============================================================================
-- TOV GUIDELINES
-- ============================================================================

INSERT INTO tov_guidelines (title, content, sort_order) VALUES
  ('Short sentences, clear point',
   'Every sentence should earn its place. If it doesn''t add value, cut it.',
   1),
  ('No hype, no "best/revolutionary"',
   'We don''t need superlatives. Our work speaks for itself.',
   2),
  ('Craft + systems thinking + shipping',
   'Talk about how we build, not just what we build. Show the process.',
   3),
  ('Decision → Reason → Outcome',
   'Structure content as: what we decided, why, and what happened.',
   4);


-- ============================================================================
-- TOV WRITING STYLE
-- ============================================================================

INSERT INTO tov_writing_style (title, content, sort_order) VALUES
  ('Sentence Length',
   'Mix short punchy sentences with longer explanatory ones. Avoid walls of text. Break it up.',
   1),
  ('Paragraphs',
   '1-3 sentences max. On social, single sentences as paragraphs work well.',
   2),
  ('Punctuation',
   'Use em dashes — they add rhythm. Avoid exclamation marks!!!',
   3),
  ('Emojis',
   'Minimal. 0-2 per post max. Never in the hook. Never multiple in a row.',
   4);


-- ============================================================================
-- TOV DOS
-- ============================================================================

INSERT INTO tov_dos (item, example, sort_order) VALUES
  ('Be specific with numbers and details',
   '"16 months, 4 tournaments, €17k in prizes"',
   1),
  ('Show the messy middle',
   '"We rejected 3 concepts before landing on this"',
   2),
  ('Use "we" naturally',
   '"We shipped this in 6 weeks" not "The team delivered"',
   3),
  ('Ask genuine questions',
   '"Which approach would you take?"',
   4),
  ('Admit tradeoffs',
   '"We chose speed over perfection here. Here''s why."',
   5),
  ('End with value, not ask',
   'Link to case study, not "Follow for more!"',
   6);


-- ============================================================================
-- TOV DON'TS
-- ============================================================================

INSERT INTO tov_donts (phrase, fix, sort_order) VALUES
  ('"We are thrilled to announce..."',
   'Just announce it. "We shipped X."',
   1),
  ('"Proud to share..."',
   'Share without the preamble.',
   2),
  ('"Humbled by..."',
   'Just say thank you or skip it.',
   3),
  ('"Game-changer", "revolutionary", "disruptive"',
   'Describe what it actually does.',
   4),
  ('"Can''t wait to...", "Excited to..."',
   'Just do/share the thing.',
   5),
  ('Multiple emojis',
   'One or none. Let words do the work.',
   6),
  ('"Follow for more tips!"',
   'End with substance, not begging.',
   7),
  ('Generic hooks like "Trends for 2026"',
   'Be specific. "3 patterns we saw in fintech apps this quarter"',
   8);


-- ============================================================================
-- TOV EXAMPLES
-- ============================================================================

INSERT INTO tov_examples (type, title, before_text, after_text, tags, sort_order) VALUES
  (
    'good',
    'Questim Case Study Hook',
    NULL,
    E'Questim needed a name, a brand, a game, a mobile app, a tournament system, an advertising platform, a back-office, and anti-cheat protection.\n\nThey hired one team.\n\n16 months later: live in CZ/SK, 4 prize tournaments with \u20AC17,000+ in real rewards, and 2,000+ competing players.',
    '["numbers","scope","case-study"]',
    1
  ),
  (
    'bad_to_good',
    'Announcement Transformation',
    E'We are thrilled to announce our revolutionary new partnership with an amazing client! Can''t wait to share more about this game-changing project that will disrupt the industry! Stay tuned!',
    'New project: building a tournament platform for casual mobile gamers. Real prizes, no entry fees, no forced ads. First prototype in 6 weeks. Will share the design process as we go.',
    '["transformation","announcement"]',
    2
  ),
  (
    'hook',
    'Hook Examples',
    NULL,
    E'Users don''t trust your ''free prize'' app. Here''s how to fix it.\nWe killed a feature 3 days before launch. Best decision we made.\nOne team built this. Here''s why that matters.\nThe ticket purchase took 2 taps. It used to take 7.',
    '["hooks","openers"]',
    3
  );


-- ============================================================================
-- TOV VOICE SPLIT
-- ============================================================================

INSERT INTO tov_voice_split (account, voice_name, characteristics, example, sort_order) VALUES
  (
    'Outloud',
    'Studio Voice',
    '["Objective, proof-driven","Focus on craft and process","\"We built\" not \"I think\"","Case studies, BTS, hiring","More visual content (carousels, videos)"]',
    'The ticket purchase flow went from 7 steps to 2. Here''s how we approached the redesign and what we learned about user trust.',
    1
  ),
  (
    'Ondrej',
    'Founder Voice',
    '["Opinionated, decision-focused","\"I\" and personal experience","Lessons, frameworks, hot takes","More text-heavy, threads","Can be more direct/provocative"]',
    'I stopped doing discovery calls 2 years ago. Controversial? Maybe. But here''s what happened to our close rate and why I''d do it again.',
    2
  );


-- ============================================================================
-- TOV VOICE COMPARISON
-- ============================================================================

INSERT INTO tov_voice_comparison (aspect, outloud, ondrej, sort_order) VALUES
  ('Pronoun', '"We"',              '"I"',                1),
  ('Tone',    'Objective',          'Opinionated',        2),
  ('Content', 'Proof of work',      'Lessons & takes',    3),
  ('Format',  'Visuals, carousels', 'Text, threads',      4),
  ('CTA',     '"See case study"',   '"DM me if..."',      5);


-- ============================================================================
-- TOV BLOCKED PHRASES
-- ============================================================================

INSERT INTO tov_blocked_phrases (phrase, suggestion, severity, sort_order) VALUES
  ('thrilled to announce',  'Just announce it directly',        'error',   1),
  ('proud to share',        'Share without the preamble',       'error',   2),
  ('humbled',               'Say thank you or skip it',         'error',   3),
  ('game-changer',          'Describe the specific impact',     'error',   4),
  ('revolutionary',         'Describe what it actually does',   'error',   5),
  ('disruptive',            'Be specific about the change',     'error',   6),
  ('excited to',            'Just do/share the thing',          'warning', 7),
  ('can''t wait',           'Just do/share the thing',          'warning', 8),
  ('stay tuned',            'End with substance instead',       'warning', 9),
  ('follow for more',       'End with value, not ask',          'warning', 10);
