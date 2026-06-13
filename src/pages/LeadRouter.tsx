import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from 'recharts';
import Layout from '@/components/Layout';
import { useDashboardStore } from '@/store/dashboardStore';
import { companies } from '@/data/mockData';
import type { Lead } from '@/data/mockData';

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

// ─── Mock Lead Data (15 rows per spec) ──────────────────────────────────────

const leadRows: Lead[] = [
  { id: 'L-2847', name: 'Sarah Mitchell', email: 'sarah@email.com', companyId: 'harbor', score: 87, source: 'Organic', status: 'Routed', routedBy: 'AI', timeAgo: '2m ago', intent: 'Real Estate Interest' },
  { id: 'L-2848', name: 'James & Linda Chen', email: 'jlchen@events.com', companyId: 'party', score: 92, source: 'Paid', status: 'Qualified', routedBy: 'AI', timeAgo: '15m ago', intent: 'Wedding Services' },
  { id: 'L-2849', name: 'CryptoVentures LLC', email: 'contact@cryptov.com', companyId: 'xmrt', score: 64, source: 'Referral', status: 'Pending', routedBy: 'AI', timeAgo: '32m ago', intent: 'Blockchain Dev' },
  { id: 'L-2850', name: 'Roberto Alvarado', email: 'ralvarado@email.com', companyId: 'harbor', score: 45, source: 'Organic', status: 'Low Match', routedBy: 'AI', timeAgo: '1h ago', intent: 'Real Estate' },
  { id: 'L-2851', name: 'Emily Watson', email: 'emily@ewp.com', companyId: 'party', score: 78, source: 'Organic', status: 'Routed', routedBy: 'AI', timeAgo: '1h ago', intent: 'Birthday Event' },
  { id: 'L-2852', name: 'DeFi Labs Inc', email: 'partners@defilabs.io', companyId: 'xmrt', score: 95, source: 'Paid', status: 'Contracted', routedBy: 'AI', timeAgo: '2h ago', intent: 'Token Launch' },
  { id: 'L-2853', name: 'Harbor View RE', email: 'info@harborview.com', companyId: 'harbor', score: 71, source: 'Referral', status: 'Quoted', routedBy: 'AI', timeAgo: '3h ago', intent: 'Property Mgmt' },
  { id: 'L-2854', name: 'Birthday Bash Co', email: 'hello@bbevents.com', companyId: 'party', score: 56, source: 'Organic', status: 'Qualified', routedBy: 'AI', timeAgo: '4h ago', intent: 'Corporate Event' },
  { id: 'L-2855', name: 'Blockchain Summit', email: 'team@bcsummit.org', companyId: 'xmrt', score: 88, source: 'Paid', status: 'Routed', routedBy: 'AI', timeAgo: '5h ago', intent: 'DAO Consulting' },
  { id: 'L-2856', name: 'Marina Residences', email: 'sales@marinares.com', companyId: 'harbor', score: 82, source: 'Organic', status: 'Qualified', routedBy: 'AI', timeAgo: '6h ago', intent: 'Condo Purchase' },
  { id: 'L-2857', name: 'Wedding Planners R Us', email: 'wp@wprus.com', companyId: 'party', score: 89, source: 'Referral', status: 'Quoted', routedBy: 'AI', timeAgo: '7h ago', intent: 'Wedding Package' },
  { id: 'L-2858', name: 'NFT Collective', email: 'hello@nftcoll.org', companyId: 'xmrt', score: 52, source: 'Organic', status: 'Pending', routedBy: 'AI', timeAgo: '8h ago', intent: 'Smart Contract' },
  { id: 'L-2859', name: 'Vista Costa Rica', email: 'info@vistacr.com', companyId: 'harbor', score: 48, source: 'Organic', status: 'Low Match', routedBy: 'AI', timeAgo: '9h ago', intent: 'Vacation Rental' },
  { id: 'L-2860', name: 'PhotoGenic Events', email: 'book@photogenic.com', companyId: 'party', score: 85, source: 'Paid', status: 'Routed', routedBy: 'AI', timeAgo: '10h ago', intent: 'Photo Booth' },
  { id: 'L-2861', name: 'Web3 Capital', email: 'deal@web3cap.io', companyId: 'xmrt', score: 79, source: 'Referral', status: 'Qualified', routedBy: 'AI', timeAgo: '11h ago', intent: 'DeFi Strategy' },
];

