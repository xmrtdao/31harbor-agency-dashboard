import { getDB, saveDB } from './sqlite';
import type {
  Company,
  Lead,
  LeadFilters,
  LeadSharingRule,
  Campaign,
  PipelineStage,
  ActivityEntry,
  User,
  AnalyticsData,
  EmailActivity,
} from './types';

// ─── Companies ───────────────────────────────────────────────────────────────

export function getCompanies(): Company[] {
  const db = getDB();
  const result = db.exec("SELECT id, name, industry, color, domain, api_key_masked, active, lead_score_threshold, dns_verified, created_at FROM companies WHERE active = 1");
  if (!result.length) return [];

  const rows: any[] = result[0].values;
  return rows.map((r) => ({
    id: r[0], name: r[1], industry: r[2], color: r[3], domain: r[4],
    api_key_masked: r[5], active: r[6], lead_score_threshold: r[7],
    dns_verified: r[8], created_at: r[9],
  }));
}

export function getCompanyById(id: string): Company | null {
  const db = getDB();
  const result = db.exec(
    "SELECT id, name, industry, color, domain, api_key_masked, active, lead_score_threshold, dns_verified, created_at FROM companies WHERE id = ?",
    [id]
  );
  if (!result.length || !result[0].values.length) return null;
  const r = result[0].values[0];
  return {
    id: r[0], name: r[1], industry: r[2], color: r[3], domain: r[4],
    api_key_masked: r[5], active: r[6], lead_score_threshold: r[7],
    dns_verified: r[8], created_at: r[9],
  };
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export function getLeads(filters?: LeadFilters): Lead[] {
  const db = getDB();
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters?.company && filters.company !== 'all') {
    conditions.push("company_routed = ?");
    params.push(filters.company);
  }
  if (filters?.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }
  if (filters?.source) {
    conditions.push("source = ?");
    params.push(filters.source);
  }
  if (filters?.search) {
    conditions.push("(name LIKE ? OR email LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters?.minScore !== undefined) {
    conditions.push("score >= ?");
    params.push(filters.minScore);
  }
  if (filters?.maxScore !== undefined) {
    conditions.push("score <= ?");
    params.push(filters.maxScore);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = filters?.limit ? `LIMIT ${filters.limit}` : "";
  const sql = `SELECT id, name, email, phone, source, intent, company_routed, score, status, ai_confidence, ai_reasoning, pipeline_stage, value, created_at, updated_at FROM leads ${where} ORDER BY created_at DESC ${limit}`;

  const result = db.exec(sql, params);
  if (!result.length) return [];

  const rows: any[] = result[0].values;
  return rows.map((r) => ({
    id: r[0], name: r[1], email: r[2], phone: r[3], source: r[4],
    intent: r[5], company_routed: r[6], score: r[7], status: r[8],
    ai_confidence: r[9], ai_reasoning: r[10], pipeline_stage: r[11],
    value: r[12], created_at: r[13], updated_at: r[14],
  }));
}

export function getLeadById(id: number): Lead | null {
  const db = getDB();
  const result = db.exec(
    "SELECT id, name, email, phone, source, intent, company_routed, score, status, ai_confidence, ai_reasoning, pipeline_stage, value, created_at, updated_at FROM leads WHERE id = ?",
    [id]
  );
  if (!result.length || !result[0].values.length) return null;
  const r = result[0].values[0];
  return {
    id: r[0], name: r[1], email: r[2], phone: r[3], source: r[4],
    intent: r[5], company_routed: r[6], score: r[7], status: r[8],
    ai_confidence: r[9], ai_reasoning: r[10], pipeline_stage: r[11],
    value: r[12], created_at: r[13], updated_at: r[14],
  };
}

export function addLead(lead: Partial<Lead>): number {
  const db = getDB();
  const now = new Date().toISOString();
  const result = db.run(
    `INSERT INTO leads (name, email, phone, source, intent, company_routed, score, status, ai_confidence, ai_reasoning, pipeline_stage, value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lead.name ?? 'Unknown',
      lead.email ?? null,
      lead.phone ?? null,
      lead.source ?? 'Organic',
      lead.intent ?? null,
      lead.company_routed ?? null,
      lead.score ?? 0,
      lead.status ?? 'new',
      lead.ai_confidence ?? 'high',
      lead.ai_reasoning ?? null,
      lead.pipeline_stage ?? 'scraping',
      lead.value ?? 0,
      now,
      now,
    ]
  );
  saveDB();
  return result.lastInsertRowid as number;
}

export function updateLead(id: number, updates: Partial<Lead>): void {
  const db = getDB();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { fields.push("name = ?"); values.push(updates.name); }
  if (updates.email !== undefined) { fields.push("email = ?"); values.push(updates.email); }
  if (updates.phone !== undefined) { fields.push("phone = ?"); values.push(updates.phone); }
  if (updates.source !== undefined) { fields.push("source = ?"); values.push(updates.source); }
  if (updates.intent !== undefined) { fields.push("intent = ?"); values.push(updates.intent); }
  if (updates.company_routed !== undefined) { fields.push("company_routed = ?"); values.push(updates.company_routed); }
  if (updates.score !== undefined) { fields.push("score = ?"); values.push(updates.score); }
  if (updates.status !== undefined) { fields.push("status = ?"); values.push(updates.status); }
  if (updates.ai_confidence !== undefined) { fields.push("ai_confidence = ?"); values.push(updates.ai_confidence); }
  if (updates.ai_reasoning !== undefined) { fields.push("ai_reasoning = ?"); values.push(updates.ai_reasoning); }
  if (updates.pipeline_stage !== undefined) { fields.push("pipeline_stage = ?"); values.push(updates.pipeline_stage); }
  if (updates.value !== undefined) { fields.push("value = ?"); values.push(updates.value); }

  fields.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  db.run(`UPDATE leads SET ${fields.join(", ")} WHERE id = ?`, values);
  saveDB();
}

export function deleteLead(id: number): void {
  const db = getDB();
  db.run("DELETE FROM leads WHERE id = ?", [id]);
  saveDB();
}

// ─── Lead Sharing Rules ──────────────────────────────────────────────────────

export function getLeadSharingRules(): LeadSharingRule[] {
  const db = getDB();
  const result = db.exec("SELECT id, from_company, to_company, allowed, created_at FROM lead_sharing_rules ORDER BY from_company, to_company");
  if (!result.length) return [];

  const rows: any[] = result[0].values;
  return rows.map((r) => ({
    id: r[0], from_company: r[1], to_company: r[2], allowed: r[3], created_at: r[4],
  }));
}

export function canShareLead(from: string, to: string): boolean {
  if (from === to) return true;
  const db = getDB();
  const result = db.exec(
    "SELECT allowed FROM lead_sharing_rules WHERE from_company = ? AND to_company = ?",
    [from, to]
  );
  if (!result.length || !result[0].values.length) return true; // Default allow
  return result[0].values[0][0] === 1;
}

export function setLeadSharingRule(from: string, to: string, allowed: boolean): void {
  const db = getDB();
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO lead_sharing_rules (from_company, to_company, allowed, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(from_company, to_company) DO UPDATE SET allowed = excluded.allowed`,
    [from, to, allowed ? 1 : 0, now]
  );
  saveDB();
}

export function routeLead(leadId: number, targetCompany: string): boolean {
  const lead = getLeadById(leadId);
  if (!lead) return false;
  if (!lead.company_routed) return false;

  const currentCompany = lead.company_routed;
  if (!canShareLead(currentCompany, targetCompany)) {
    return false;
  }

  updateLead(leadId, {
    company_routed: targetCompany,
    status: 'Routed',
    ai_reasoning: (lead.ai_reasoning ?? '') + ` [Routed from ${currentCompany} to ${targetCompany}]`,
  });
  return true;
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export function getCampaigns(company?: string): Campaign[] {
  const db = getDB();
  const sql = company
    ? "SELECT id, name, company, status, budget, spend, revenue, roi, reach, clicks, conversions, platform, start_date, end_date FROM campaigns WHERE company = ? ORDER BY id"
    : "SELECT id, name, company, status, budget, spend, revenue, roi, reach, clicks, conversions, platform, start_date, end_date FROM campaigns ORDER BY id";
  const params = company ? [company] : [];
  const result = db.exec(sql, params);
  if (!result.length) return [];

  const rows: any[] = result[0].values;
  return rows.map((r) => ({
    id: r[0], name: r[1], company: r[2], status: r[3], budget: r[4],
    spend: r[5], revenue: r[6], roi: r[7], reach: r[8], clicks: r[9],
    conversions: r[10], platform: r[11], start_date: r[12], end_date: r[13],
  }));
}

export function updateCampaign(id: number, updates: Partial<Campaign>): void {
  const db = getDB();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { fields.push("name = ?"); values.push(updates.name); }
  if (updates.company !== undefined) { fields.push("company = ?"); values.push(updates.company); }
  if (updates.status !== undefined) { fields.push("status = ?"); values.push(updates.status); }
  if (updates.budget !== undefined) { fields.push("budget = ?"); values.push(updates.budget); }
  if (updates.spend !== undefined) { fields.push("spend = ?"); values.push(updates.spend); }
  if (updates.revenue !== undefined) { fields.push("revenue = ?"); values.push(updates.revenue); }
  if (updates.roi !== undefined) { fields.push("roi = ?"); values.push(updates.roi); }
  if (updates.reach !== undefined) { fields.push("reach = ?"); values.push(updates.reach); }
  if (updates.clicks !== undefined) { fields.push("clicks = ?"); values.push(updates.clicks); }
  if (updates.conversions !== undefined) { fields.push("conversions = ?"); values.push(updates.conversions); }
  if (updates.platform !== undefined) { fields.push("platform = ?"); values.push(updates.platform); }
  if (updates.start_date !== undefined) { fields.push("start_date = ?"); values.push(updates.start_date); }
  if (updates.end_date !== undefined) { fields.push("end_date = ?"); values.push(updates.end_date); }

  values.push(id);
  db.run(`UPDATE campaigns SET ${fields.join(", ")} WHERE id = ?`, values);
  saveDB();
}

// ─── Pipeline Stages ─────────────────────────────────────────────────────────

export function getPipelineStages(): PipelineStage[] {
  const db = getDB();
  const result = db.exec("SELECT id, name, order_index, requires_approval, auto_advance, timeout_hours FROM pipeline_stages ORDER BY order_index");
  if (!result.length) return [];

  const rows: any[] = result[0].values;
  return rows.map((r) => ({
    id: r[0], name: r[1], order_index: r[2], requires_approval: r[3], auto_advance: r[4], timeout_hours: r[5],
  }));
}

export function getPipelineData(): Array<{ id: string; label: string; count: number; leadIds: number[]; needsApproval: number }> {
  const db = getDB();
  const stages = getPipelineStages();
  return stages.map((stage) => {
    const result = db.exec(
      "SELECT id FROM leads WHERE pipeline_stage = ? ORDER BY created_at DESC",
      [stage.id]
    );
    const leadIds: number[] = result.length ? result[0].values.map((r: any) => r[0] as number) : [];
    return {
      id: stage.id,
      label: stage.name,
      count: leadIds.length,
      leadIds,
      needsApproval: stage.requires_approval,
    };
  });
}

// ─── Activity Log ────────────────────────────────────────────────────────────

export function getActivityLog(company?: string, limit: number = 50): ActivityEntry[] {
  const db = getDB();
  const sql = company
    ? "SELECT id, type, company, description, metadata, created_at FROM activity_log WHERE company = ? ORDER BY created_at DESC LIMIT ?"
    : "SELECT id, type, company, description, metadata, created_at FROM activity_log ORDER BY created_at DESC LIMIT ?";
  const params = company ? [company, limit] : [limit];
  const result = db.exec(sql, params);
  if (!result.length) return [];

  const rows: any[] = result[0].values;
  return rows.map((r) => ({
    id: r[0], type: r[1], company: r[2], description: r[3], metadata: r[4], created_at: r[5],
  }));
}

export function addActivityEntry(entry: Omit<ActivityEntry, 'id'>): void {
  const db = getDB();
  db.run(
    `INSERT INTO activity_log (type, company, description, metadata, created_at) VALUES (?, ?, ?, ?, ?)`,
    [entry.type ?? null, entry.company ?? null, entry.description, entry.metadata ?? null, entry.created_at ?? new Date().toISOString()]
  );
  saveDB();
}

// ─── Users ───────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  const db = getDB();
  const result = db.exec("SELECT id, name, email, role, companies, status, last_active FROM users ORDER BY id");
  if (!result.length) return [];

  const rows: any[] = result[0].values;
  return rows.map((r) => ({
    id: r[0], name: r[1], email: r[2], role: r[3], companies: r[4], status: r[5], last_active: r[6],
  }));
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function getAnalytics(company?: string): AnalyticsData {
  const db = getDB();

  // Total leads
  const leadsResult = db.exec(
    company ? "SELECT COUNT(*) FROM leads WHERE company_routed = ?" : "SELECT COUNT(*) FROM leads",
    company ? [company] : []
  );
  const totalLeads = leadsResult.length ? (leadsResult[0].values[0][0] as number) : 0;

  // Total revenue
  const revResult = db.exec(
    company ? "SELECT COALESCE(SUM(revenue), 0) FROM campaigns WHERE company = ?" : "SELECT COALESCE(SUM(revenue), 0) FROM campaigns",
    company ? [company] : []
  );
  const totalRevenue = revResult.length ? (revResult[0].values[0][0] as number) : 0;

  // Total spend
  const spendResult = db.exec(
    company ? "SELECT COALESCE(SUM(spend), 0) FROM campaigns WHERE company = ?" : "SELECT COALESCE(SUM(spend), 0) FROM campaigns",
    company ? [company] : []
  );
  const totalSpend = spendResult.length ? (spendResult[0].values[0][0] as number) : 0;

  // Avg ROI
  const roiResult = db.exec(
    company ? "SELECT COALESCE(AVG(roi), 0) FROM campaigns WHERE company = ? AND roi > 0" : "SELECT COALESCE(AVG(roi), 0) FROM campaigns WHERE roi > 0",
    company ? [company] : []
  );
  const avgRoi = roiResult.length ? (roiResult[0].values[0][0] as number) : 0;

  // Leads by company
  const leadsByCompanyResult = db.exec(
    "SELECT company_routed, COUNT(*) as count FROM leads GROUP BY company_routed ORDER BY count DESC"
  );
  const leadsByCompany = leadsByCompanyResult.length
    ? leadsByCompanyResult[0].values.map((r: any) => ({ company: r[0] ?? 'unassigned', count: r[1] as number }))
    : [];

  // Leads by status
  const leadsByStatusResult = db.exec(
    company ? "SELECT status, COUNT(*) as count FROM leads WHERE company_routed = ? GROUP BY status" : "SELECT status, COUNT(*) as count FROM leads GROUP BY status",
    company ? [company] : []
  );
  const leadsByStatus = leadsByStatusResult.length
    ? leadsByStatusResult[0].values.map((r: any) => ({ status: r[0], count: r[1] as number }))
    : [];

  // Monthly revenue (mock calculation from campaign data)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth = months.map((m, i) => ({
    month: m,
    harbor: Math.round(18000 + i * 2000 + Math.random() * 3000),
    party: Math.round(12000 + i * 1800 + Math.random() * 2500),
    xmrt: Math.round(8000 + i * 1200 + Math.random() * 2000),
  }));

  return {
    totalLeads,
    totalRevenue,
    totalSpend,
    avgRoi,
    leadsByCompany,
    leadsByStatus,
    revenueByMonth,
  };
}

