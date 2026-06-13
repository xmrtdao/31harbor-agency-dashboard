import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Settings,
  Globe,
  BrainCircuit,
  FileText,
  FileSignature,
  CreditCard,
  CalendarCheck,
  Check,
  CheckCircle,
  X,
  ChevronRight,
  Clock,
  Eye,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Layout from '@/components/Layout';
import { useDashboardStore } from '@/store/dashboardStore';
import { companies } from '@/data/mockData';

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

// ─── Stage Config (static metadata) ─────────────────────────────────────────

interface StageConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  statusText: string;
  statusColor: string;
  miniText: string;
  pulse?: boolean;
  completed?: boolean;
}

const stageMeta: StageConfig[] = [
  { id: 'scraping', label: 'LEAD SCRAPE', icon: Globe, color: '#0EA5E9', statusText: 'Running', statusColor: '#0EA5E9', miniText: 'Web scrape & Form intake', pulse: true },
  { id: 'qualify', label: 'AI QUALIFY', icon: BrainCircuit, color: '#7B61FF', statusText: 'Processing', statusColor: '#7B61FF', miniText: 'Confidence scoring', pulse: true },
  { id: 'quote', label: 'QUOTE GEN', icon: FileText, color: '#F59E0B', statusText: 'Needs Approval', statusColor: '#F59E0B', miniText: 'Human review required', pulse: true },
  { id: 'contract', label: 'CONTRACT', icon: FileSignature, color: '#22C55E', statusText: 'Active', statusColor: '#22C55E', miniText: 'Contract generation', completed: false },
  { id: 'payment', label: 'PAYMENT', icon: CreditCard, color: '#22C55E', statusText: 'Processing', statusColor: '#22C55E', miniText: 'Secure payment gateway', completed: false },
  { id: 'schedule', label: 'SCHEDULE', icon: CalendarCheck, color: '#8B95A5', statusText: 'Complete', statusColor: '#8B95A5', miniText: 'Delivery scheduling', completed: true },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCompany(id: string | null) {
  if (!id) return companies[0];
  return companies.find((c) => c.id === id) || companies[0];
}

function getStageBadge(stageId: string) {
  const map: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    scraping: { bg: '#0EA5E922', text: '#0EA5E9', icon: Globe },
    qualify: { bg: '#7B61FF22', text: '#7B61FF', icon: BrainCircuit },
    quote: { bg: '#F59E0B22', text: '#F59E0B', icon: FileText },
    contract: { bg: '#22C55E22', text: '#22C55E', icon: FileSignature },
    payment: { bg: '#22C55E22', text: '#22C55E', icon: CreditCard },
    schedule: { bg: '#8B95A522', text: '#8B95A5', icon: CalendarCheck },
  };
  return map[stageId] || map.scraping;
}

function stageProgress(stageId: string): number {
  const idx = stageMeta.findIndex((s) => s.id === stageId);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / stageMeta.length) * 100);
}

