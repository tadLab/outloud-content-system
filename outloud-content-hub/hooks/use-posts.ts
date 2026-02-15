'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Post,
  PostStatus,
  Platform,
  Comment,
  MediaFile,
  NewPostFormData,
  UserId,
} from '@/types';

// ── Raw DB row types (snake_case) ────────────────────────────────────────────

interface DbPost {
  id: string;
  title: string;
  content: string | null;
  platform: string;
  account: string;
  status: string;
  author_id: string;
  theme_id: string | null;
  ai_score: number | null;
  tov_score: number | null;
  flagged_phrases: string[] | null;
  tov_suggestions: string[] | null;
  has_creative: boolean;
  creative_approved: boolean;
  creative_approved_by: string | null;
  creative_approved_at: string | null;
  creative_denied: boolean | null;
  creative_denied_by: string | null;
  creative_denial_reason: string | null;
  creative_denied_at: string | null;
  final_approved: boolean | null;
  final_approved_by: string | null;
  final_approved_at: string | null;
  final_denied: boolean | null;
  final_denied_by: string | null;
  final_denial_reason: string | null;
  final_denied_at: string | null;
  revision_count: number;
  waiting_for: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  scheduled_iso: string | null;
  post_url: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DbMediaFile {
  id: string;
  post_id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  thumbnail_url: string | null;
  sort_order: number;
  created_at: string;
}

interface DbComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

// Profile lookup: UUID -> UserId
type ProfileLookup = Record<string, UserId>;

// ── Mapping helpers ──────────────────────────────────────────────────────────

function uuidToKey(uuid: string | null | undefined, lookup: ProfileLookup): UserId | undefined {
  if (!uuid) return undefined;
  return lookup[uuid];
}

function formatTimestamp(ts: string | null | undefined): string | undefined {
  if (!ts) return undefined;
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

function mapDbMediaFile(row: DbMediaFile): MediaFile {
  return {
    id: row.id,
    url: row.url,
    filename: row.filename,
    size: row.size,
    type: row.type as MediaFile['type'],
    mimeType: row.mime_type,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    duration: row.duration ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
  };
}

function mapDbComment(row: DbComment, lookup: ProfileLookup): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: uuidToKey(row.author_id, lookup) ?? ('tade' as UserId),
    content: row.content,
    createdAt: formatTimestamp(row.created_at) ?? row.created_at,
  };
}

