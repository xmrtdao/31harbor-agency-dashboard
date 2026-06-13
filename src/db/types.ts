// ─── SQLite Database Types ───────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  industry: string;
  color: string;
  domain: string;
  api_key_masked: string | null;
  active: number;
  lead_score_threshold: number;
  dns_verified: number;
  created_at: string | null;
}

export interface CompanyRow {
  id: string;
  name: string;
  industry: string;
  color: string;
  domain: string;
  api_key_masked: string | null;
  active: number;
  lead_score_threshold: number;
  dns_verified: number;
  created_at: string | null;
}

export interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  intent: string | null;
  company_routed: string | null;
  score: number;
  status: string;
  ai_confidence: string;
  ai_reasoning: string | null;
  pipeline_stage: string;
  value: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface LeadFilters {
  company?: string;
  status?: string;
  source?: string;
  search?: string;
  minScore?: number;
  maxScore?: number;
  limit?: number;
}

export interface LeadSharingRule {
  id: number;
  from_company: string;
  to_company: string;
  allowed: number;
  created_at: string | null;
}

export interface Campaign {
  id: number;
  name: string;
  company: string | null;
  status: string;
  budget: number;
  spend: number;
  revenue: number;
  roi: number;
  reach: number;
  clicks: number;
  conversions: number;
  platform: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface PipelineStage {
  id: string;
  name: string;
  order_index: number;
  requires_approval: number;
  auto_advance: number;
  timeout_hours: number;
}

export interface PipelineStageAgg {
  id: string;
  label: string;
  count: number;
  needsApproval: number;
  activeCompanies: string[];
}

export interface ActivityEntry {
  id: number;
  type: string | null;
  company: string | null;
  description: string;
  metadata: string | null;
  created_at: string | null;
}

export interface User {
  id: number;
  name: string | null;
  email: string | null;
  role: string | null;
  companies: string | null;
  status: string;
  last_active: string | null;
}

export interface AnalyticsData {
  totalLeads: number;
  totalRevenue: number;
  totalSpend: number;
  avgRoi: number;
  leadsByCompany: { company: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; harbor: number; party: number; xmrt: number }[];
}

export interface RevenueDataPoint {
  month: string;
  harbor: number;
  party: number;
  xmrt: number;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timeAgo: string;
}
