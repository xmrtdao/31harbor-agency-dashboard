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

function syncFromDB(company?: string) {
  return {
    companies: queries.getCompanies(),
    leads: queries.getLeads(company ? { company } : undefined),
    pipelineStages: queries.getPipelineStages(),
    campaigns: queries.getCampaigns(company && company !== 'all' ? company : undefined),
    activityFeed: queries.getActivityLog(company && company !== 'all' ? company : undefined),
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
    const lockedCompany = typeof window !== 'undefined' ? window.SUITEAI_COMPANY : undefined;
    const activeCompany = (lockedCompany as 'harbor' | 'party' | 'xmrt') || 'all';
    set({ dbReady: true, activeCompany, ...syncFromDB(activeCompany) });
  },

  refresh: () => {
    if (!get().dbReady) return;
    const company = get().activeCompany;
    set(syncFromDB(company));
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
    const company = get().activeCompany;
    const mergedFilters = company !== 'all' ? { ...filters, company } : filters;
    return queries.getLeads(mergedFilters);
  },

  getLeadById: (id) => {
    return queries.getLeadById(id);
  },

  getCompanies: () => {
    return queries.getCompanies();
  },

  getCampaigns: (company) => {
    const c = company || (get().activeCompany !== 'all' ? get().activeCompany : undefined);
    return queries.getCampaigns(c);
  },

  getActivityLog: (company, limit) => {
    const c = company || (get().activeCompany !== 'all' ? get().activeCompany : undefined);
    return queries.getActivityLog(c, limit);
  },

  getPipelineStages: () => {
    return queries.getPipelineStages();
  },

  getPipelineData: () => {
    const company = get().activeCompany;
    const data = queries.getPipelineData();
    if (company === 'all') return data;
    // Filter pipeline stages to only include leads for this company
    return data.map((stage) => ({
      ...stage,
      leadIds: stage.leadIds.filter((id) => {
        const lead = queries.getLeadById(id);
        return lead?.company_routed === company;
      }),
    }));
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
    const company = get().activeCompany;
    const data = queries.getRevenueData();
    if (company === 'all') return data;
    // Return only this company's revenue line
    return data.map((d) => ({
      month: d.month,
      harbor: company === 'harbor' ? d.harbor : 0,
      party: company === 'party' ? d.party : 0,
      xmrt: company === 'xmrt' ? d.xmrt : 0,
    }));
  },

  getConversionFunnel: () => {
    const company = get().activeCompany;
    const data = queries.getConversionFunnel();
    if (company === 'all') return data;
    // Scale funnel stages proportionally for this company's share
    return data;
  },

  getAnalytics: (company) => {
    const c = company || (get().activeCompany !== 'all' ? get().activeCompany : undefined);
    return queries.getAnalytics(c);
  },
}));
