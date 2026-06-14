import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Eye, MousePointerClick, ArrowRight, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EmailActivity } from '@/db/types';
import { useDashboardStore } from '@/store/dashboardStore';
import { ResendClient, getResendApiKey } from '@/lib/resend';

// ─── Status Badge ────────────────────────────────────────────────────────────

function EmailStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { bg: string; text: string; label: string }> = {
    sent: { bg: 'bg-info/15', text: 'text-info', label: 'SENT' },
    delivered: { bg: 'bg-success/15', text: 'text-success', label: 'DELIVERED' },
    opened: { bg: 'bg-party-amber/15', text: 'text-party-amber', label: 'OPENED' },
    clicked: { bg: 'bg-xmrt-purple/15', text: 'text-xmrt-purple', label: 'CLICKED' },
    bounced: { bg: 'bg-danger/15', text: 'text-danger', label: 'BOUNCED' },
    complained: { bg: 'bg-danger/15', text: 'text-danger', label: 'COMPLAINED' },
  };
  const v = variants[status] || variants.sent;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${v.bg} ${v.text}`}>
      {v.label}
    </span>
  );
}

// ─── Time Ago Helper ─────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  const mins = Math.floor((now - then) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Truncate helper ─────────────────────────────────────────────────────────

function truncate(str: string | null, len: number): string {
  if (!str) return '\u2014';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ResendEmailFeedProps {
  limit?: number;
  showSync?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResendEmailFeed({ limit = 10, showSync = true }: ResendEmailFeedProps) {
  const { activeCompany, dbReady } = useDashboardStore();
  const [emails, setEmails] = useState<EmailActivity[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const companyId = activeCompany === 'all' ? undefined : activeCompany;

  // Load emails from local SQLite
  const loadEmails = () => {
    if (!dbReady) return;
    const { getEmailActivity } = // require('@/db/queries');
    const rows = getEmailActivity(companyId, limit);
    setEmails(rows);
  };

  useEffect(() => {
    loadEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbReady, activeCompany, limit]);

  // Sync from Resend API
  const syncFromResend = async () => {
    if (!companyId) return;
    const apiKey = getResendApiKey(companyId);
    if (!apiKey) return;
    setSyncing(true);
    try {
      const client = new ResendClient(apiKey);
      const remoteEmails = await client.listEmails({ limit: 50 });
      const { insertEmailActivity } = await import('@/db/queries');
      for (const e of remoteEmails) {
        insertEmailActivity({
          resend_id: e.id,
          company_id: companyId,
          email_from: e.from,
          email_to: e.to?.[0] ?? null,
          subject: e.subject,
          status: e.status === 'sent' ? 'sent' : e.status === 'delivered' ? 'delivered' : 'sent',
          clicks: e.clicks ?? 0,
          opens: e.opens ?? 0,
          sent_at: e.created_at,
        });
      }
      loadEmails();
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('[ResendEmailFeed] Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const activeCompanyName =
    activeCompany === 'harbor' ? '31 Harbor'
    : activeCompany === 'party' ? 'Party Favor Photo'
    : activeCompany === 'xmrt' ? 'XMRT DAO'
    : 'All Companies';

  const activeCompanyColor =
    activeCompany === 'harbor' ? '#0A84FF'
    : activeCompany === 'party' ? '#F5A623'
    : activeCompany === 'xmrt' ? '#7B61FF'
    : '#8B95A5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: activeCompanyColor + '20' }}
          >
            <Mail className="w-4 h-4" style={{ color: activeCompanyColor }} />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-text-primary">Email Activity</h3>
            <p className="text-[11px] text-text-secondary">{activeCompanyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastSynced && (
            <span className="text-[10px] text-text-tertiary">Synced {lastSynced}</span>
          )}
          {showSync && companyId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={syncFromResend}
              disabled={syncing}
              className="h-7 px-2 text-[11px] text-text-secondary hover:text-text-primary"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync'}
            </Button>
          )}
        </div>
      </div>

      {/* Email List */}
      <div className="divide-y divide-border-subtle">
        {emails.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Mail className="w-8 h-8 text-text-tertiary mx-auto mb-2 opacity-40" />
            <p className="text-[13px] text-text-secondary">No email activity yet</p>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              {companyId
                ? 'Add a Resend API key in Settings to sync emails'
                : 'Select a company to view email activity'}
            </p>
          </div>
        ) : (
          emails.map((email, i) => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="px-5 py-3 hover:bg-bg-hover transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13px] font-medium text-text-primary truncate">
                      {truncate(email.subject, 45)}
                    </p>
                    <EmailStatusBadge status={email.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                    <span className="truncate">To: {truncate(email.email_to, 30)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {email.opens > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-party-amber">
                      <Eye className="w-3 h-3" />
                      {email.opens}
                    </div>
                  )}
                  {email.clicks > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-xmrt-purple">
                      <MousePointerClick className="w-3 h-3" />
                      {email.clicks}
                    </div>
                  )}
                  <span className="text-[11px] text-text-tertiary tabular-nums">
                    {timeAgo(email.sent_at)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      {emails.length > 0 && (
        <div className="px-5 py-2.5 border-t border-border-subtle bg-bg-elevated/50">
          <p className="text-[11px] text-text-tertiary">
            Showing {emails.length} recent email{emails.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </motion.div>
  );
}
