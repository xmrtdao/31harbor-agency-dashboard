import { create } from 'zustand';
import { initDB, saveDB } from '@/db/sqlite';
import * as queries from '@/db/queries';
import type {
  Company,
  Lead,
  LeadFilters,
  LeadSharingRule,
  Campaign,
  PipelineStage,
  ActivityEntry,
  User,
  Notification,
} from '@/db/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStore {
  // ── SQLite State ────────────────────────────────────────────────────
  dbReady: boolean;

  // ── UI State ────────────────────────────────────────────────────────
  activeCompany: 'all' | 'harbor' | 'party' | 'xmrt';
  sidebarCollapsed: boolean;
  notifications: Notification[];

  // ── Cached Data (synced from SQLite) ──────────────────────────────
  companies: Company[];
  leads: Lead[];
  pipelineStages: PipelineStage[];
  campaigns: Campaign[];
  activityFeed: ActivityEntry[];
  users: User[];
  sharingRules: LeadSharingRule[];

  // ── Actions ─────────────────────────────────────────────────────────
  init: () => Promise<void>;
  refresh: () => void;
  setActiveCompany: (c: 'all' | 'harbor' | 'party' | 'xmrt') => void;
  toggleSidebar: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // ── Data Getters (query SQLite directly) ────────────────────────────
  getLeads: (filters?: LeadFilters) => Lead[];
  getLeadById: (id: number) => Lead | null;
  getCompanies: () => Company[];
  getCampaigns: (company?: string) => Campaign[];
  getActivityLog: (company?: string, limit?: number) => ActivityEntry[];
  getPipelineStages: () => PipelineStage[];
  getPipelineData: () => ReturnType<typeof queries.getPipelineData>;
  getUsers: () => User[];
  getSharingRules: () => LeadSharingRule[];

  // ── Lead Sharing ────────────────────────────────────────────────────
  setSharingRule: (from: string, to: string, allowed: boolean) => void;
  canShareLead: (from: string, to: string) => boolean;

  // ── Lead CRUD ───────────────────────────────────────────────────────
  addLead: (lead: Partial<Lead>) => number;
  updateLead: (id: number, updates: Partial<Lead>) => void;
  deleteLead: (id: number) => void;
  routeLead: (leadId: number, targetCompany: string) => boolean;

  // ── Analytics ───────────────────────────────────────────────────────
  getRevenueData: () => ReturnType<typeof queries.getRevenueData>;
  getConversionFunnel: () => ReturnType<typeof queries.getConversionFunnel>;
  getAnalytics: (company?: string) => ReturnType<typeof queries.getAnalytics>;
}

// ─── Default Notifications ───────────────────────────────────────────────────

const defaultNotifications: Notification[] = [
  { id: 'N-001', title: 'Pipeline Alert', message: '2 approvals pending in XMRT DAO pipeline', type: 'warning', read: false, timeAgo: '5m ago' },
  { id: 'N-002', title: 'Lead Routed', message: 'New high-intent lead: Sarah Mitchell (87)', type: 'success', read: false, timeAgo: '12m ago' },
  { id: 'N-003', title: 'Campaign Milestone', message: 'Wedding Season Boost hit 4.0x ROAS', type: 'success', read: true, timeAgo: '1h ago' },
  { id: 'N-004', title: 'System Update', message: 'Lead classifier retrained — 94.2% accuracy', type: 'info', read: true, timeAgo: '2h ago' },
];

// ─── Store Factory ───────────────────────────────────────────────────────────

function syncFromDB() {
  return {
    companies: queries.getCompanies(),
    leads: queries.getLeads(),
    pipelineStages: queries.getPipelineStages(),
    campaigns: queries.getCampaigns(),
    activityFeed: queries.getActivityLog(),
    users: queries.getUsers(),
    sharingRules: queries.getLeadSharingRules(),
  };
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // ── State ───────────────────────────────────────────────────────────
  dbReady: false,
  activeCompany: 'all',
  sidebarCollapsed: false,
  notifications: [...defaultNotifications],

  // Cached data (populated after init)
  companies: [],
  leads: [],
  pipelineStages: [],
  campaigns: [],
  activityFeed: [],
  users: [],
  sharingRules: [],

  // ── Actions ─────────────────────────────────────────────────────────
  init: async () => {
    await initDB();
    set({ dbReady: true, ...syncFromDB() });
  },

  refresh: () => {
    if (!get().dbReady) return;
    set(syncFromDB());
  },

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

  // ── Data Getters (direct SQLite queries) ────────────────────────────
  getLeads: (filters) => {
    return queries.getLeads(filters);
  },

  getLeadById: (id) => {
    return queries.getLeadById(id);
  },

  getCompanies: () => {
    return queries.getCompanies();
  },

  getCampaigns: (company) => {
    return queries.getCampaigns(company);
  },

  getActivityLog: (company, limit) => {
    return queries.getActivityLog(company, limit);
  },

  getPipelineStages: () => {
    return queries.getPipelineStages();
  },

  getPipelineData: () => {
    return queries.getPipelineData();
  },

  getUsers: () => {
    return queries.getUsers();
  },

  getSharingRules: () => {
    return queries.getLeadSharingRules();
  },

  // ── Lead Sharing ────────────────────────────────────────────────────
  setSharingRule: (from, to, allowed) => {
    queries.setLeadSharingRule(from, to, allowed);
    set({ sharingRules: queries.getLeadSharingRules() });
  },

  canShareLead: (from, to) => {
    return queries.canShareLead(from, to);
  },

  // ── Lead CRUD ───────────────────────────────────────────────────────
  addLead: (lead) => {
    const id = queries.addLead(lead);
    set(syncFromDB());
    return id;
  },

  updateLead: (id, updates) => {
    queries.updateLead(id, updates);
    set(syncFromDB());
  },

  deleteLead: (id) => {
    queries.deleteLead(id);
    set(syncFromDB());
  },

  routeLead: (leadId, targetCompany) => {
    const success = queries.routeLead(leadId, targetCompany);
    if (success) {
      set(syncFromDB());
    }
    return success;
  },

  // ── Analytics ───────────────────────────────────────────────────────
  getRevenueData: () => {
    return queries.getRevenueData();
  },

  getConversionFunnel: () => {
    return queries.getConversionFunnel();
  },

  getAnalytics: (company) => {
    return queries.getAnalytics(company);
  },
}));
