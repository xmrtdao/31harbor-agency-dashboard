import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Upload,
  RefreshCw,
  Search,
  Cpu,
  Globe,
  DollarSign,
  Users,
  Bot,
  Eye,
  Edit3,
  GitBranch,
  Trash2,
  X,
  Check,
  MoreHorizontal,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from 'recharts';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/Layout';
import { useDashboardStore } from '@/store/dashboardStore';
import { companies as mockCompanies } from '@/data/mockData';
import type { Lead } from '@/db/types';

// ─── Animation Config ───────────────────────────────────────────────────────

const cardEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: cardEase },
  }),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCompany(id: string | null) {
  return mockCompanies.find((c) => c.id === id) || mockCompanies[0];
}

function getScoreColor(score: number) {
  if (score >= 80) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function getStatusBadge(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    'Routed': { bg: '#0EA5E922', text: '#0EA5E9' },
    'Qualified': { bg: '#22C55E22', text: '#22C55E' },
    'Pending': { bg: '#F59E0B22', text: '#F59E0B' },
    'Low Match': { bg: '#1A2332', text: '#8B95A5' },
    'Contracted': { bg: '#22C55E22', text: '#22C55E' },
    'Quoted': { bg: '#0EA5E922', text: '#0EA5E9' },
    'new': { bg: '#0EA5E922', text: '#0EA5E9' },
    'active': { bg: '#22C55E22', text: '#22C55E' },
  };
  return map[status] || { bg: '#1A2332', text: '#8B95A5' };
}

