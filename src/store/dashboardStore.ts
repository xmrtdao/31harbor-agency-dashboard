import { create } from 'zustand';
import {
  type Company,
  type Lead,
  type PipelineStage,
  type Campaign,
  type ActivityEntry,
  type Notification,
  companies,
  leads,
  pipelineStages,
  campaigns,
  activityFeed,
  notifications,
} from '@/data/mockData';

interface DashboardStore {
  // UI State
  activeCompany: 'all' | 'harbor' | 'party' | 'xmrt';
  sidebarCollapsed: boolean;
  notifications: Notification[];

  // Data
  companies: Company[];
  leads: Lead[];
  pipelineStages: PipelineStage[];
  campaigns: Campaign[];
  activityFeed: ActivityEntry[];

  // Actions
  setActiveCompany: (c: 'all' | 'harbor' | 'party' | 'xmrt') => void;
  toggleSidebar: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  // UI State
  activeCompany: 'all',
  sidebarCollapsed: false,
  notifications: [...notifications],

  // Data
  companies: [...companies],
  leads: [...leads],
  pipelineStages: [...pipelineStages],
  campaigns: [...campaigns],
  activityFeed: [...activityFeed],

  // Actions
  setActiveCompany: (c) => set({ activeCompany: c }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
