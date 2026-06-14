// ─── Resend REST API Client ──────────────────────────────────────────────────

const RESEND_API_BASE = 'https://api.resend.com';

export interface ResendEmail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  status: 'sent' | 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked';
  created_at: string;
  clicks?: number;
  opens?: number;
}

export interface ResendDomain {
  id: string;
  name: string;
  status: 'pending' | 'verified' | 'failed';
  created_at: string;
  region: string;
}

export interface ResendApiKey {
  id: string;
  name: string;
  created_at: string;
}

export class ResendClient {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${RESEND_API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Resend API error ${res.status}: ${err}`);
    }
    return res.json() as Promise<T>;
  }

  async listEmails(opts?: { since?: string; until?: string; limit?: number }): Promise<ResendEmail[]> {
    const params = new URLSearchParams();
    if (opts?.since) params.append('since', opts.since);
    if (opts?.until) params.append('until', opts.until);
    if (opts?.limit) params.append('limit', String(opts.limit));
    const query = params.toString() ? `?${params}` : '';
    const data = await this.request<{ data: ResendEmail[] }>(`/emails${query}`);
    return data.data || [];
  }

  async getEmail(id: string): Promise<ResendEmail> {
    return this.request<ResendEmail>(`/emails/${id}`);
  }

  async listDomains(): Promise<ResendDomain[]> {
    const data = await this.request<{ data: ResendDomain[] }>('/domains');
    return data.data || [];
  }

  async listApiKeys(): Promise<ResendApiKey[]> {
    const data = await this.request<{ data: ResendApiKey[] }>('/api-keys');
    return data.data || [];
  }

  async sendEmail(payload: {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    reply_to?: string;
    bcc?: string | string[];
    cc?: string | string[];
  }): Promise<{ id: string }> {
    return this.request<{ id: string }>('/emails', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.listEmails({ limit: 1 });
      return true;
    } catch {
      return false;
    }
  }
}

// ─── Per-Company API Key Store (localStorage-backed) ─────────────────────────

const RESEND_KEY_PREFIX = 'suiteai_resend_key_';

export function getResendApiKey(companyId: string): string | null {
  return localStorage.getItem(`${RESEND_KEY_PREFIX}${companyId}`);
}

export function setResendApiKey(companyId: string, apiKey: string): void {
  localStorage.setItem(`${RESEND_KEY_PREFIX}${companyId}`, apiKey);
}

export function removeResendApiKey(companyId: string): void {
  localStorage.removeItem(`${RESEND_KEY_PREFIX}${companyId}`);
}

export function hasResendApiKey(companyId: string): boolean {
  return !!getResendApiKey(companyId);
}

export function getMaskedKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

// ─── Webhook Helper ──────────────────────────────────────────────────────────

export function getWebhookUrl(): string {
  // Cloudflare Worker endpoint for Resend webhooks
  return (window as any).SUITEAI_WEBHOOK_URL || 'https://suiteai-resend-worker.agenticos.workers.dev';
}