function timeSince(iso: string | null): string {
  if (!iso) return '-';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const mins = Math.floor((now - then) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

function formatValue(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return v > 0 ? `$${v}` : '$0';
}

// ─── Stage Detail Modal ─────────────────────────────────────────────────────

function StageDetailModal({ stage, leads, onClose }: { stage: StageConfig; leads: any[]; onClose: () => void }) {
  const stageLeads = leads.filter((l) => l.pipeline_stage === stage.id);
  const completedCount = stageLeads.filter((l) => l.status === 'Complete' || l.status === 'Contracted').length;
  const activeCount = stageLeads.length - completedCount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[rgba(8,9,14,0.7)] backdrop-blur-[4px]" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: cardEase }}
        className="relative w-[640px] max-h-[80vh] bg-bg-elevated border border-border-subtle rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <stage.icon className="w-6 h-6" style={{ color: stage.color }} />
            <h3 className="text-[24px] font-bold text-text-primary">{stage.label}</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-bg-hover transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Active', value: String(activeCount) },
              { label: 'Completed', value: String(completedCount) },
              { label: 'Total', value: String(stageLeads.length) },
              { label: 'Success rate', value: stageLeads.length > 0 ? `${Math.round((completedCount / stageLeads.length) * 100)}%` : '-' },
            ].map((s) => (
              <div key={s.label} className="bg-bg-input border border-border-default rounded-lg p-3 text-center">
                <div className="text-[20px] font-bold text-text-primary">{s.value}</div>
                <div className="text-[11px] text-text-tertiary uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Items in Stage */}
          <div>
            <h4 className="text-[14px] font-semibold text-text-primary mb-3">Items in Stage</h4>
            {stageLeads.length === 0 ? (
              <div className="text-center py-6 text-[13px] text-text-tertiary">No items in this stage</div>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {stageLeads.map((lead) => {
                  const company = getCompany(lead.company_routed);
                  return (
                    <div key={lead.id} className="flex items-center gap-3 bg-bg-input border border-border-default rounded-lg p-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style={{ backgroundColor: company.colorDim, color: company.color }}>
                        {lead.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-text-primary truncate">{lead.name}</div>
                        <div className="text-[12px] text-text-secondary">{company.name}</div>
                      </div>
                      <div className="text-[12px] font-mono text-text-secondary">{timeSince(lead.updated_at)}</div>
                      <div className="text-[13px] font-mono font-semibold text-text-primary">{formatValue(lead.value)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stage Config */}
          <div>
            <h4 className="text-[14px] font-semibold text-text-primary mb-3">Stage Configuration</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Auto-advance</span>
                <div className="w-10 h-5 bg-success rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Require approval</span>
                <div className={`w-10 h-5 rounded-full relative cursor-pointer ${stage.id === 'quote' ? 'bg-warning' : 'bg-border-default'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow ${stage.id === 'quote' ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-text-secondary">Timeout</span>
                <span className="text-[13px] font-mono text-text-primary bg-bg-input border border-border-default rounded px-2 py-1">24h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-subtle">
          <button onClick={onClose} className="px-4 h-9 bg-transparent text-text-secondary text-[13px] font-medium rounded-md hover:bg-bg-hover transition-colors">
            Close
          </button>
          <button className="px-4 h-9 bg-harbor-blue text-bg-darkest text-[13px] font-semibold rounded-md hover:brightness-110 transition-all">
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Traveling Dot Component (isolated for performance) ─────────────────────

const TravelingDot = React.memo(function TravelingDot({ color }: { color: string }) {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-0 pointer-events-none">
      <div
        className="w-1.5 h-1.5 rounded-full absolute top-1/2 -translate-y-1/2"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}`,
          animation: 'travelDot 2s linear infinite',
        }}
      />
    </div>
  );
});

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ caption, metric, trend, trendColor, accentColor, subContent, index, metricColor }: {
  caption: string; metric: string; trend?: string; trendColor?: string; accentColor: string;
  subContent?: React.ReactNode; index: number; metricColor?: string;
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
      <div className="text-[36px] font-extrabold leading-tight tracking-tight" style={{ color: metricColor || '#E8ECF1' }}>{metric}</div>
      {trend && (
        <div className="text-[13px] font-medium mt-1" style={{ color: trendColor || '#22C55E' }}>{trend}</div>
      )}
      {subContent && <div className="mt-3">{subContent}</div>}
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Pipeline() {
  const store = useDashboardStore();
  const { activeCompany, leads, updateLead, refresh } = store;

  const [selectedStage, setSelectedStage] = useState<StageConfig | null>(null);
  const [pipelineRunning, setPipelineRunning] = useState(true);
  const [chartTab, setChartTab] = useState('Volume');
  const [pipelineFilter, setPipelineFilter] = useState('All Pipelines');

  // ── Derived data from SQLite ──────────────────────────────────────────

  // Filter leads by active company
  const filteredLeads = useMemo(() => {
    const filterCo = pipelineFilter === 'All Pipelines' ? activeCompany :
      pipelineFilter === '31 Harbor Sales' ? 'harbor' :
      pipelineFilter === 'Party Favor Photo Events' ? 'party' :
      pipelineFilter === 'XMRT DAO Tech' ? 'xmrt' : activeCompany;
    if (filterCo === 'all') return leads;
    return leads.filter((l) => l.company_routed === filterCo);
  }, [leads, activeCompany, pipelineFilter]);

  // Approval queue from SQLite
  const approvalsList = useMemo(() => {
    return store.getPendingApprovals();
  }, [leads, store]);

  // Filter approvals by active company
  const filteredApprovals = useMemo(() => {
    if (activeCompany === 'all') return approvalsList;
    return approvalsList.filter((a) => a.company_routed === activeCompany);
  }, [approvalsList, activeCompany]);

  // Revenue data from SQLite
  const revenueData = useMemo(() => {
    const data = store.getRevenueData();
    if (activeCompany === 'all') return data;
    return data.map((d) => ({
      ...d,
      harbor: activeCompany === 'harbor' ? d.harbor : 0,
      party: activeCompany === 'party' ? d.party : 0,
      xmrt: activeCompany === 'xmrt' ? d.xmrt : 0,
    }));
  }, [store, activeCompany]);

  // Pipeline stage counts derived from actual leads
  const stagesWithCounts = useMemo(() => {
    return stageMeta.map((stage) => {
      const stageLeads = filteredLeads.filter((l) => l.pipeline_stage === stage.id);
      return {
        ...stage,
        count: stageLeads.length,
        countText: `${stageLeads.length} active`,
        completed: stage.id === 'schedule' ? stageLeads.length > 0 && stageLeads.every((l) => l.status === 'Complete' || l.status === 'Contracted') : false,
      };
    });
  }, [filteredLeads]);

  // KPI metrics
  const activePipelines = filteredLeads.filter((l) => l.status !== 'Complete' && l.status !== 'Low Match').length;
  const avgDealValue = filteredLeads.length > 0
    ? filteredLeads.reduce((sum, l) => sum + (l.value || 0), 0) / filteredLeads.length
    : 0;
  const winRate = filteredLeads.length > 0
    ? Math.round((filteredLeads.filter((l) => l.status === 'Contracted' || l.status === 'Complete').length / filteredLeads.length) * 100 * 10) / 10
    : 0;
  const revenueThisMonth = filteredLeads.reduce((sum, l) => sum + (l.value || 0), 0);

  // Chart data: use revenue data as base, add conversion line
  const chartData = useMemo(() => {
    return revenueData.map((d, i) => ({
      day: i + 1,
      harbor: Math.max(1, Math.round(d.harbor / 5000)),
      party: Math.max(1, Math.round(d.party / 5000)),
      xmrt: Math.max(1, Math.round(d.xmrt / 5000)),
      conversion: Math.min(100, 15 + i * 2 + ((i * 137) % 20)),
    }));
  }, [revenueData]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleApprove = useCallback((id: number) => {
    updateLead(id, { status: 'Qualified', pipeline_stage: 'contract' });
    refresh();
  }, [updateLead, refresh]);

  const handleReject = useCallback((id: number) => {
    updateLead(id, { status: 'Low Match', pipeline_stage: 'scraping' });
    refresh();
  }, [updateLead, refresh]);

  return (
    <Layout>
      <div className="p-6 overflow-auto">
        {/* Inject traveling dot keyframe */}
        <style>{`
          @keyframes travelDot {
            0% { left: 0; opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
            50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.15); }
          }
        `}</style>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: cardEase }}
          className="flex items-start justify-between mb-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[28px] font-bold text-text-primary tracking-tight">Autonomous Business Agent</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-success/10 text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" /> ABBA ACTIVE
              </span>
            </div>
            <p className="text-[14px] text-text-secondary mb-2">End-to-end autonomous pipeline &middot; ABBA v1.8</p>
            <select
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
              className="h-8 px-3 bg-bg-input border border-border-default rounded-md text-[13px] text-text-primary focus:outline-none focus:border-border-focus cursor-pointer"
            >
              <option>All Pipelines</option>
              <option>31 Harbor Sales</option>
              <option>Party Favor Photo Events</option>
              <option>XMRT DAO Tech</option>
            </select>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={() => setPipelineRunning(!pipelineRunning)}
              className="flex items-center gap-2 px-4 h-9 bg-success text-bg-darkest font-semibold text-[13px] rounded-md hover:brightness-110 transition-all"
            >
              {pipelineRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {pipelineRunning ? 'Pause' : 'Run Pipeline'}
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-bg-hover transition-colors text-text-secondary">
              <Settings className="w-[18px] h-[18px]" />
            </button>
          </motion.div>
        </motion.div>

        {/* Pipeline Flow Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: cardEase }}
          className="bg-bg-elevated border border-border-subtle rounded-lg p-8 mb-6 hover:border-border-default transition-colors"
        >
          <div className="flex items-center justify-between relative">
            {stagesWithCounts.map((stage, i) => (
              <React.Fragment key={stage.id}>
                {/* Stage Node */}
                <motion.button
                  custom={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: cardEase }}
                  onClick={() => setSelectedStage(stage)}
                  className="relative flex flex-col items-center text-center z-10 group"
                  style={{
                    animation: stage.id === 'quote' ? 'pulseGlow 2s ease-in-out infinite' : undefined,
                  }}
                >
                  <div
                    className={`w-[140px] bg-bg-input border-2 rounded-xl p-4 transition-all duration-200 group-hover:scale-105 cursor-pointer ${
                      stage.id === 'quote' ? 'border-warning bg-[#F59E0B08]' : 'border-border-default'
                    }`}
                  >
                    {/* Completed checkmark */}
                    {stage.completed && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center z-20">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <stage.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stage.color }} />
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">{stage.label}</div>
                    <div className="text-[18px] font-bold text-text-primary mb-1">{stage.count} active</div>
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${stage.pulse ? 'animate-pulse-dot' : ''}`}
                        style={{ backgroundColor: stage.statusColor }}
                      />
                      <span className="text-[11px]" style={{ color: stage.statusColor }}>{stage.statusText}</span>
                    </div>
                    <div className="text-[10px] text-text-tertiary">{stage.miniText}</div>
                  </div>
                </motion.button>

                {/* Connection Line */}
                {i < stagesWithCounts.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
                    className="flex-1 h-[2px] mx-2 relative"
                    style={{
                      backgroundColor: stage.completed ? '#22C55E' : '#232D42',
                      transformOrigin: 'left',
                    }}
                  >
                    {/* Arrow chevron */}
                    <ChevronRight
                      className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4"
                      style={{ color: stage.completed ? '#22C55E' : '#4A5568' }}
                    />
                    {/* Traveling dot on active stages */}
                    {stage.pulse && pipelineRunning && (
                      <TravelingDot color={stagesWithCounts[i + 1].color} />
                    )}
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border-subtle">
            {[
              { color: '#22C55E', label: 'Complete' },
              { color: '#0EA5E9', label: 'Running' },
              { color: '#7B61FF', label: 'Processing' },
              { color: '#F59E0B', label: 'Needs Approval' },
              { color: '#8B95A5', label: 'Pending' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-text-tertiary">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard caption="Active Pipelines" metric={String(activePipelines)} trend={`${filteredLeads.filter((l) => l.status === 'Pending').length} pending approval`} trendColor="#F59E0B" accentColor="#0EA5E9" index={0} />
          <KpiCard caption="Avg Deal Value" metric={formatValue(avgDealValue)} trend={`${filteredLeads.length} total leads`} trendColor="#22C55E" accentColor="#22C55E" index={1} />
          <KpiCard caption="Win Rate" metric={`${winRate}%`} trend="Contracted vs total" trendColor="#22C55E" accentColor="#F59E0B" index={2} />
          <KpiCard caption="Pipeline Value" metric={formatValue(revenueThisMonth)} trend="Total lead value" trendColor="#22C55E" accentColor="#7B61FF" index={3} />
        </div>

        {/* Active Pipeline Table + Approval Queue */}
        <div className="grid grid-cols-[2fr_1fr] gap-4 mb-6">
          {/* Active Pipeline Table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: cardEase }}
            className="bg-bg-elevated border border-border-subtle rounded-lg hover:border-border-default transition-colors"
          >
            <div className="flex items-center justify-between p-5 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <h3 className="text-[18px] font-semibold text-text-primary">Active Pipeline</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-bg-hover text-text-secondary">{filteredLeads.length} items</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Lead</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Current Stage</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Progress</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Time in Stage</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Value</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, i) => {
                    const company = getCompany(lead.company_routed);
                    const stageBadge = getStageBadge(lead.pipeline_stage);
                    const StageIcon = stageBadge.icon;
                    const progress = stageProgress(lead.pipeline_stage);
                    const needsApproval = lead.status === 'Pending';
                    return (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.025, duration: 0.3 }}
                        className="border-b border-border-subtle hover:bg-bg-hover transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style={{ backgroundColor: company.colorDim, color: company.color }}>
                              {lead.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-[14px] font-semibold text-text-primary">{lead.name}</div>
                              <span className="inline-flex items-center gap-1 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: company.color }} />
                                <span className="text-[11px]" style={{ color: company.color }}>{company.abbreviation}</span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium" style={{ backgroundColor: stageBadge.bg, color: stageBadge.text }}>
                            <StageIcon className="w-3.5 h-3.5" /> {stageMeta.find((s) => s.id === lead.pipeline_stage)?.label || lead.pipeline_stage}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-full max-w-[120px]">
                            <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden mb-1">
                              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: company.color }} />
                            </div>
                            <span className="text-[11px] font-mono text-text-tertiary">Stage {Math.ceil(progress / 17)}/6</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] font-mono text-text-secondary">{timeSince(lead.updated_at)}</td>
                        <td className="px-4 py-3 text-[14px] font-mono font-semibold text-text-primary">{formatValue(lead.value)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium ${
                            needsApproval ? 'bg-warning/10 text-warning' :
                            lead.status === 'Complete' || lead.status === 'Contracted' ? 'bg-success/10 text-success' :
                            'bg-info/10 text-info'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {needsApproval ? (
                            <button
                              onClick={() => handleApprove(lead.id)}
                              className="px-3 py-1.5 bg-warning text-bg-darkest text-[12px] font-semibold rounded-md hover:brightness-110 transition-all"
                            >
                              Approve
                            </button>
                          ) : (
                            <button className="text-[13px] font-medium text-harbor-blue hover:underline">View</button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Approval Queue */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: cardEase }}
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-semibold text-text-primary">Approval Queue</h3>
              <span className="px-2 py-0.5 rounded-full text-[12px] font-medium bg-danger/10 text-danger">{filteredApprovals.length}</span>
            </div>

            {filteredApprovals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-12 h-12 text-success mb-3" />
                <p className="text-[14px] text-text-secondary text-center">All caught up! No approvals pending.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApprovals.map((approval, i) => {
                  const company = getCompany(approval.company_routed);
                  return (
                    <motion.div
                      key={approval.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                      className="bg-bg-input border border-border-default rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: company.colorDim, color: company.color }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: company.color }} />
                          {company.abbreviation}
                        </span>
                        <span className="text-[11px] font-mono text-text-tertiary flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeSince(approval.updated_at)}
                        </span>
                      </div>
                      <h4 className="text-[14px] font-semibold text-text-primary mb-1">{approval.name}</h4>
                      <p className="text-[13px] text-text-secondary mb-3 leading-relaxed">{approval.intent || 'Awaiting approval'}</p>
                      <div className="text-[20px] font-bold text-text-primary mb-3">{formatValue(approval.value)}</div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleApprove(approval.id)}
                          className="flex-1 h-8 bg-success text-bg-darkest text-[12px] font-semibold rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleReject(approval.id)}
                          className="flex-1 h-8 text-danger text-[12px] font-medium rounded-md hover:bg-danger/10 transition-colors border border-transparent hover:border-danger/20"
                        >
                          Reject
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="h-8 px-3 text-text-secondary text-[12px] font-medium rounded-md hover:bg-bg-hover transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Pipeline Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4, ease: cardEase }}
          className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[18px] font-semibold text-text-primary">Pipeline Performance</h3>
              <span className="text-[12px] text-text-tertiary uppercase tracking-wider">Last 30 days</span>
            </div>
            <div className="flex items-center gap-1 bg-bg-input rounded-md p-0.5">
              {['Volume', 'Conversion Rate', 'Revenue'].map((t) => (
                <button
                  key={t}
                  onClick={() => setChartTab(t)}
                  className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${chartTab === t ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2235" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#4A5568', fontSize: 12 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#4A5568', fontSize: 12 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#4A5568', fontSize: 12 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <ReTooltip
                  contentStyle={{
                    backgroundColor: '#1A2332',
                    border: '1px solid #232D42',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#E8ECF1',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#8B95A5' }}
                  iconType="square"
                  iconSize={10}
                />
                <Bar yAxisId="left" dataKey="harbor" name="31 Harbor" stackId="a" fill="#0A84FF" fillOpacity={0.6} radius={[0, 0, 0, 0]} />
                <Bar yAxisId="left" dataKey="party" name="Party Favor" stackId="a" fill="#F5A623" fillOpacity={0.6} radius={[0, 0, 0, 0]} />
                <Bar yAxisId="left" dataKey="xmrt" name="XMRT DAO" stackId="a" fill="#7B61FF" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="conversion" name="Conversion Rate" stroke="#22C55E" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#22C55E' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Stage Detail Modal */}
      <AnimatePresence>
        {selectedStage && (
          <StageDetailModal stage={selectedStage} leads={filteredLeads} onClose={() => setSelectedStage(null)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
