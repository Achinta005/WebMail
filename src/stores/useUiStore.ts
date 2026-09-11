import { create, type UseBoundStore, type StoreApi } from "zustand";
import type { AnimationMode } from "@/lib/motion/config";

const STORAGE_KEY = "rav-ui-settings";

export type ThemeMode = "light" | "dark" | "system";

interface PersistedSettings {
  sidebarWidth?: number;
  messageListWidth?: number;
  activeFolder?: string;
  selectedAlias?: string;
  activeFilter?: "all" | "unread" | "starred";
  density?: "compact" | "comfortable";
  theme?: ThemeMode;
  blockRemoteResources?: boolean;
  sidebarCollapsed?: boolean;
}

function loadSettings(): PersistedSettings {
  if (typeof window === "undefined") {
    return {
      sidebarWidth: 220,
      messageListWidth: 380,
      activeFolder: "inbox",
      selectedAlias: "all",
      activeFilter: "all",
      density: "comfortable",
      theme: "dark",
      blockRemoteResources: true,
      sidebarCollapsed: false,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {
    sidebarWidth: 220,
    messageListWidth: 380,
    activeFolder: "inbox",
    selectedAlias: "all",
    activeFilter: "all",
    density: "comfortable",
    theme: "dark",
    blockRemoteResources: true,
    sidebarCollapsed: false,
  };
}

function saveSettings(settings: Partial<PersistedSettings>) {
  try {
    const current = loadSettings();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...current, ...settings }),
    );
  } catch {
    // ignore
  }
}

const DEFAULT_SIDEBAR_WIDTH = 220;
const DEFAULT_MESSAGE_LIST_WIDTH = 380;

export interface UiState {
  activeFolder: string;
  selectedAlias: string;
  selectedEmailId: string | null;
  sidebarWidth: number;
  messageListWidth: number;
  readingPaneVisible: boolean;
  density: "compact" | "comfortable";
  theme: ThemeMode;
  searchQuery: string;
  activeFilter: "all" | "unread" | "starred";
  viewMode: "mail" | "settings";
  effectiveAnimationMode: AnimationMode;
  mobilePanelView: "sidebar" | "list" | "reading";
  blockRemoteResources: boolean;
  isSidebarCollapsed: boolean;

  initSettings: () => void;
  setActiveFolder: (folder: string) => void;
  setSelectedAlias: (alias: string) => void;
  selectEmail: (id: string | null) => void;
  setSidebarWidth: (width: number) => void;
  setMessageListWidth: (width: number) => void;
  setReadingPaneVisible: (visible: boolean) => void;
  setDensity: (density: "compact" | "comfortable") => void;
  setTheme: (theme: ThemeMode) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: "all" | "unread" | "starred") => void;
  setViewMode: (mode: "mail" | "settings") => void;
  setMobilePanelView: (view: "sidebar" | "list" | "reading") => void;
  setBlockRemoteResources: (block: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUiStore: UseBoundStore<StoreApi<UiState>> = create<UiState>((set) => ({
  activeFolder: "inbox",
  selectedAlias: "all",
  selectedEmailId: null,
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  messageListWidth: DEFAULT_MESSAGE_LIST_WIDTH,
  readingPaneVisible: true,
  density: "comfortable",
  theme: "dark",
  searchQuery: "",
  activeFilter: "all",
  viewMode: "mail",
  effectiveAnimationMode: "medium",
  mobilePanelView: "list",
  blockRemoteResources: true,
  isSidebarCollapsed: false,

  initSettings: () => {
    const saved = loadSettings();
    const effectiveTheme = saved.theme || "dark";

    if (typeof document !== "undefined") {
      if (effectiveTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    set({
      sidebarWidth: saved.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH,
      messageListWidth: saved.messageListWidth ?? DEFAULT_MESSAGE_LIST_WIDTH,
      activeFolder: saved.activeFolder || "inbox",
      selectedAlias: saved.selectedAlias || "all",
      activeFilter: saved.activeFilter || "all",
      density: saved.density || "comfortable",
      theme: effectiveTheme,
      blockRemoteResources: saved.blockRemoteResources ?? true,
      isSidebarCollapsed: saved.sidebarCollapsed ?? false,
    });
  },

  setActiveFolder: (folder) => {
    saveSettings({ activeFolder: folder, selectedAlias: "all" });
    set({ activeFolder: folder, selectedAlias: "all", selectedEmailId: null, mobilePanelView: "list" });
  },

  setSelectedAlias: (alias) => {
    saveSettings({ selectedAlias: alias, activeFolder: "inbox" });
    set({ selectedAlias: alias, activeFolder: "inbox", selectedEmailId: null, mobilePanelView: "list" });
  },

  selectEmail: (id) =>
    set({ selectedEmailId: id, mobilePanelView: id ? "reading" : "list" }),

  setSidebarWidth: (sidebarWidth) => {
    saveSettings({ sidebarWidth });
    set({ sidebarWidth });
  },

  setMessageListWidth: (messageListWidth) => {
    saveSettings({ messageListWidth });
    set({ messageListWidth });
  },

  setReadingPaneVisible: (readingPaneVisible) => set({ readingPaneVisible }),

  setDensity: (density) => {
    saveSettings({ density });
    set({ density });
  },

  setTheme: (theme) => {
    saveSettings({ theme });
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    set({ theme });
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setActiveFilter: (activeFilter) => {
    saveSettings({ activeFilter });
    set({ activeFilter });
  },

  setViewMode: (viewMode) => set({ viewMode }),

  setMobilePanelView: (mobilePanelView) => set({ mobilePanelView }),

  setBlockRemoteResources: (blockRemoteResources) => {
    saveSettings({ blockRemoteResources });
    set({ blockRemoteResources });
  },

  toggleSidebar: () => {
    const next = !useUiStore.getState().isSidebarCollapsed;
    saveSettings({ sidebarCollapsed: next });
    set({ isSidebarCollapsed: next });
  },

  setSidebarCollapsed: (isSidebarCollapsed) => {
    saveSettings({ sidebarCollapsed: isSidebarCollapsed });
    set({ isSidebarCollapsed });
  },
}));