// ─── Intent Classification Matrix Data ───────────────────────────────────────

const intentCategories = [
  'Real Estate Interest',
  'Event / Wedding Services',
  'Tech / Crypto / Blockchain',
  'Travel / Tourism',
  'Unclear / Needs Review',
];

const intentMatrix: Record<string, Record<string, number>> = {
  'Real Estate Interest': { harbor: 18, party: 2, xmrt: 1 },
  'Event / Wedding Services': { harbor: 1, party: 22, xmrt: 0 },
  'Tech / Crypto / Blockchain': { harbor: 0, party: 1, xmrt: 16 },
  'Travel / Tourism': { harbor: 3, party: 0, xmrt: 0 },
  'Unclear / Needs Review': { harbor: 2, party: 1, xmrt: 2 },
};

const confidenceData = [
  { name: 'High (>80%)', value: 68, color: '#22C55E' },
  { name: 'Medium (50-80%)', value: 22, color: '#F59E0B' },
  { name: 'Low (<50%)', value: 10, color: '#EF4444' },
];

// ─── Routing Log Data ────────────────────────────────────────────────────────

const routingLog = [
  { time: '14:32:07', companyId: 'harbor', leadId: '2841', leadName: 'Sarah Mitchell', intent: 'Real Estate Interest', confidence: 92, result: 'routed' },
  { time: '14:28:15', companyId: 'party', leadId: '2840', leadName: 'James Chen', intent: 'Wedding Services', confidence: 95, result: 'routed' },
  { time: '14:25:33', companyId: 'xmrt', leadId: '2839', leadName: 'CryptoVentures LLC', intent: 'Blockchain Dev', confidence: 71, result: 'flagged' },
  { time: '14:20:11', companyId: 'harbor', leadId: '2838', leadName: 'Roberto Alvarado', intent: 'Unclear / Needs Review', confidence: 38, result: 'review' },
  { time: '14:15:48', companyId: 'party', leadId: '2837', leadName: 'Emily Watson', intent: 'Birthday Event', confidence: 88, result: 'routed' },
  { time: '14:10:22', companyId: 'xmrt', leadId: '2836', leadName: 'DeFi Labs Inc', intent: 'Token Launch', confidence: 97, result: 'routed' },
  { time: '14:05:59', companyId: 'harbor', leadId: '2835', leadName: 'Harbor View RE', intent: 'Property Mgmt', confidence: 85, result: 'routed' },
  { time: '13:58:41', companyId: 'party', leadId: '2834', leadName: 'Birthday Bash Co', intent: 'Corporate Event', confidence: 62, result: 'routed' },
  { time: '13:52:17', companyId: 'xmrt', leadId: '2833', leadName: 'Blockchain Summit', intent: 'DAO Consulting', confidence: 91, result: 'routed' },
  { time: '13:45:03', companyId: 'harbor', leadId: '2832', leadName: 'Marina Residences', intent: 'Condo Purchase', confidence: 79, result: 'routed' },
];

// ─── Conversion Data ─────────────────────────────────────────────────────────

