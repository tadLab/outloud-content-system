'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserId, User, UserRole } from '@/types';

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string; // UUID from auth
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  userKey: UserId; // 'tade', 'martin', 'ondrej'
  initial: string;
  color: string;
  roleLabel: string;
}

// Raw row from the profiles table (snake_case)
interface DbProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  user_key: string;
  initial: string;
  color: string;
  role_label: string;
  created_at: string;
  updated_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapDbProfileToUserProfile(row: DbProfile): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    userKey: row.user_key as UserId,
    initial: row.initial,
    color: row.color,
    roleLabel: row.role_label,
  };
}

/** Convert a UserProfile to the legacy User type used throughout the app. */
export function toUser(profile: UserProfile): User {
  return {
    id: profile.userKey,
    name: profile.fullName,
    initial: profile.initial,
    color: profile.color,
    role: profile.role,
    roleLabel: profile.roleLabel,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived convenience value
  const userKey: UserId | null = user?.userKey ?? null;

  // Build lookup maps from allProfiles
  const profilesMap: Record<string, UserProfile> = useMemo(() => {
    const map: Record<string, UserProfile> = {};
    for (const p of allProfiles) {
      map[p.id] = p;
    }
    return map;
  }, [allProfiles]);

  const profilesByKey: Record<UserId, UserProfile> = useMemo(() => {
    const map: Partial<Record<UserId, UserProfile>> = {};
    for (const p of allProfiles) {
      map[p.userKey] = p;
    }
    return map as Record<UserId, UserProfile>;
  }, [allProfiles]);

  // Quick lookup helpers
  const getProfileByKey = useCallback(
    (key: UserId): UserProfile | undefined => profilesByKey[key],
    [profilesByKey],
  );

  const getProfileById = useCallback(
    (id: string): UserProfile | undefined => profilesMap[id],
    [profilesMap],
  );

  // Map a UUID to a UserId (returns undefined if not found)
  const uuidToUserKey = useCallback(
    (uuid: string | null | undefined): UserId | undefined => {
      if (!uuid) return undefined;
      return profilesMap[uuid]?.userKey;
    },
    [profilesMap],
  );

  // Map a UserId to a UUID (returns undefined if not found)
  const userKeyToUuid = useCallback(
    (key: UserId | null | undefined): string | undefined => {
      if (!key) return undefined;
      return profilesByKey[key]?.id;
    },
    [profilesByKey],
  );

  // ── Fetch logic ────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 1. Get the authenticated user from Supabase Auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }

      if (!authUser) {
        // Not logged in; clear state but don't treat as error
        setUser(null);
        setAllProfiles([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch ALL profiles (we need them for UUID <-> userKey mapping)
      const { data: profileRows, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (profilesError) {
        throw new Error(`Profiles fetch error: ${profilesError.message}`);
      }

      const mappedProfiles = (profileRows as DbProfile[]).map(mapDbProfileToUserProfile);
      setAllProfiles(mappedProfiles);

      // 3. Find the current user's profile by auth UUID
      const currentProfile = mappedProfiles.find((p) => p.id === authUser.id) ?? null;

      if (!currentProfile) {
        throw new Error(
          'Your account exists in auth but has no matching profile row. Contact an admin.',
        );
      }

      setUser(currentProfile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error loading user';
      setError(message);
      console.error('[useUser]', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for auth state changes (login / logout)
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Re-fetch whenever auth state changes
      fetchData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return {
    /** Current authenticated user's profile, or null if not logged in. */
    user,
    /** Shortcut: the current user's key ('tade' | 'martin' | 'ondrej'), or null. */
    userKey,
    /** All profiles in the workspace (for mapping UUIDs to user keys). */
    allProfiles,
    /** Map of auth UUID -> UserProfile. */
    profilesMap,
    /** Map of user_key -> UserProfile. */
    profilesByKey,
    /** Look up a profile by user_key. */
    getProfileByKey,
    /** Look up a profile by auth UUID. */
    getProfileById,
    /** Convert an auth UUID to a UserId ('tade' | 'martin' | 'ondrej'). */
    uuidToUserKey,
    /** Convert a UserId to an auth UUID. */
    userKeyToUuid,
    /** Convert a UserProfile to the legacy User type. */
    toUser,
    /** True while the initial fetch is in progress. */
    isLoading,
    /** Error message, or null. */
    error,
    /** Manually re-fetch all user data. */
    refetch: fetchData,
  };
}