function getSourceIcon(source: string | null) {
  switch (source) {
    case 'Organic': return <Globe className="w-3.5 h-3.5" />;
    case 'Paid': return <DollarSign className="w-3.5 h-3.5" />;
    case 'Referral': return <Users className="w-3.5 h-3.5" />;
    default: return <Bot className="w-3.5 h-3.5" />;
  }
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Filter Sidebar Component ────────────────────────────────────────────────

function FilterSidebar({
  onFiltersChange,
  activeCompany,
}: {
  onFiltersChange: (filters: { company: string; status: string; scoreMin: number; scoreMax: number }) => void;
  activeCompany: string;
}) {
  const [companyFilters, setCompanyFilters] = useState<string[]>([activeCompany === 'all' ? 'all' : activeCompany]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [scoreRange, setScoreRange] = useState<number[]>([0, 100]);

  // Sync with activeCompany changes
  useEffect(() => {
    if (activeCompany !== 'all') {
      setCompanyFilters([activeCompany]);
    }
  }, [activeCompany]);

  const toggleFilter = (val: string, arr: string[], setter: (v: string[]) => void) => {
    if (arr.includes(val)) setter(arr.filter((v) => v !== val));
    else setter([...arr, val]);
  };

  const handleApply = () => {
    const company = activeCompany !== 'all' ? activeCompany : (companyFilters[0] || 'all');
    const status = statusFilters.length === 1 ? statusFilters[0] : '';
    onFiltersChange({
      company,
      status,
      scoreMin: scoreRange[0],
      scoreMax: scoreRange[1],
    });
  };

  const handleReset = () => {
    setCompanyFilters(activeCompany === 'all' ? ['all'] : [activeCompany]);
    setStatusFilters([]);
    setScoreRange([0, 100]);
    onFiltersChange({
      company: activeCompany === 'all' ? 'all' : activeCompany,
      status: '',
      scoreMin: 0,
      scoreMax: 100,
    });
  };

  const Checkbox = ({ label, value, checked, onChange, color }: {
    label: string; value: string; checked: boolean; onChange: () => void; color?: string;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer py-1.5 group">
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
        checked ? 'bg-harbor-blue border-harbor-blue' : 'border-border-default bg-transparent'
      }`}>
        {checked && <Check className="w-3 h-3 text-bg-darkest" />}
      </div>
      {color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
      <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
    </label>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: cardEase }}
      className="w-[280px] bg-bg-elevated border-r border-border-subtle flex flex-col shrink-0 overflow-auto"
    >
      <div className="p-4 border-b border-border-subtle flex items-center gap-2">
        <Filter className="w-4 h-4 text-text-secondary" />
        <span className="text-[14px] font-semibold text-text-primary">Filters</span>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Company */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Company</h4>
          {activeCompany === 'all' ? (
            <>
              <Checkbox label="All Companies" value="all" checked={companyFilters.includes('all')} onChange={() => { setCompanyFilters(['all']); }} />
              {mockCompanies.map((c) => (
                <Checkbox key={c.id} label={c.name} value={c.id} checked={companyFilters.includes(c.id)} onChange={() => { setCompanyFilters([c.id]); }} color={c.color} />
              ))}
            </>
          ) : (
            <div className="flex items-center gap-2 py-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCompany(activeCompany).color }} />
              <span className="text-[13px] text-text-primary">{getCompany(activeCompany).name}</span>
            </div>
          )}
        </div>

        {/* Lead Score */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Lead Score</h4>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] text-text-secondary font-mono">{scoreRange[0]}</span>
            <div className="flex-1 h-1.5 bg-border-subtle rounded-full relative">
              <div className="absolute h-full bg-border-focus rounded-full" style={{ left: `${scoreRange[0]}%`, right: `${100 - scoreRange[1]}%` }} />
            </div>
            <span className="text-[12px] text-text-secondary font-mono">{scoreRange[1]}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="number"
              min={0}
              max={100}
              value={scoreRange[0]}
              onChange={(e) => setScoreRange([Math.min(Number(e.target.value), scoreRange[1]), scoreRange[1]])}
              className="w-full h-8 bg-bg-input border border-border-default rounded text-[12px] text-text-primary px-2 text-center"
            />
            <span className="text-text-tertiary self-center">-</span>
            <input
              type="number"
              min={0}
              max={100}
              value={scoreRange[1]}
              onChange={(e) => setScoreRange([scoreRange[0], Math.max(Number(e.target.value), scoreRange[0])])}
              className="w-full h-8 bg-bg-input border border-border-default rounded text-[12px] text-text-primary px-2 text-center"
            />
          </div>
        </div>

        {/* Source */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Source</h4>
          {['Organic', 'Paid', 'Referral', 'Scraped'].map((s) => (
            <Checkbox key={s} label={s} value={s} checked={false} onChange={() => {}} />
          ))}
        </div>

        {/* Status */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Status</h4>
          {['Routed', 'Qualified', 'Quoted', 'Contracted', 'Pending', 'Low Match'].map((s) => (
            <Checkbox key={s} label={s} value={s} checked={statusFilters.includes(s)} onChange={() => toggleFilter(s, statusFilters, setStatusFilters)} />
          ))}
        </div>

        {/* Routed By */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Routed By</h4>
          {['All', 'AI Only', 'Manual Only'].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer py-1.5 group">
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${r === 'All' ? 'border-harbor-blue' : 'border-border-default'}`}>
                {r === 'All' && <div className="w-1.5 h-1.5 rounded-full bg-harbor-blue" />}
              </div>
              <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors">{r}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border-subtle space-y-2">
        <button
          onClick={handleApply}
          className="w-full h-9 bg-harbor-blue text-bg-darkest font-semibold text-[13px] rounded-md hover:brightness-110 transition-all"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="w-full h-9 bg-transparent text-text-secondary font-medium text-[13px] rounded-md hover:bg-bg-hover transition-colors"
        >
          Reset
        </button>
      </div>
    </motion.div>
  );
}

// ─── KPI Card Component ──────────────────────────────────────────────────────

function KpiCard({ caption, metric, trend, trendColor, accentColor, subContent, index }: {
  caption: string; metric: string; trend?: string; trendColor?: string; accentColor: string;
  subContent?: React.ReactNode; index: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="bg-bg-elevated border border-border-subtle rounded-lg p-5 relative overflow-hidden group hover:border-border-default hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200"
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: accentColor }} />
      <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.05em] mb-2">{caption}</div>
      <div className="text-[36px] font-extrabold text-text-primary leading-tight tracking-tight">{metric}</div>
      {trend && (
        <div className="text-[13px] font-medium mt-1" style={{ color: trendColor || '#22C55E' }}>{trend}</div>
      )}
      {subContent && <div className="mt-3">{subContent}</div>}
    </motion.div>
  );
}

// ─── Lead Detail Drawer ──────────────────────────────────────────────────────