const conversionData = [
  { company: '31 Harbor', companyId: 'harbor', color: '#0A84FF', leads: 42, qualified: 28, converted: 12, rate: '28.6%' },
  { company: 'Party Favor Photo', companyId: 'party', color: '#F5A623', leads: 38, qualified: 31, converted: 15, rate: '39.5%' },
  { company: 'XMRT DAO', companyId: 'xmrt', color: '#7B61FF', leads: 29, qualified: 19, converted: 8, rate: '27.6%' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCompany(id: string) {
  return companies.find((c) => c.id === id) || companies[0];
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
  };
  return map[status] || { bg: '#1A2332', text: '#8B95A5' };
}

function getSourceIcon(source: string) {
  switch (source) {
    case 'Organic': return <Globe className="w-3.5 h-3.5" />;
    case 'Paid': return <DollarSign className="w-3.5 h-3.5" />;
    case 'Referral': return <Users className="w-3.5 h-3.5" />;
    default: return <Bot className="w-3.5 h-3.5" />;
  }
}

// ─── Filter Sidebar Component ────────────────────────────────────────────────

function FilterSidebar() {
  const [companyFilters, setCompanyFilters] = useState<string[]>(['all']);
  const [sourceFilters, setSourceFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [scoreRange, setScoreRange] = useState<number[]>([0, 100]);

  const toggleFilter = (val: string, arr: string[], setter: (v: string[]) => void) => {
    if (arr.includes(val)) setter(arr.filter((v) => v !== val));
    else setter([...arr, val]);
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
          <Checkbox label="All Companies" value="all" checked={companyFilters.includes('all')} onChange={() => setCompanyFilters(['all'])} />
          <Checkbox label="31 Harbor" value="harbor" checked={companyFilters.includes('harbor')} onChange={() => { toggleFilter('harbor', companyFilters, setCompanyFilters); setCompanyFilters((p) => p.filter((v) => v !== 'all')); }} color="#0A84FF" />
          <Checkbox label="Party Favor Photo" value="party" checked={companyFilters.includes('party')} onChange={() => { toggleFilter('party', companyFilters, setCompanyFilters); setCompanyFilters((p) => p.filter((v) => v !== 'all')); }} color="#F5A623" />
          <Checkbox label="XMRT DAO" value="xmrt" checked={companyFilters.includes('xmrt')} onChange={() => { toggleFilter('xmrt', companyFilters, setCompanyFilters); setCompanyFilters((p) => p.filter((v) => v !== 'all')); }} color="#7B61FF" />
        </div>

        {/* Date Range */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Date Range</h4>
          {['Today', 'Last 7 days', 'Last 30 days', 'All time'].map((d) => (
            <Checkbox key={d} label={d} value={d} checked={d === 'Last 7 days'} onChange={() => {}} />
          ))}
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
        </div>

        {/* Source */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Source</h4>
          {['Organic', 'Paid', 'Referral', 'Scraped'].map((s) => (
            <Checkbox key={s} label={s} value={s} checked={sourceFilters.includes(s)} onChange={() => toggleFilter(s, sourceFilters, setSourceFilters)} />
          ))}
        </div>

        {/* Status */}
        <div>
          <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Status</h4>
          {['Routed', 'Qualified', 'Quoted', 'Contracted', 'Rejected', 'Pending Review'].map((s) => (
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
        <button className="w-full h-9 bg-harbor-blue text-bg-darkest font-semibold text-[13px] rounded-md hover:brightness-110 transition-all">
          Apply Filters
        </button>
        <button className="w-full h-9 bg-transparent text-text-secondary font-medium text-[13px] rounded-md hover:bg-bg-hover transition-colors">
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

function LeadDetailDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const company = getCompany(lead.companyId);
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
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Email</span><span className="text-[13px] text-text-primary">{lead.email}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Source</span><span className="text-[13px] text-text-primary">{lead.source}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Received</span><span className="text-[13px] text-text-primary font-mono">{lead.timeAgo}</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">AI Classification</h4>
              <div className="bg-bg-input border border-border-default rounded-lg p-4">
                <div className="text-[14px] text-text-primary font-medium mb-1">{lead.intent}</div>
                <div className="text-[12px] text-text-secondary mb-3">Classification confidence based on lead content analysis</div>
                <div className="flex items-center gap-3">
                  <div className="text-[28px] font-bold" style={{ color: getScoreColor(lead.score) }}>{lead.score}%</div>
                  <div className="flex-1 h-2 bg-border-subtle rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${lead.score}%`, backgroundColor: getScoreColor(lead.score) }} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Routing Decision</h4>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Routed to</span><span className="text-[13px] font-medium" style={{ color: company.color }}>{company.name}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Method</span><span className="text-[13px] text-text-primary flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-info" /> AI</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-text-secondary">Confidence</span><span className="text-[13px] text-success font-mono">{lead.score}%</span></div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button className="flex-1 h-10 bg-harbor-blue text-bg-darkest font-semibold text-[13px] rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2">
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
  const [activePeriod, setActivePeriod] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All Companies');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const filteredLeads = leadRows.filter((l) => {
    if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase()) && !l.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (companyFilter !== 'All Companies') {
      const cid = companyFilter === '31 Harbor' ? 'harbor' : companyFilter === 'Party Favor Photo' ? 'party' : companyFilter === 'XMRT DAO' ? 'xmrt' : '';
      if (l.companyId !== cid) return false;
    }
    if (statusFilter !== 'All Statuses' && l.status !== statusFilter) return false;
    return true;
  });

  return (
    <Layout>
      <div className="flex h-full">
        {/* Filter Sidebar */}
        <FilterSidebar />

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: cardEase }}
            className="flex items-start justify-between mb-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[28px] font-bold text-text-primary tracking-tight">Cross-Business Lead Router</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#0A84FF22] text-info">CBLR v2.4</span>
              </div>
              <p className="text-[14px] text-text-secondary">AI intent-classification and automatic lead routing</p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <button className="flex items-center gap-2 px-4 h-9 bg-harbor-blue text-bg-darkest font-semibold text-[13px] rounded-md hover:brightness-110 transition-all">
                <Upload className="w-4 h-4" /> Import Leads
              </button>
              <button
                onClick={handleRefresh}
                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-bg-hover transition-colors text-text-secondary"
              >
                <RefreshCw className={`w-[18px] h-[18px] ${refreshing ? 'animate-spin' : ''}`} style={{ animationDuration: '600ms' }} />
              </button>
            </motion.div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <KpiCard caption="Total Leads" metric="124" trend="▲ 8 vs yesterday" trendColor="#22C55E" accentColor="#0EA5E9" index={0} />
            <KpiCard caption="Qualified" metric="47" trend="▲ 12% this week" trendColor="#22C55E" accentColor="#22C55E" index={1} />
            <KpiCard caption="Routed Today" metric="18" trend="▲ 4 vs yesterday" trendColor="#22C55E" accentColor="#F5A623" index={2} />
            <KpiCard caption="Conversion Rate" metric="23.8%" trend="▲ 2.1% vs last week" trendColor="#22C55E" accentColor="#7B61FF" index={3} />
          </div>

          {/* AI Classification Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: cardEase }}
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 mb-6 hover:border-border-default transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h3 className="text-[18px] font-semibold text-text-primary">AI Classification Engine</h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-success/10 text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" /> LIVE
                </span>
              </div>
              <div className="flex items-center gap-1 bg-bg-input rounded-md p-0.5">
                {['Today', 'This Week', 'This Month'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePeriod(p)}
                    className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${activePeriod === p ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex gap-6">
              {/* Left: Intent Classification Matrix (60%) */}
              <div className="flex-[60]">
                <div className="grid grid-cols-4 gap-2">
                  {/* Column Headers */}
                  <div />
                  {companies.map((c) => (
                    <div key={c.id} className="flex items-center justify-center gap-1.5 py-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-[12px] font-medium" style={{ color: c.color }}>{c.abbreviation}</span>
                    </div>
                  ))}
                  {/* Rows */}
                  {intentCategories.map((intent, ri) => (
                    <motion.div
                      key={intent}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: ri * 0.04, duration: 0.3 }}
                      className="contents"
                    >
                      <div className="text-[13px] text-text-secondary flex items-center py-2">{intent}</div>
                      {companies.map((c) => {
                        const count = intentMatrix[intent]?.[c.id] || 0;
                        const maxVal = Math.max(...Object.values(intentMatrix[intent] || {}));
                        const barWidth = maxVal > 0 ? (count / maxVal) * 100 : 0;
                        return (
                          <div key={c.id} className="flex items-center gap-2 py-2 px-1">
                            <span className="text-[14px] font-mono font-medium text-text-primary w-6">{count}</span>
                            <div className="flex-1 h-[6px] bg-bg-input rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${barWidth}%`, backgroundColor: c.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  ))}
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
                <div className="text-[24px] font-bold text-text-primary -mt-4">94.2%</div>
                <div className="text-[11px] text-text-tertiary mb-3">avg confidence</div>
                <div className="flex items-center gap-4 mb-2">
                  {confidenceData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-[12px] text-text-secondary">{d.name.split(' ')[0]}</span>
                      <span className="text-[12px] font-mono text-text-primary">{d.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="text-[12px] text-text-tertiary italic">AI retrained 2 days ago · 1,247 training samples</div>
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
                <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-bg-hover text-text-secondary">{filteredLeads.length} total leads</span>
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
                  {filteredLeads.map((lead, i) => {
                    const company = getCompany(lead.companyId);
                    const badge = getStatusBadge(lead.status);
                    const scoreColor = getScoreColor(lead.score);
                    return (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.025, duration: 0.3 }}
                        className="border-b border-border-subtle hover:bg-bg-hover transition-colors group cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
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
                              <div className="text-[12px] text-text-secondary">{lead.email}</div>
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
                          <div className="text-[13px] text-text-primary">{lead.intent}</div>
                          <div className="w-full h-1 bg-bg-input rounded-full mt-1 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${lead.score}%`, backgroundColor: scoreColor }} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[20px] font-bold" style={{ color: scoreColor }}>{lead.score}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium bg-bg-input text-text-secondary">
                            {getSourceIcon(lead.source)}
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium" style={{ backgroundColor: badge.bg, color: badge.text }}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[13px] text-info">
                            <Cpu className="w-3.5 h-3.5" /> AI
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] font-mono text-text-tertiary">{lead.timeAgo}</td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === lead.id ? null : lead.id); }}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-bg-hover transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="w-4 h-4 text-text-secondary" />
                            </button>
                            {openDropdown === lead.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-0 top-10 w-[160px] bg-bg-elevated border border-border-default rounded-lg shadow-xl z-30 overflow-hidden"
                              >
                                <button onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setOpenDropdown(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-primary hover:bg-bg-hover transition-colors">
                                  <Eye className="w-3.5 h-3.5" /> View Details
                                </button>
                                <button onClick={(e) => e.stopPropagation()} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-primary hover:bg-bg-hover transition-colors">
                                  <Edit3 className="w-3.5 h-3.5" /> Edit Lead
                                </button>
                                <button onClick={(e) => e.stopPropagation()} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-primary hover:bg-bg-hover transition-colors">
                                  <GitBranch className="w-3.5 h-3.5" /> Re-route
                                </button>
                                <button onClick={(e) => e.stopPropagation()} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-danger hover:bg-danger/10 transition-colors">
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
            </div>
          </motion.div>

          {/* Bottom Split: Routing Log + Conversion Tracker */}
          <div className="grid grid-cols-2 gap-4">
            {/* Routing Log */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4, ease: cardEase }}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-colors"
            >
              <div className="mb-4">
                <h3 className="text-[18px] font-semibold text-text-primary">Routing Log</h3>
                <p className="text-[12px] text-text-tertiary">Last 50 decisions</p>
              </div>
              <div className="space-y-0 max-h-[360px] overflow-y-auto">
                {routingLog.map((entry, i) => {
                  const company = getCompany(entry.companyId);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.03, duration: 0.3 }}
                      className="flex items-start gap-3 py-2 border-b border-border-subtle last:border-0"
                    >
                      <span className="text-[12px] font-mono text-text-tertiary shrink-0 w-[60px]">{entry.time}</span>
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: company.color }} />
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
                        { label: 'Leads', count: cd.leads, max: 50 },
                        { label: 'Qualified', count: cd.qualified, max: 35 },
                        { label: 'Converted', count: cd.converted, max: 20 },
                      ].map((stage) => (
                        <div key={stage.label} className="flex items-center gap-3">
                          <span className="text-[11px] text-text-secondary w-[60px] text-right">{stage.label}</span>
                          <div className="flex-1 h-5 bg-bg-input rounded overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(stage.count / stage.max) * 100}%` }}
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
                Party Favor Photo has the highest conversion rate. Consider increasing ad spend.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