function mapDbPostToPost(
  dbPost: DbPost,
  mediaFiles: DbMediaFile[],
  comments: DbComment[],
  lookup: ProfileLookup,
): Post {
  const postMedia = mediaFiles
    .filter((mf) => mf.post_id === dbPost.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapDbMediaFile);

  const postComments = comments
    .filter((c) => c.post_id === dbPost.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((c) => mapDbComment(c, lookup));

  return {
    id: dbPost.id,
    title: dbPost.title,
    content: dbPost.content ?? undefined,
    platform: dbPost.platform as Platform,
    account: dbPost.account,
    aiScore: dbPost.ai_score ?? 0,
    tovScore: dbPost.tov_score ?? 0,
    comments: postComments,
    hasCreative: dbPost.has_creative,
    creativeApproved: dbPost.creative_approved,
    creativeApprovedBy: uuidToKey(dbPost.creative_approved_by, lookup),
    creativeApprovedAt: formatTimestamp(dbPost.creative_approved_at),
    creativeDenied: dbPost.creative_denied ?? undefined,
    creativeDeniedBy: uuidToKey(dbPost.creative_denied_by, lookup),
    creativeDenialReason: dbPost.creative_denial_reason ?? undefined,
    creativeDeniedAt: formatTimestamp(dbPost.creative_denied_at),
    finalApproved: dbPost.final_approved ?? undefined,
    finalApprovedBy: uuidToKey(dbPost.final_approved_by, lookup),
    finalApprovedAt: formatTimestamp(dbPost.final_approved_at),
    finalDenied: dbPost.final_denied ?? undefined,
    finalDeniedBy: uuidToKey(dbPost.final_denied_by, lookup),
    finalDenialReason: dbPost.final_denial_reason ?? undefined,
    finalDeniedAt: formatTimestamp(dbPost.final_denied_at),
    revisionCount: dbPost.revision_count,
    author: uuidToKey(dbPost.author_id, lookup) ?? ('tade' as UserId),
    status: dbPost.status as PostStatus,
    waitingFor: dbPost.waiting_for ?? undefined,
    scheduledDate: dbPost.scheduled_date ?? undefined,
    scheduledTime: dbPost.scheduled_time ?? undefined,
    scheduledISO: dbPost.scheduled_iso ?? undefined,
    postUrl: dbPost.post_url ?? undefined,
    postedAt: formatTimestamp(dbPost.posted_at),
    flaggedPhrases: dbPost.flagged_phrases ?? undefined,
    tovSuggestions: dbPost.tov_suggestions ?? undefined,
    mediaFiles: postMedia,
    createdAt: dbPost.created_at,
    themeId: dbPost.theme_id ?? undefined,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePosts(currentUserId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref for the profile lookup so mutations always have the latest
  const profileLookupRef = useRef<ProfileLookup>({});

  // ── Internal: build profile lookup ─────────────────────────────────────

  const buildProfileLookup = useCallback(async (): Promise<ProfileLookup> => {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, user_key');

    if (err || !data) {
      console.error('[usePosts] Failed to fetch profiles for lookup:', err?.message);
      return profileLookupRef.current; // fall back to last known
    }

    const lookup: ProfileLookup = {};
    for (const row of data as { id: string; user_key: string }[]) {
      lookup[row.id] = row.user_key as UserId;
    }
    profileLookupRef.current = lookup;
    return lookup;
  }, []);

  // Reverse lookup: UserId -> UUID (uses current ref)
  const keyToUuid = useCallback((key: UserId): string | undefined => {
    const lookup = profileLookupRef.current;
    for (const [uuid, k] of Object.entries(lookup)) {
      if (k === key) return uuid;
    }
    return undefined;
  }, []);

  // ── Fetch all posts ────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Fetch profiles, posts, media_files, and comments in parallel
      const [lookupResult, postsResult, mediaResult, commentsResult] = await Promise.all([
        buildProfileLookup(),
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('media_files').select('*').order('sort_order', { ascending: true }),
        supabase.from('comments').select('*').order('created_at', { ascending: true }),
      ]);

      if (postsResult.error) throw new Error(`Posts fetch: ${postsResult.error.message}`);
      if (mediaResult.error) throw new Error(`Media fetch: ${mediaResult.error.message}`);
      if (commentsResult.error) throw new Error(`Comments fetch: ${commentsResult.error.message}`);

      const dbPosts = (postsResult.data ?? []) as DbPost[];
      const dbMedia = (mediaResult.data ?? []) as DbMediaFile[];
      const dbComments = (commentsResult.data ?? []) as DbComment[];

      const mapped = dbPosts.map((p) => mapDbPostToPost(p, dbMedia, dbComments, lookupResult));
      setPosts(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error loading posts';
      setError(message);
      console.error('[usePosts]', message);
    } finally {
      setIsLoading(false);
    }
  }, [buildProfileLookup]);

  // Run on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Real-time subscription for posts
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('posts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  // Real-time subscription for comments
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('comments-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => {
          fetchPosts(); // comments are embedded in posts
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  // ── Optimistic update helper ───────────────────────────────────────────

  const optimisticUpdate = useCallback(
    (postId: string, updater: (post: Post) => Post) => {
      setPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
    },
    [],
  );

  // ── Mutations ──────────────────────────────────────────────────────────

  /**
   * Add a new post. Returns the new post's id on success, or null on error.
   */
  const addPost = useCallback(
    async (data: NewPostFormData, status: PostStatus): Promise<string | null> => {
      if (!currentUserId) {
        setError('Cannot add post: no authenticated user');
        return null;
      }

      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const waitingFor =
          status === 'design_review' ? 'Martin' : status === 'final_review' ? 'Ondrej' : null;

        const insertPayload = {
          title: data.title,
          content: data.content,
          platform: data.platform,
          account: data.account,
          status,
          author_id: currentUserId,
          theme_id: data.themeId ?? null,
          ai_score: 0,
          tov_score: 0,
          has_creative: (data.mediaFiles?.length ?? 0) > 0,
          creative_approved: false,
          revision_count: 0,
          waiting_for: waitingFor,
          created_at: now,
          updated_at: now,
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('posts')
          .insert(insertPayload)
          .select()
          .single();

        if (insertErr || !inserted) {
          throw new Error(insertErr?.message ?? 'Insert returned no data');
        }

        const postId = (inserted as DbPost).id;

        // Insert media files if any
        if (data.mediaFiles && data.mediaFiles.length > 0) {
          const mediaRows = data.mediaFiles.map((mf, idx) => ({
            id: mf.id,
            post_id: postId,
            url: mf.url,
            filename: mf.filename,
            size: mf.size,
            type: mf.type,
            mime_type: mf.mimeType,
            width: mf.width ?? null,
            height: mf.height ?? null,
            duration: mf.duration ?? null,
            thumbnail_url: mf.thumbnailUrl ?? null,
            sort_order: idx,
          }));

          const { error: mediaErr } = await supabase.from('media_files').insert(mediaRows);
          if (mediaErr) {
            console.error('[usePosts] Failed to insert media files:', mediaErr.message);
          }
        }

        // Build the local Post object and prepend to state
        const lookup = profileLookupRef.current;
        const newPost: Post = {
          id: postId,
          title: data.title,
          content: data.content,
          platform: data.platform,
          account: data.account,
          aiScore: 0,
          tovScore: 0,
          comments: [],
          hasCreative: (data.mediaFiles?.length ?? 0) > 0,
          creativeApproved: false,
          revisionCount: 0,
          author: uuidToKey(currentUserId, lookup) ?? ('tade' as UserId),
          status,
          waitingFor: waitingFor ?? undefined,
          mediaFiles: data.mediaFiles ?? [],
          createdAt: now,
          themeId: data.themeId,
        };

        setPosts((prev) => [newPost, ...prev]);
        return postId;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add post';
        setError(message);
        console.error('[usePosts.addPost]', message);
        return null;
      }
    },
    [currentUserId],
  );

  /**
   * Update arbitrary fields on a post.
   */
  const updatePost = useCallback(
    async (postId: string, updates: Partial<Post>): Promise<boolean> => {
      try {
        const supabase = createClient();

        // Convert camelCase updates to snake_case for the DB
        const dbUpdates: Record<string, unknown> = {};

        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.content !== undefined) dbUpdates.content = updates.content;
        if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
        if (updates.account !== undefined) dbUpdates.account = updates.account;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.aiScore !== undefined) dbUpdates.ai_score = updates.aiScore;
        if (updates.tovScore !== undefined) dbUpdates.tov_score = updates.tovScore;
        if (updates.hasCreative !== undefined) dbUpdates.has_creative = updates.hasCreative;
        if (updates.creativeApproved !== undefined) dbUpdates.creative_approved = updates.creativeApproved;
        if (updates.revisionCount !== undefined) dbUpdates.revision_count = updates.revisionCount;
        if (updates.waitingFor !== undefined) dbUpdates.waiting_for = updates.waitingFor ?? null;
        if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate ?? null;
        if (updates.scheduledTime !== undefined) dbUpdates.scheduled_time = updates.scheduledTime ?? null;
        if (updates.scheduledISO !== undefined) dbUpdates.scheduled_iso = updates.scheduledISO ?? null;
        if (updates.postUrl !== undefined) dbUpdates.post_url = updates.postUrl ?? null;
        if (updates.postedAt !== undefined) dbUpdates.posted_at = updates.postedAt ?? null;
        if (updates.flaggedPhrases !== undefined) dbUpdates.flagged_phrases = updates.flaggedPhrases ?? null;
        if (updates.tovSuggestions !== undefined) dbUpdates.tov_suggestions = updates.tovSuggestions ?? null;
        if (updates.themeId !== undefined) dbUpdates.theme_id = updates.themeId ?? null;

        // UUID-ref fields: if the update contains a UserId, convert to UUID
        if (updates.creativeApprovedBy !== undefined) {
          dbUpdates.creative_approved_by = updates.creativeApprovedBy
            ? keyToUuid(updates.creativeApprovedBy) ?? null
            : null;
        }
        if (updates.creativeDenied !== undefined) dbUpdates.creative_denied = updates.creativeDenied ?? null;
        if (updates.creativeDeniedBy !== undefined) {
          dbUpdates.creative_denied_by = updates.creativeDeniedBy
            ? keyToUuid(updates.creativeDeniedBy) ?? null
            : null;
        }
        if (updates.creativeDenialReason !== undefined) dbUpdates.creative_denial_reason = updates.creativeDenialReason ?? null;
        if (updates.creativeDeniedAt !== undefined) dbUpdates.creative_denied_at = updates.creativeDeniedAt ?? null;
        if (updates.finalApproved !== undefined) dbUpdates.final_approved = updates.finalApproved ?? null;
        if (updates.finalApprovedBy !== undefined) {
          dbUpdates.final_approved_by = updates.finalApprovedBy
            ? keyToUuid(updates.finalApprovedBy) ?? null
            : null;
        }
        if (updates.finalApprovedAt !== undefined) dbUpdates.final_approved_at = updates.finalApprovedAt ?? null;
        if (updates.finalDenied !== undefined) dbUpdates.final_denied = updates.finalDenied ?? null;
        if (updates.finalDeniedBy !== undefined) {
          dbUpdates.final_denied_by = updates.finalDeniedBy
            ? keyToUuid(updates.finalDeniedBy) ?? null
            : null;
        }
        if (updates.finalDenialReason !== undefined) dbUpdates.final_denial_reason = updates.finalDenialReason ?? null;
        if (updates.finalDeniedAt !== undefined) dbUpdates.final_denied_at = updates.finalDeniedAt ?? null;

        dbUpdates.updated_at = new Date().toISOString();

        const { error: updateErr } = await supabase
          .from('posts')
          .update(dbUpdates)
          .eq('id', postId);

        if (updateErr) throw new Error(updateErr.message);

        // Optimistic update
        optimisticUpdate(postId, (post) => ({ ...post, ...updates }));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update post';
        setError(message);
        console.error('[usePosts.updatePost]', message);
        return false;
      }
    },
    [keyToUuid, optimisticUpdate],
  );

  /**
   * Move a post to a new status column.
   */
  const movePost = useCallback(
    async (postId: string, newStatus: PostStatus): Promise<boolean> => {
      try {
        const supabase = createClient();
        const { error: err } = await supabase
          .from('posts')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', postId);

        if (err) throw new Error(err.message);

        optimisticUpdate(postId, (post) => ({ ...post, status: newStatus }));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to move post';
        setError(message);
        console.error('[usePosts.movePost]', message);
        return false;
      }
    },
    [optimisticUpdate],
  );

  /**
   * Duplicate a post as a new draft.
   */
  const duplicatePost = useCallback(
    async (postId: string): Promise<string | null> => {
      const original = posts.find((p) => p.id === postId);
      if (!original) {
        setError('Post not found for duplication');
        return null;
      }

      if (!currentUserId) {
        setError('Cannot duplicate: no authenticated user');
        return null;
      }

      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const insertPayload = {
          title: `${original.title} (Copy)`,
          content: original.content ?? null,
          platform: original.platform,
          account: original.account,
          status: 'draft' as const,
          author_id: currentUserId,
          theme_id: original.themeId ?? null,
          ai_score: original.aiScore,
          tov_score: original.tovScore,
          flagged_phrases: original.flaggedPhrases ?? null,
          tov_suggestions: original.tovSuggestions ?? null,
          has_creative: false,
          creative_approved: false,
          revision_count: 0,
          waiting_for: null,
          created_at: now,
          updated_at: now,
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('posts')
          .insert(insertPayload)
          .select()
          .single();

        if (insertErr || !inserted) {
          throw new Error(insertErr?.message ?? 'Duplicate insert returned no data');
        }

        const newId = (inserted as DbPost).id;
        const lookup = profileLookupRef.current;

        const newPost: Post = {
          ...original,
          id: newId,
          title: `${original.title} (Copy)`,
          status: 'draft',
          creativeApproved: false,
          creativeDenied: undefined,
          creativeDeniedBy: undefined,
          creativeDenialReason: undefined,
          creativeDeniedAt: undefined,
          finalApproved: undefined,
          finalApprovedBy: undefined,
          finalApprovedAt: undefined,
          finalDenied: undefined,
          finalDeniedBy: undefined,
          finalDenialReason: undefined,
          finalDeniedAt: undefined,
          scheduledDate: undefined,
          scheduledTime: undefined,
          scheduledISO: undefined,
          postUrl: undefined,
          postedAt: undefined,
          waitingFor: undefined,
          hasCreative: false,
          comments: [],
          mediaFiles: [],
          revisionCount: 0,
          createdAt: now,
          author: uuidToKey(currentUserId, lookup) ?? original.author,
        };

        setPosts((prev) => [newPost, ...prev]);
        return newId;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to duplicate post';
        setError(message);
        console.error('[usePosts.duplicatePost]', message);
        return null;
      }
    },
    [posts, currentUserId],
  );

  /**
   * Add a comment to a post.
   */
  const addComment = useCallback(
    async (postId: string, content: string): Promise<boolean> => {
      if (!currentUserId) {
        setError('Cannot comment: no authenticated user');
        return false;
      }

      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const { data: inserted, error: insertErr } = await supabase
          .from('comments')
          .insert({
            post_id: postId,
            author_id: currentUserId,
            content,
            created_at: now,
          })
          .select()
          .single();

        if (insertErr || !inserted) {
          throw new Error(insertErr?.message ?? 'Comment insert returned no data');
        }

        const lookup = profileLookupRef.current;
        const newComment: Comment = {
          id: (inserted as DbComment).id,
          postId,
          authorId: uuidToKey(currentUserId, lookup) ?? ('tade' as UserId),
          content,
          createdAt: formatTimestamp(now) ?? now,
        };

        optimisticUpdate(postId, (post) => ({
          ...post,
          comments: [...post.comments, newComment],
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add comment';
        setError(message);
        console.error('[usePosts.addComment]', message);
        return false;
      }
    },
    [currentUserId, optimisticUpdate],
  );

  /**
   * Approve creative (design review). Moves post to final_review.
   */
  const approveCreative = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!currentUserId) {
        setError('Cannot approve: no authenticated user');
        return false;
      }

      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const { error: err } = await supabase
          .from('posts')
          .update({
            creative_approved: true,
            creative_approved_by: currentUserId,
            creative_approved_at: now,
            creative_denied: false,
            creative_denial_reason: null,
            creative_denied_by: null,
            creative_denied_at: null,
            status: 'final_review',
            waiting_for: 'Ondrej',
            updated_at: now,
          })
          .eq('id', postId);

        if (err) throw new Error(err.message);

        const lookup = profileLookupRef.current;
        optimisticUpdate(postId, (post) => ({
          ...post,
          creativeApproved: true,
          creativeApprovedBy: uuidToKey(currentUserId, lookup),
          creativeApprovedAt: formatTimestamp(now),
          creativeDenied: false,
          creativeDenialReason: undefined,
          creativeDeniedBy: undefined,
          creativeDeniedAt: undefined,
          status: 'final_review' as PostStatus,
          waitingFor: 'Ondrej',
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to approve creative';
        setError(message);
        console.error('[usePosts.approveCreative]', message);
        return false;
      }
    },
    [currentUserId, optimisticUpdate],
  );

  /**
   * Approve final review. Moves post to approved.
   */
  const approveFinal = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!currentUserId) {
        setError('Cannot approve: no authenticated user');
        return false;
      }

      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const { error: err } = await supabase
          .from('posts')
          .update({
            final_approved: true,
            final_approved_by: currentUserId,
            final_approved_at: now,
            final_denied: false,
            final_denial_reason: null,
            final_denied_by: null,
            final_denied_at: null,
            status: 'approved',
            waiting_for: null,
            updated_at: now,
          })
          .eq('id', postId);

        if (err) throw new Error(err.message);

        const lookup = profileLookupRef.current;
        optimisticUpdate(postId, (post) => ({
          ...post,
          finalApproved: true,
          finalApprovedBy: uuidToKey(currentUserId, lookup),
          finalApprovedAt: formatTimestamp(now),
          finalDenied: false,
          finalDenialReason: undefined,
          finalDeniedBy: undefined,
          finalDeniedAt: undefined,
          status: 'approved' as PostStatus,
          waitingFor: undefined,
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to approve final';
        setError(message);
        console.error('[usePosts.approveFinal]', message);
        return false;
      }
    },
    [currentUserId, optimisticUpdate],
  );

  /**
   * Submit a denial (creative or final). Inserts a comment and updates denial fields.
   */
  const submitDenial = useCallback(
    async (
      postId: string,
      denialType: 'creative' | 'final',
      reason: string,
      returnTo: PostStatus,
    ): Promise<boolean> => {
      if (!currentUserId) {
        setError('Cannot deny: no authenticated user');
        return false;
      }

      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const commentPrefix =
          denialType === 'creative'
            ? 'Creative changes requested'
            : 'Returned for edits';

        const denialFields =
          denialType === 'creative'
            ? {
                creative_denied: true,
                creative_denied_by: currentUserId,
                creative_denial_reason: reason,
                creative_denied_at: now,
              }
            : {
                final_denied: true,
                final_denied_by: currentUserId,
                final_denial_reason: reason,
                final_denied_at: now,
              };

        const waitingFor = returnTo === 'design_review' ? 'Martin' : null;

        // Update post
        const { error: updateErr } = await supabase
          .from('posts')
          .update({
            ...denialFields,
            status: returnTo,
            waiting_for: waitingFor,
            revision_count: (posts.find((p) => p.id === postId)?.revisionCount ?? 0) + 1,
            updated_at: now,
          })
          .eq('id', postId);

        if (updateErr) throw new Error(updateErr.message);

        // Insert denial comment
        const commentContent = `${commentPrefix}: ${reason}`;
        const { data: insertedComment, error: commentErr } = await supabase
          .from('comments')
          .insert({
            post_id: postId,
            author_id: currentUserId,
            content: commentContent,
            created_at: now,
          })
          .select()
          .single();

        if (commentErr) {
          console.error('[usePosts.submitDenial] Comment insert failed:', commentErr.message);
        }

        const lookup = profileLookupRef.current;
        const userKeyVal = uuidToKey(currentUserId, lookup) ?? ('tade' as UserId);

        const denialUpdates: Partial<Post> =
          denialType === 'creative'
            ? {
                creativeDenied: true,
                creativeDeniedBy: userKeyVal,
                creativeDenialReason: reason,
                creativeDeniedAt: formatTimestamp(now),
              }
            : {
                finalDenied: true,
                finalDeniedBy: userKeyVal,
                finalDenialReason: reason,
                finalDeniedAt: formatTimestamp(now),
              };

        const newComment: Comment = {
          id: insertedComment ? (insertedComment as DbComment).id : `c-${Date.now()}`,
          postId,
          authorId: userKeyVal,
          content: commentContent,
          createdAt: formatTimestamp(now) ?? now,
        };

        optimisticUpdate(postId, (post) => ({
          ...post,
          ...denialUpdates,
          status: returnTo,
          waitingFor: waitingFor ?? undefined,
          revisionCount: post.revisionCount + 1,
          comments: [...post.comments, newComment],
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit denial';
        setError(message);
        console.error('[usePosts.submitDenial]', message);
        return false;
      }
    },
    [currentUserId, posts, optimisticUpdate],
  );

  /**
   * Schedule a post.
   */
  const schedulePost = useCallback(
    async (postId: string, date: string, time: string, iso?: string): Promise<boolean> => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const { error: err } = await supabase
          .from('posts')
          .update({
            status: 'scheduled',
            scheduled_date: date,
            scheduled_time: time,
            scheduled_iso: iso ?? null,
            updated_at: now,
          })
          .eq('id', postId);

        if (err) throw new Error(err.message);

        optimisticUpdate(postId, (post) => ({
          ...post,
          status: 'scheduled' as PostStatus,
          scheduledDate: date,
          scheduledTime: time,
          scheduledISO: iso,
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to schedule post';
        setError(message);
        console.error('[usePosts.schedulePost]', message);
        return false;
      }
    },
    [optimisticUpdate],
  );

  /**
   * Mark a post as posted.
   */
  const markAsPosted = useCallback(
    async (postId: string, postUrl?: string, postedAt?: string): Promise<boolean> => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();
        const effectivePostedAt = postedAt ?? now;

        const { error: err } = await supabase
          .from('posts')
          .update({
            status: 'posted',
            post_url: postUrl ?? null,
            posted_at: effectivePostedAt,
            updated_at: now,
          })
          .eq('id', postId);

        if (err) throw new Error(err.message);

        optimisticUpdate(postId, (post) => ({
          ...post,
          status: 'posted' as PostStatus,
          postUrl: postUrl ?? undefined,
          postedAt: formatTimestamp(effectivePostedAt),
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to mark as posted';
        setError(message);
        console.error('[usePosts.markAsPosted]', message);
        return false;
      }
    },
    [optimisticUpdate],
  );

  /**
   * Reschedule a post (e.g. from missed -> scheduled).
   */
  const reschedulePost = useCallback(
    async (postId: string, date: string, time: string, iso?: string): Promise<boolean> => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const { error: err } = await supabase
          .from('posts')
          .update({
            status: 'scheduled',
            scheduled_date: date,
            scheduled_time: time,
            scheduled_iso: iso ?? null,
            updated_at: now,
          })
          .eq('id', postId);

        if (err) throw new Error(err.message);

        optimisticUpdate(postId, (post) => ({
          ...post,
          status: 'scheduled' as PostStatus,
          scheduledDate: date,
          scheduledTime: time,
          scheduledISO: iso,
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reschedule post';
        setError(message);
        console.error('[usePosts.reschedulePost]', message);
        return false;
      }
    },
    [optimisticUpdate],
  );

  /**
   * Move a post back to draft, clearing scheduling fields.
   */
  const moveToDraft = useCallback(
    async (postId: string): Promise<boolean> => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const { error: err } = await supabase
          .from('posts')
          .update({
            status: 'draft',
            scheduled_date: null,
            scheduled_time: null,
            scheduled_iso: null,
            post_url: null,
            posted_at: null,
            updated_at: now,
          })
          .eq('id', postId);

        if (err) throw new Error(err.message);

        optimisticUpdate(postId, (post) => ({
          ...post,
          status: 'draft' as PostStatus,
          scheduledDate: undefined,
          scheduledTime: undefined,
          scheduledISO: undefined,
          postUrl: undefined,
          postedAt: undefined,
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to move to draft';
        setError(message);
        console.error('[usePosts.moveToDraft]', message);
        return false;
      }
    },
    [optimisticUpdate],
  );

  /**
   * Check all scheduled posts and mark any that are >= 1 hour past their
   * scheduled time as 'missed'. Updates both local state and the DB.
   */
  const checkAndMarkMissedPosts = useCallback(async (): Promise<void> => {
    const now = new Date();
    const missedIds: string[] = [];

    for (const post of posts) {
      if (post.status !== 'scheduled' || !post.scheduledISO) continue;
      const scheduledTime = new Date(post.scheduledISO);
      const hoursPast = (now.getTime() - scheduledTime.getTime()) / (1000 * 60 * 60);
      if (hoursPast >= 1) {
        missedIds.push(post.id);
      }
    }

    if (missedIds.length === 0) return;

    try {
      const supabase = createClient();
      const nowIso = now.toISOString();

      const { error: err } = await supabase
        .from('posts')
        .update({ status: 'missed', updated_at: nowIso })
        .in('id', missedIds);

      if (err) {
        console.error('[usePosts.checkAndMarkMissedPosts] DB update failed:', err.message);
      }

      // Optimistic update for all missed
      setPosts((prev) =>
        prev.map((p) =>
          missedIds.includes(p.id) ? { ...p, status: 'missed' as PostStatus } : p,
        ),
      );
    } catch (err) {
      console.error('[usePosts.checkAndMarkMissedPosts]', err);
    }
  }, [posts]);

  /**
   * Submit a post for review. Validates required fields before moving.
   */
  const submitForReview = useCallback(
    async (postId: string): Promise<{ success: boolean; message: string }> => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return { success: false, message: 'Post not found' };

      if (!post.title || post.title.trim().length === 0) {
        return { success: false, message: 'Title is required' };
      }
      if (!post.content || post.content.trim().length < 50) {
        return { success: false, message: 'Content must be at least 50 characters' };
      }
      if (!post.account) {
        return { success: false, message: 'Please select an account' };
      }
      if (post.aiScore >= 60) {
        return { success: false, message: 'AI score too high. Rewrite to sound more human.' };
      }
      if (post.tovScore > 0 && post.tovScore < 70) {
        return { success: false, message: 'Tone of Voice score too low. Adjust to match brand.' };
      }

      const nextStatus: PostStatus = post.hasCreative ? 'design_review' : 'final_review';
      const waitingFor = nextStatus === 'design_review' ? 'Martin' : 'Ondrej';

      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const { error: err } = await supabase
          .from('posts')
          .update({
            status: nextStatus,
            waiting_for: waitingFor,
            updated_at: now,
          })
          .eq('id', postId);

        if (err) throw new Error(err.message);

        optimisticUpdate(postId, (p) => ({
          ...p,
          status: nextStatus,
          waitingFor,
        }));

        return { success: true, message: `Submitted! Waiting for ${waitingFor}'s review.` };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit for review';
        return { success: false, message };
      }
    },
    [posts, optimisticUpdate],
  );

  /**
   * Add a media file to a post.
   */
  const addMediaFile = useCallback(
    async (postId: string, file: MediaFile): Promise<boolean> => {
      try {
        const supabase = createClient();

        // Count existing media for sort_order
        const existing = posts.find((p) => p.id === postId)?.mediaFiles.length ?? 0;

        const { error: insertErr } = await supabase.from('media_files').insert({
          id: file.id,
          post_id: postId,
          url: file.url,
          filename: file.filename,
          size: file.size,
          type: file.type,
          mime_type: file.mimeType,
          width: file.width ?? null,
          height: file.height ?? null,
          duration: file.duration ?? null,
          thumbnail_url: file.thumbnailUrl ?? null,
          sort_order: existing,
        });

        if (insertErr) throw new Error(insertErr.message);

        // Also mark the post as having creative
        const { error: updateErr } = await supabase
          .from('posts')
          .update({ has_creative: true, updated_at: new Date().toISOString() })
          .eq('id', postId);

        if (updateErr) {
          console.error('[usePosts.addMediaFile] Failed to update has_creative:', updateErr.message);
        }

        optimisticUpdate(postId, (post) => ({
          ...post,
          mediaFiles: [...post.mediaFiles, file],
          hasCreative: true,
        }));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add media file';
        setError(message);
        console.error('[usePosts.addMediaFile]', message);
        return false;
      }
    },
    [posts, optimisticUpdate],
  );

  /**
   * Remove a media file from a post.
   */
  const removeMediaFile = useCallback(
    async (postId: string, fileId: string): Promise<boolean> => {
      try {
        const supabase = createClient();

        const { error: deleteErr } = await supabase
          .from('media_files')
          .delete()
          .eq('id', fileId);

        if (deleteErr) throw new Error(deleteErr.message);

        // Check if any media remain
        const post = posts.find((p) => p.id === postId);
        const remainingCount = (post?.mediaFiles.filter((f) => f.id !== fileId).length ?? 0);

        if (remainingCount === 0) {
          const { error: updateErr } = await supabase
            .from('posts')
            .update({ has_creative: false, updated_at: new Date().toISOString() })
            .eq('id', postId);

          if (updateErr) {
            console.error('[usePosts.removeMediaFile] Failed to update has_creative:', updateErr.message);
          }
        }

        optimisticUpdate(postId, (post) => {
          const remaining = post.mediaFiles.filter((f) => f.id !== fileId);
          return {
            ...post,
            mediaFiles: remaining,
            hasCreative: remaining.length > 0,
          };
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove media file';
        setError(message);
        console.error('[usePosts.removeMediaFile]', message);
        return false;
      }
    },
    [posts, optimisticUpdate],
  );

  return {
    /** All posts, mapped to app camelCase types. */
    posts,
    /** True while the initial fetch is in progress. */
    isLoading,
    /** Last error message, or null. */
    error,

    // ── Mutations ──────────────────────────────────────────────────────────
    /** Create a new post. Returns the new post ID or null on failure. */
    addPost,
    /** Update arbitrary fields on a post. */
    updatePost,
    /** Move a post to a new status column (drag & drop). */
    movePost,
    /** Duplicate a post as a new draft. Returns the new post ID or null. */
    duplicatePost,
    /** Add a comment to a post. */
    addComment,
    /** Approve creative (design review). Moves post to final_review. */
    approveCreative,
    /** Approve final review. Moves post to approved. */
    approveFinal,
    /** Schedule a post with date, time, and optional ISO timestamp. */
    schedulePost,
    /** Mark a post as posted with optional URL and timestamp. */
    markAsPosted,
    /** Reschedule a missed or scheduled post. */
    reschedulePost,
    /** Move a post back to draft, clearing scheduling fields. */
    moveToDraft,
    /** Check all scheduled posts and mark overdue ones as missed. */
    checkAndMarkMissedPosts,
    /** Submit a denial with reason and return-to status. */
    submitDenial,
    /** Submit a post for review (validates required fields first). */
    submitForReview,
    /** Add a media file to a post. */
    addMediaFile,
    /** Remove a media file from a post. */
    removeMediaFile,
    /** Re-fetch all posts from the database. */
    refetch: fetchPosts,
  };
}
