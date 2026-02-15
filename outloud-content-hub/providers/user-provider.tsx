'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUser, UserProfile, toUser } from '@/hooks/use-user';
import { UserId, User } from '@/types';

// ── Context value type ──────────────────────────────────────────────────────

interface UserContextValue {
  // Current user
  user: UserProfile | null;
  userKey: UserId | null;
  isLoading: boolean;
  error: string | null;

  // Profile lookups (replaces USERS from mock-data)
  allProfiles: UserProfile[];
  profilesMap: Record<string, UserProfile>; // UUID -> profile
  profilesByKey: Record<string, UserProfile>; // user_key -> profile

  // Helpers
  getProfileByKey: (key: UserId) => UserProfile | undefined;
  getProfileById: (id: string) => UserProfile | undefined;
  uuidToUserKey: (uuid: string | null | undefined) => UserId | undefined;
  userKeyToUuid: (key: UserId | null | undefined) => string | undefined;

  // Legacy compat: build USERS-like lookup
  getUserByKey: (key: UserId) => User;
}

// ── Fallback users (used while profiles are loading) ────────────────────────

const FALLBACK_USERS: Record<UserId, User> = {
  tade: {
    id: 'tade',
    name: 'Tade',
    initial: 'T',
    color: '#E85A2C',
    role: 'admin',
    roleLabel: 'Head of Media',
  },
  martin: {
    id: 'martin',
    name: 'Martin',
    initial: 'M',
    color: '#3B82F6',
    role: 'designer',
    roleLabel: 'Designer',
  },
  ondrej: {
    id: 'ondrej',
    name: 'Ondrej',
    initial: 'O',
    color: '#8B5CF6',
    role: 'approver',
    roleLabel: 'CEO',
  },
};

// ── Context ─────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextValue | null>(null);

// ── Provider component ──────────────────────────────────────────────────────

export function UserProvider({ children }: { children: ReactNode }) {
  const {
    user,
    userKey,
    allProfiles,
    profilesMap,
    profilesByKey,
    getProfileByKey,
    getProfileById,
    uuidToUserKey,
    userKeyToUuid,
    isLoading,
    error,
  } = useUser();

  // Legacy compat helper: try from loaded profiles, fall back to hardcoded
  function getUserByKey(key: UserId): User {
    const profile = profilesByKey[key];
    if (profile) {
      return toUser(profile);
    }
    return FALLBACK_USERS[key];
  }

  const value: UserContextValue = {
    user,
    userKey,
    isLoading,
    error,
    allProfiles,
    profilesMap,
    profilesByKey,
    getProfileByKey,
    getProfileById,
    uuidToUserKey,
    userKeyToUuid,
    getUserByKey,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ── Consumer hook ───────────────────────────────────────────────────────────

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserContext must be used within a <UserProvider>');
  }
  return ctx;
}