export function getRevenueData(): Array<{ month: string; harbor: number; party: number; xmrt: number }> {
  const db = getDB();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Use deterministic "random" based on month index
  return months.map((m, i) => ({
    month: m,
    harbor: Math.round(18000 + i * 2000 + ((i * 137) % 3000)),
    party: Math.round(12000 + i * 1800 + ((i * 251) % 2500)),
    xmrt: Math.round(8000 + i * 1200 + ((i * 89) % 2000)),
  }));
}

export function getConversionFunnel(): Array<{ stage: string; count: number }> {
  const db = getDB();
  const stages = ['scraping', 'qualify', 'quote', 'contract', 'paid'];
  return stages.map((stage) => {
    const result = db.exec("SELECT COUNT(*) FROM leads WHERE pipeline_stage = ?", [stage]);
    return {
      stage: stage.toUpperCase(),
      count: result.length ? (result[0].values[0][0] as number) : 0,
    };
  });
}

// ─── Email Activity ─────────────────────────────────────────────────────────

export function getEmailActivity(company?: string, limit: number = 20): EmailActivity[] {
  const db = getDB();
  const sql = company && company !== 'all'
    ? `SELECT id, resend_id, company_id, email_from, email_to, subject, status, clicks, opens, sent_at, created_at FROM email_activity WHERE company_id = ? ORDER BY sent_at DESC LIMIT ?`
    : `SELECT id, resend_id, company_id, email_from, email_to, subject, status, clicks, opens, sent_at, created_at FROM email_activity ORDER BY sent_at DESC LIMIT ?`;
  const params = company && company !== 'all' ? [company, limit] : [limit];
  const result = db.exec(sql, params);
  if (!result.length) return [];

  const rows: any[] = result[0].values;
  return rows.map((r) => ({
    id: r[0], resend_id: r[1], company_id: r[2], email_from: r[3], email_to: r[4],
    subject: r[5], status: r[6], clicks: r[7], opens: r[8], sent_at: r[9], created_at: r[10],
  }));
}

