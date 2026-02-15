import { create } from 'zustand';
import { Platform, PostFilters, PlanTab, TovTab, SettingsTab } from '@/types';

// ── UI-only state ───────────────────────────────────────────────────────────
// All data (posts, themes, content plan, ToV, settings) is now fetched and
// mutated via React hooks (usePosts, useThemes, useContentPlan, useTov,
// useSettings). The current user is provided by UserProvider context.
// This store holds ONLY ephemeral UI state: selections, modals, filters, tabs.

interface AppState {
  // Post selection
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;

  // Active navigation tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Create post modal
  isCreatePostOpen: boolean;
  setCreatePostOpen: (open: boolean) => void;

  // Denial modal
  isDenialModalOpen: boolean;
  denialTargetPostId: string | null;
  denialType: 'creative' | 'final' | null;
  openDenialModal: (postId: string, type: 'creative' | 'final') => void;
  closeDenialModal: () => void;

  // Schedule modal
  isScheduleModalOpen: boolean;
  scheduleTargetPostId: string | null;
  openScheduleModal: (postId: string) => void;
  closeScheduleModal: () => void;

  // Mark as posted modal
  isMarkPostedModalOpen: boolean;
  markPostedTargetPostId: string | null;
  openMarkPostedModal: (postId: string) => void;
  closeMarkPostedModal: () => void;

  // Shortcuts modal
  isShortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;

  // Filters
  filters: PostFilters;
  setFilterPlatforms: (platforms: Platform[]) => void;
  setFilterAccount: (account: string | null) => void;
  setFilterSearch: (search: string) => void;
  setFilterTheme: (themeId: string | null) => void;
  clearFilters: () => void;

  // Content Plan tab
  planTab: PlanTab;
  setPlanTab: (tab: PlanTab) => void;

  // Tone of Voice tab
  tovTab: TovTab;
  setTovTab: (tab: TovTab) => void;

  // Settings tab
  settingsTab: SettingsTab;
  setSettingsTab: (tab: SettingsTab) => void;
}

// ── Default filter state ────────────────────────────────────────────────────

const DEFAULT_FILTERS: PostFilters = {
  platforms: [],
  account: null,
  search: '',
  theme: null,
};

// ── Store ───────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  // Post selection
  selectedPostId: null,
  setSelectedPostId: (id) => set({ selectedPostId: id }),

  // Active navigation tab
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Create post modal
  isCreatePostOpen: false,
  setCreatePostOpen: (open) => set({ isCreatePostOpen: open }),

  // Denial modal
  isDenialModalOpen: false,
  denialTargetPostId: null,
  denialType: null,
  openDenialModal: (postId, type) =>
    set({ isDenialModalOpen: true, denialTargetPostId: postId, denialType: type }),
  closeDenialModal: () =>
    set({ isDenialModalOpen: false, denialTargetPostId: null, denialType: null }),

  // Schedule modal
  isScheduleModalOpen: false,
  scheduleTargetPostId: null,
  openScheduleModal: (postId) =>
    set({ isScheduleModalOpen: true, scheduleTargetPostId: postId }),
  closeScheduleModal: () =>
    set({ isScheduleModalOpen: false, scheduleTargetPostId: null }),

  // Mark as posted modal
  isMarkPostedModalOpen: false,
  markPostedTargetPostId: null,
  openMarkPostedModal: (postId) =>
    set({ isMarkPostedModalOpen: true, markPostedTargetPostId: postId }),
  closeMarkPostedModal: () =>
    set({ isMarkPostedModalOpen: false, markPostedTargetPostId: null }),

  // Shortcuts modal
  isShortcutsModalOpen: false,
  setShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),

  // Filters
  filters: DEFAULT_FILTERS,
  setFilterPlatforms: (platforms) =>
    set((state) => ({ filters: { ...state.filters, platforms } })),
  setFilterAccount: (account) =>
    set((state) => ({ filters: { ...state.filters, account } })),
  setFilterSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),
  setFilterTheme: (theme) =>
    set((state) => ({ filters: { ...state.filters, theme } })),
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),

  // Content Plan tab
  planTab: 'overview',
  setPlanTab: (tab) => set({ planTab: tab }),

  // Tone of Voice tab
  tovTab: 'guidelines',
  setTovTab: (tab) => set({ tovTab: tab }),

  // Settings tab
  settingsTab: 'appearance',
  setSettingsTab: (tab) => set({ settingsTab: tab }),
}));