function LeadDetailDrawer({ leadId, onClose }: { leadId: number; onClose: () => void }) {
  const store = useDashboardStore();
  const lead = store.getLeadById(leadId);
  const [targetCompany, setTargetCompany] = useState(lead?.company_routed || 'harbor');

  useEffect(() => {
    if (lead?.company_routed) setTargetCompany(lead.company_routed);
  }, [lead]);

  const handleRoute = () => {
    if (!lead) return;
    const fromCompany = lead.company_routed || 'unknown';
    const success = store.routeLead(lead.id, targetCompany);
    if (!success) {
      toast.error(`Lead sharing blocked between ${getCompany(fromCompany).name} → ${getCompany(targetCompany).name}. Check Settings → Companies.`);
    } else {
      toast.success(`Lead routed to ${getCompany(targetCompany).name}`);
      onClose();
    }
  };

  if (!lead) return null;

  const company = getCompany(lead.company_routed);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex justify-end"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-[rgba(8,9,14,0.7)]" />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: cardEase }}
          className="relative w-[480px] h-full bg-bg-elevated border-l border-border-subtle overflow-auto z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-border-subtle">
            <div>
              <h3 className="text-[22px] font-bold text-text-primary">{lead.name}</h3>
              <span className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[12px] font-medium" style={{ backgroundColor: company.colorDim, color: company.color }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: company.color }} />
                {company.name}
              </span>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-bg-hover transition-colors">
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Contact Info</h4>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Email</span><span className="text-[13px] text-text-primary">{lead.email || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Phone</span><span className="text-[13px] text-text-primary">{lead.phone || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Source</span><span className="text-[13px] text-text-primary">{lead.source || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Received</span><span className="text-[13px] text-text-primary font-mono">{timeAgo(lead.created_at)}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Value</span><span className="text-[13px] text-text-primary font-mono">${(lead.value || 0).toLocaleString()}</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">AI Classification</h4>
              <div className="bg-bg-input border border-border-default rounded-lg p-4">
                <div className="text-[14px] text-text-primary font-medium mb-1">{lead.intent || 'Unknown'}</div>
                <div className="text-[12px] text-text-secondary mb-3">Classification confidence based on lead content analysis</div>
                <div className="flex items-center gap-3">
                  <div className="text-[28px] font-bold" style={{ color: getScoreColor(lead.score || 0) }}>{lead.score || 0}%</div>
                  <div className="flex-1 h-2 bg-border-subtle rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${lead.score || 0}%`, backgroundColor: getScoreColor(lead.score || 0) }} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Routing Decision</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[13px] text-text-secondary">Routed to</span>
                  <span className="text-[13px] font-medium" style={{ color: company.color }}>{company.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-text-secondary">Method</span>
                  <span className="text-[13px] text-text-primary flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-info" /> AI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-text-secondary">Confidence</span>
                  <span className="text-[13px] text-success font-mono">{lead.ai_confidence || 'high'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-text-secondary">Pipeline</span>
                  <span className="text-[13px] text-text-primary font-mono">{lead.pipeline_stage || 'scraping'}</span>
                </div>
              </div>
            </div>

            {/* Re-route section */}
            <div>
              <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Re-route Lead</h4>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full h-9 px-3 bg-bg-input border border-border-default rounded-md text-[13px] text-text-primary focus:outline-none focus:border-border-focus cursor-pointer mb-2"
              >
                {mockCompanies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleRoute}
                className="flex-1 h-10 bg-harbor-blue text-bg-darkest font-semibold text-[13px] rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <GitBranch className="w-4 h-4" /> Re-route Lead
              </button>
              <button className="h-10 px-4 text-danger text-[13px] font-medium rounded-md hover:bg-danger/10 transition-colors">
                Mark as Spam
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LeadRouter() {
  const store = useDashboardStore();
  const { activeCompany, leads, activityFeed } = store;

  const [activePeriod, setActivePeriod] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All Companies');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // ── Functional filter state ─────────────────────────────────────────────
  const [appliedFilters, setAppliedFilters] = useState({
    company: activeCompany === 'all' ? 'all' : activeCompany,
    status: '',
    scoreMin: 0,
    scoreMax: 100,
  });

  // Auto-filter when activeCompany changes
  useEffect(() => {
    const company = activeCompany === 'all' ? 'all' : activeCompany;
    setAppliedFilters((prev) => ({ ...prev, company }));
  }, [activeCompany]);

  // ── Query leads from SQLite via store ───────────────────────────────────
  const filteredLeads = useMemo(() => {
    const filters: { company?: string; status?: string; minScore?: number; maxScore?: number } = {};
    if (appliedFilters.company !== 'all') {
      filters.company = appliedFilters.company;
    }
    if (appliedFilters.status) {
      filters.status = appliedFilters.status;
    }
    filters.minScore = appliedFilters.scoreMin;
    filters.maxScore = appliedFilters.scoreMax;
    return store.getLeads(filters);
  }, [appliedFilters, store, store.leads]);

  // ── Search filtering on top of store query ──────────────────────────────
  const searchFilteredLeads = useMemo(() => {
    if (!searchQuery) return filteredLeads;
    const q = searchQuery.toLowerCase();
    return filteredLeads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.email || '').toLowerCase().includes(q) ||
        (l.source || '').toLowerCase().includes(q)
    );
  }, [filteredLeads, searchQuery]);

  // ── Dropdown filter (legacy compatibility) ──────────────────────────────
  const dropdownFilteredLeads = useMemo(() => {
    let result = searchFilteredLeads;
    if (companyFilter !== 'All Companies') {
      const cid = companyFilter === '31 Harbor' ? 'harbor' : companyFilter === 'Party Favor Photo' ? 'party' : companyFilter === 'XMRT DAO' ? 'xmrt' : '';
      if (cid) result = result.filter((l) => l.company_routed === cid);
    }
    if (statusFilter !== 'All Statuses') {
      result = result.filter((l) => l.status === statusFilter);
    }
    return result;
  }, [searchFilteredLeads, companyFilter, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    store.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  // ── AI Classification Engine: derive from store.leads ───────────────────
  const intentDistribution = useMemo(() => {
    const relevantLeads = activeCompany === 'all' ? leads : leads.filter((l) => l.company_routed === activeCompany);
    const counts: Record<string, number> = {};
    relevantLeads.forEach((l) => {
      const intent = l.intent || 'Unclear / Needs Review';
      // Group intents into categories
      let category = intent;
      if (intent.toLowerCase().includes('real estate') || intent.toLowerCase().includes('property') || intent.toLowerCase().includes('condo')) {
        category = 'Real Estate Interest';
      } else if (intent.toLowerCase().includes('wedding') || intent.toLowerCase().includes('event') || intent.toLowerCase().includes('photo')) {
        category = 'Event / Wedding Services';
      } else if (intent.toLowerCase().includes('crypto') || intent.toLowerCase().includes('blockchain') || intent.toLowerCase().includes('token') || intent.toLowerCase().includes('defi') || intent.toLowerCase().includes('nft') || intent.toLowerCase().includes('web3') || intent.toLowerCase().includes('dao') || intent.toLowerCase().includes('smart contract')) {
        category = 'Tech / Crypto / Blockchain';
      } else if (intent.toLowerCase().includes('travel') || intent.toLowerCase().includes('vacation') || intent.toLowerCase().includes('tourism')) {
        category = 'Travel / Tourism';
      } else {
        category = 'Unclear / Needs Review';
      }
      counts[category] = (counts[category] || 0) + 1;
    });

    // Map to company breakdown
    const categories = Object.keys(counts);
    const companyTotals: Record<string, Record<string, number>> = {};
    categories.forEach((cat) => {
      companyTotals[cat] = { harbor: 0, party: 0, xmrt: 0 };
    });
    relevantLeads.forEach((l) => {
      const intent = l.intent || '';
      let category = intent;
      if (intent.toLowerCase().includes('real estate') || intent.toLowerCase().includes('property') || intent.toLowerCase().includes('condo')) {
        category = 'Real Estate Interest';
      } else if (intent.toLowerCase().includes('wedding') || intent.toLowerCase().includes('event') || intent.toLowerCase().includes('photo')) {
        category = 'Event / Wedding Services';
      } else if (intent.toLowerCase().includes('crypto') || intent.toLowerCase().includes('blockchain') || intent.toLowerCase().includes('token') || intent.toLowerCase().includes('defi') || intent.toLowerCase().includes('nft') || intent.toLowerCase().includes('web3') || intent.toLowerCase().includes('dao') || intent.toLowerCase().includes('smart contract')) {
        category = 'Tech / Crypto / Blockchain';
      } else if (intent.toLowerCase().includes('travel') || intent.toLowerCase().includes('vacation') || intent.toLowerCase().includes('tourism')) {
        category = 'Travel / Tourism';
      } else {
        category = 'Unclear / Needs Review';
      }
      const cid = l.company_routed || 'unknown';
      if (companyTotals[category] && (cid === 'harbor' || cid === 'party' || cid === 'xmrt')) {
        companyTotals[category][cid]++;
      }
    });

    return { counts, companyTotals, categories };
  }, [leads, activeCompany]);

  // ── Confidence distribution derived from actual leads ───────────────────
  const confidenceData = useMemo(() => {
    const relevantLeads = activeCompany === 'all' ? leads : leads.filter((l) => l.company_routed === activeCompany);
    const total = Math.max(relevantLeads.length, 1);
    const high = relevantLeads.filter((l) => (l.score || 0) >= 80).length;
    const med = relevantLeads.filter((l) => {
      const s = l.score || 0;
      return s >= 50 && s < 80;
    }).length;
    const low = relevantLeads.filter((l) => (l.score || 0) < 50).length;
    return [
      { name: 'High (>80%)', value: Math.round((high / total) * 100), count: high, color: '#22C55E' },
      { name: 'Medium (50-80%)', value: Math.round((med / total) * 100), count: med, color: '#F59E0B' },
      { name: 'Low (<50%)', value: Math.round((low / total) * 100), count: low, color: '#EF4444' },
    ];
  }, [leads, activeCompany]);

  const avgConfidence = useMemo(() => {
    const relevantLeads = activeCompany === 'all' ? leads : leads.filter((l) => l.company_routed === activeCompany);
    if (relevantLeads.length === 0) return 0;
    return Math.round(relevantLeads.reduce((s, l) => s + (l.score || 0), 0) / relevantLeads.length);
  }, [leads, activeCompany]);

  // ── Conversion tracker derived from actual leads ────────────────────────
  const conversionData = useMemo(() => {
    return mockCompanies.map((c) => {
      const companyLeads = activeCompany === 'all'
        ? leads.filter((l) => l.company_routed === c.id)
        : leads.filter((l) => l.company_routed === c.id);
      const total = companyLeads.length;
      const qualified = companyLeads.filter((l) => l.status === 'Qualified' || l.status === 'qualified').length;
      const converted = companyLeads.filter((l) => l.status === 'Contracted' || l.status === 'contracted').length;
      const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';
      return {
        company: c.name,
        companyId: c.id,
        color: c.color,
        leads: total,
        qualified,
        converted,
        rate: `${rate}%`,
      };
    });
  }, [leads, activeCompany]);

  // ── Routing log from activity feed ──────────────────────────────────────
  const routingLog = useMemo(() => {
    const relevant = activeCompany === 'all'
      ? activityFeed
      : activityFeed.filter((a) => a.company === activeCompany);
    return relevant
      .filter((a) => (a.type || '').toLowerCase() === 'routing' || (a.description || '').toLowerCase().includes('routed') || (a.description || '').toLowerCase().includes('route'))
      .slice(0, 10)
      .map((a) => ({
        time: a.created_at ? new Date(a.created_at).toLocaleTimeString('en-US', { hour12: false }) : '--:--:--',
        companyId: a.company || 'unknown',
        leadId: String(a.id),
        leadName: a.metadata || 'Unknown',
        intent: a.description || '',
        confidence: 85,
        result: (a.type || '').toLowerCase() === 'routing' ? 'routed' : 'flagged',
      }));
  }, [activityFeed, activeCompany]);

  // ── Re-route handler with sharing blocked check ─────────────────────────
  const handleReRoute = (lead: Lead, targetCompany: string) => {
    const fromCompany = lead.company_routed || 'unknown';
    const success = store.routeLead(lead.id, targetCompany);
    if (!success) {
      toast.error(`Lead sharing blocked between ${getCompany(fromCompany).name} → ${getCompany(targetCompany).name}. Check Settings → Companies.`);
    } else {
      toast.success(`Lead routed to ${getCompany(targetCompany).name}`);
    }
  };

  return (
    <Layout>
      <Toaster />
      <div className="flex h-full">
        {/* Filter Sidebar */}
        <FilterSidebar
          onFiltersChange={setAppliedFilters}
          activeCompany={activeCompany}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[24px] font-bold text-text-primary">Lead Router</h1>
              <p className="text-[13px] text-text-secondary mt-0.5">AI-powered lead classification and routing</p>
            </div>
            <div className="flex items-center gap-2">
              {['Today', '7d', '30d'].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    activePeriod === p ? 'bg-harbor-blue text-bg-darkest' : 'bg-bg-hover text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={handleRefresh}
                className="w-9 h-9 flex items-center justify-center rounded-md bg-bg-hover hover:bg-bg-hover/80 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-text-secondary ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <KpiCard
              caption="Leads Processed"
              metric={String(dropdownFilteredLeads.length)}
              trend={`${leads.filter((l) => (l.score || 0) >= 80).length} high-intent`}
              accentColor="#0A84FF"
              index={0}
            />
            <KpiCard
              caption="AI Accuracy"
              metric={`${avgConfidence}%`}
              trend={avgConfidence >= 80 ? 'High confidence' : avgConfidence >= 50 ? 'Medium confidence' : 'Low confidence'}
              trendColor={avgConfidence >= 80 ? '#22C55E' : avgConfidence >= 50 ? '#F59E0B' : '#EF4444'}
              accentColor="#F5A623"
              index={1}
            />
            <KpiCard
              caption="Avg Response"
              metric="< 2s"
              trend="Real-time"
              accentColor="#22C55E"
              index={2}
            />
            <KpiCard
              caption="Pending Review"
              metric={String(leads.filter((l) => l.status === 'Pending' || l.status === 'pending').length)}
              trend={`${totalApprovalsFromPipeline(store)} need approval`}
              trendColor="#F59E0B"
              accentColor="#7B61FF"
              index={3}
            />
          </div>

          {/* Intent Classification Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: cardEase }}
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 mb-6 hover:border-border-default transition-colors"
          >
            <h3 className="text-[18px] font-semibold text-text-primary mb-4">AI Classification Engine</h3>
            <div className="flex gap-6">
              {/* Left: Intent Table (60%) */}
              <div className="flex-[60]">
                <div className="grid grid-cols-[1fr_60px_60px_60px] gap-x-3 gap-y-2 text-[13px]">
                  <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Intent Category</div>
                  <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider text-center">31H</div>
                  <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider text-center">PFP</div>
                  <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider text-center">XMRT</div>

                  {intentDistribution.categories.map((cat, ci) => {
                    const counts = intentDistribution.companyTotals[cat];
                    const total = intentDistribution.counts[cat];
                    return (
                      <motion.div
                        key={cat}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + ci * 0.05 }}
                        className="contents"
                      >
                        <div className="flex items-center gap-2 py-1">
                          <div className="w-2 h-2 rounded-full" style={{
                            backgroundColor:
                              cat.includes('Real Estate') ? '#0A84FF' :
                              cat.includes('Event') || cat.includes('Wedding') ? '#F5A623' :
                              cat.includes('Tech') || cat.includes('Crypto') ? '#7B61FF' :
                              cat.includes('Travel') ? '#22C55E' : '#8B95A5'
                          }} />
                          <span className="text-text-primary">{cat}</span>
                          <span className="text-[11px] text-text-tertiary ml-1">({total})</span>
                        </div>
                        <div className="text-center text-text-primary font-mono py-1">{counts?.harbor || 0}</div>
                        <div className="text-center text-text-primary font-mono py-1">{counts?.party || 0}</div>
                        <div className="text-center text-text-primary font-mono py-1">{counts?.xmrt || 0}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Confidence Distribution (40%) */}
              <div className="flex-[40] flex flex-col items-center">
                <div className="w-[180px] h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={confidenceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        stroke="#0F1419"
                        strokeWidth={2}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {confidenceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ReTooltip
                        contentStyle={{
                          backgroundColor: '#1A2332',
                          border: '1px solid #232D42',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#E8ECF1',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[24px] font-bold text-text-primary -mt-4">{avgConfidence}%</div>
                <div className="text-[11px] text-text-tertiary mb-3">avg confidence</div>
                <div className="flex items-center gap-4 mb-2">
                  {confidenceData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-[12px] text-text-secondary">{d.name.split(' ')[0]}</span>
                      <span className="text-[12px] font-mono text-text-primary">{d.count}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[12px] text-text-tertiary italic">AI retrained 2 days ago · {leads.length} training samples</div>
              </div>
            </div>
          </motion.div>

          {/* Lead Queue Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: cardEase }}
            className="bg-bg-elevated border border-border-subtle rounded-lg mb-6 hover:border-border-default transition-colors"
          >
            {/* Table Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <h3 className="text-[18px] font-semibold text-text-primary">Lead Queue</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-bg-hover text-text-secondary">{dropdownFilteredLeads.length} total leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search by name, email, source..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-[240px] pl-9 pr-3 bg-bg-input border border-border-default rounded-md text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-focus transition-colors"
                  />
                </div>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="h-9 px-3 bg-bg-input border border-border-default rounded-md text-[13px] text-text-primary focus:outline-none focus:border-border-focus cursor-pointer"
                >
                  <option>All Companies</option>
                  <option>31 Harbor</option>
                  <option>Party Favor Photo</option>
                  <option>XMRT DAO</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 bg-bg-input border border-border-default rounded-md text-[13px] text-text-primary focus:outline-none focus:border-border-focus cursor-pointer"
                >
                  <option>All Statuses</option>
                  <option>Routed</option>
                  <option>Qualified</option>
                  <option>Quoted</option>
                  <option>Contracted</option>
                  <option>Rejected</option>
                  <option>Pending Review</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="text-left px-4 py-3">
                      <div className="w-4 h-4 rounded border border-border-default bg-transparent" />
                    </th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Lead</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Company</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Intent</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Score</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Source</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Routed By</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Time</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider" />
                  </tr>
                </thead>
                <tbody>
                  {dropdownFilteredLeads.map((lead, i) => {
                    const company = getCompany(lead.company_routed);
                    const badge = getStatusBadge(lead.status || 'New');
                    const sColor = getScoreColor(lead.score || 0);
                    return (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.025, duration: 0.3 }}
                        className="border-b border-border-subtle hover:bg-bg-hover transition-colors group cursor-pointer"
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="w-4 h-4 rounded border border-border-default bg-transparent" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style={{ backgroundColor: company.colorDim, color: company.color }}>
                              {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-[14px] font-semibold text-text-primary">{lead.name}</div>
                              <div className="text-[12px] text-text-secondary">{lead.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium" style={{ backgroundColor: company.colorDim, color: company.color }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: company.color }} />
                            {company.abbreviation}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[13px] text-text-primary">{lead.intent || '—'}</div>
                          <div className="w-full h-1 bg-bg-input rounded-full mt-1 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${lead.score || 0}%`, backgroundColor: sColor }} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[20px] font-bold" style={{ color: sColor }}>{lead.score || 0}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium bg-bg-input text-text-secondary">
                            {getSourceIcon(lead.source)}
                            {lead.source || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium" style={{ backgroundColor: badge.bg, color: badge.text }}>
                            {lead.status || 'New'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[13px] text-info">
                            <Cpu className="w-3.5 h-3.5" /> AI
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] font-mono text-text-tertiary">{timeAgo(lead.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === String(lead.id) ? null : String(lead.id)); }}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-bg-hover transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="w-4 h-4 text-text-secondary" />
                            </button>
                            {openDropdown === String(lead.id) && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-0 top-10 w-[160px] bg-bg-elevated border border-border-default rounded-lg shadow-xl z-30 overflow-hidden"
                              >
                                <button onClick={(e) => { e.stopPropagation(); setSelectedLeadId(lead.id); setOpenDropdown(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-primary hover:bg-bg-hover transition-colors">
                                  <Eye className="w-3.5 h-3.5" /> View Details
                                </button>
                                <button onClick={(e) => e.stopPropagation()} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-primary hover:bg-bg-hover transition-colors">
                                  <Edit3 className="w-3.5 h-3.5" /> Edit Lead
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleReRoute(lead, lead.company_routed === 'harbor' ? 'party' : 'harbor'); setOpenDropdown(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-primary hover:bg-bg-hover transition-colors">
                                  <GitBranch className="w-3.5 h-3.5" /> Re-route
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); store.deleteLead(lead.id); setOpenDropdown(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-danger hover:bg-danger/10 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {dropdownFilteredLeads.length === 0 && (
                <div className="py-12 text-center text-[14px] text-text-secondary">No leads match the selected filters.</div>
              )}
            </div>
          </motion.div>

          {/* Bottom Split: Routing Log + Conversion Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Routing Log */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4, ease: cardEase }}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-colors"
            >
              <h3 className="text-[18px] font-semibold text-text-primary mb-4">Routing Log</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {routingLog.length === 0 && (
                  <div className="text-[13px] text-text-secondary py-4 text-center">No routing events recorded yet.</div>
                )}
                {routingLog.map((entry, i) => {
                  const company = getCompany(entry.companyId);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.04, duration: 0.3 }}
                      className="flex items-center gap-3 py-2 border-b border-border-subtle last:border-b-0"
                    >
                      <span className="text-[11px] font-mono text-text-tertiary w-[72px] shrink-0">{entry.time}</span>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: company.color }} />
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                        entry.result === 'routed' ? 'bg-success/10 text-success' :
                        entry.result === 'flagged' ? 'bg-warning/10 text-warning' :
                        'bg-danger/10 text-danger'
                      }`}>
                        {entry.result}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] text-text-primary">
                          Lead #{entry.leadId} &lsquo;{entry.leadName}&rsquo; → classified as &lsquo;{entry.intent}&rsquo; →{' '}
                          {entry.result === 'routed' ? `routed to ${company.name}` : entry.result === 'flagged' ? 'low confidence, flagged for review' : 'sent to review bucket'}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                        entry.confidence >= 80 ? 'bg-success/10 text-success' :
                        entry.confidence >= 50 ? 'bg-warning/10 text-warning' :
                        'bg-danger/10 text-danger'
                      }`}>
                        {entry.confidence}%
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Conversion Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4, ease: cardEase }}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-colors"
            >
              <h3 className="text-[18px] font-semibold text-text-primary mb-4">Conversion by Company</h3>
              <div className="space-y-5">
                {conversionData.map((cd, ci) => (
                  <motion.div
                    key={cd.companyId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + ci * 0.1, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cd.color }} />
                      <span className="text-[13px] font-semibold text-text-primary">{cd.company}</span>
                    </div>
                    {/* Funnel bars */}
                    <div className="space-y-1.5">
                      {[
                        { label: 'Leads', count: cd.leads, max: Math.max(...conversionData.map((c) => c.leads), 1) },
                        { label: 'Qualified', count: cd.qualified, max: Math.max(...conversionData.map((c) => c.qualified), 1) },
                        { label: 'Converted', count: cd.converted, max: Math.max(...conversionData.map((c) => c.converted), 1) },
                      ].map((stage) => (
                        <div key={stage.label} className="flex items-center gap-3">
                          <span className="text-[11px] text-text-secondary w-[60px] text-right">{stage.label}</span>
                          <div className="flex-1 h-5 bg-bg-input rounded overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stage.max > 0 ? (stage.count / stage.max) * 100 : 0}%` }}
                              transition={{ delay: 0.8 + ci * 0.1, duration: 0.5, ease: cardEase }}
                              className="h-full rounded flex items-center justify-end px-2"
                              style={{ backgroundColor: cd.color }}
                            >
                              <span className="text-[12px] font-mono font-bold text-bg-darkest">{stage.count}</span>
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 text-[18px] font-bold" style={{ color: cd.color }}>{cd.rate}</div>
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-[12px] text-text-secondary italic">
                {conversionData.reduce((best, c) => (parseFloat(c.rate) > parseFloat(best.rate) ? c : best), conversionData[0])?.company || 'Party Favor Photo'} has the highest conversion rate. Consider increasing ad spend.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      {selectedLeadId !== null && (
        <LeadDetailDrawer
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </Layout>
  );
}

// ─── Helper: count approvals from pipeline ───────────────────────────────────

type PipelineDataItem = {
  requires_approval?: number;
  [key: string]: any;
};

function totalApprovalsFromPipeline(store: { getPipelineData: () => PipelineDataItem[] }): number {
  try {
    const data = store.getPipelineData();
    return data.reduce((sum: number, s: PipelineDataItem) => sum + (s.requires_approval || 0), 0);
  } catch {
    return 0;
  }
}