export function insertEmailActivity(email: Omit<EmailActivity, 'id' | 'created_at'>): void {
  const db = getDB();
  db.run(
    `INSERT OR IGNORE INTO email_activity (resend_id, company_id, email_from, email_to, subject, status, clicks, opens, sent_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      email.resend_id,
      email.company_id,
      email.email_from ?? null,
      email.email_to ?? null,
      email.subject ?? null,
      email.status ?? 'sent',
      email.clicks ?? 0,
      email.opens ?? 0,
      email.sent_at ?? new Date().toISOString(),
      new Date().toISOString(),
    ]
  );
  saveDB();
}

export function updateEmailActivityStatus(resendId: string, status: string, opens?: number, clicks?: number): void {
  const db = getDB();
  const fields: string[] = ['status = ?'];
  const values: any[] = [status];
  if (opens !== undefined) { fields.push('opens = ?'); values.push(opens); }
  if (clicks !== undefined) { fields.push('clicks = ?'); values.push(clicks); }
  values.push(resendId);
  db.run(`UPDATE email_activity SET ${fields.join(', ')} WHERE resend_id = ?`, values);
  saveDB();
}

export function getEmailStats(company?: string): { total: number; sent: number; delivered: number; opened: number; bounced: number } {
  const db = getDB();
  const where = company && company !== 'all' ? 'WHERE company_id = ?' : '';
  const params = company && company !== 'all' ? [company] : [];

  const totalResult = db.exec(`SELECT COUNT(*) FROM email_activity ${where}`, params);
  const total = totalResult.length ? (totalResult[0].values[0][0] as number) : 0;

  const sentResult = db.exec(`SELECT COUNT(*) FROM email_activity ${where} ${where ? 'AND' : 'WHERE'} status = 'sent'`, params);
  const sent = sentResult.length ? (sentResult[0].values[0][0] as number) : 0;

  const deliveredResult = db.exec(`SELECT COUNT(*) FROM email_activity ${where} ${where ? 'AND' : 'WHERE'} status = 'delivered'`, params);
  const delivered = deliveredResult.length ? (deliveredResult[0].values[0][0] as number) : 0;

  const openedResult = db.exec(`SELECT COUNT(*) FROM email_activity ${where} ${where ? 'AND' : 'WHERE'} status IN ('opened','clicked')`, params);
  const opened = openedResult.length ? (openedResult[0].values[0][0] as number) : 0;

  const bouncedResult = db.exec(`SELECT COUNT(*) FROM email_activity ${where} ${where ? 'AND' : 'WHERE'} status IN ('bounced','complained')`, params);
  const bounced = bouncedResult.length ? (bouncedResult[0].values[0][0] as number) : 0;

  return { total, sent, delivered, opened, bounced };
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function getLeadCount(company?: string): number {
  const db = getDB();
  const result = db.exec(
    company ? "SELECT COUNT(*) FROM leads WHERE company_routed = ?" : "SELECT COUNT(*) FROM leads",
    company ? [company] : []
  );
  return result.length ? (result[0].values[0][0] as number) : 0;
}

export function getCampaignCount(company?: string): number {
  const db = getDB();
  const result = db.exec(
    company ? "SELECT COUNT(*) FROM campaigns WHERE company = ?" : "SELECT COUNT(*) FROM campaigns",
    company ? [company] : []
  );
  return result.length ? (result[0].values[0][0] as number) : 0;
}

export function getPipelineValue(): number {
  const db = getDB();
  const result = db.exec("SELECT COALESCE(SUM(value), 0) FROM leads WHERE status IN ('Routed', 'Qualified', 'Pending', 'Quoted')");
  return result.length ? (result[0].values[0][0] as number) : 0;
}
