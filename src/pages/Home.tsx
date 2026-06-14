import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, Play, Sparkles, TrendingUp,
  GitBranch, Zap, CheckCircle, AlertTriangle, BarChart3,
  Megaphone, MoreHorizontal, ChevronRight, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import Layout from '@/components/Layout';
import OllamaStatus from '@/components/OllamaStatus';
import MuAPIStatus from '@/components/MuAPIStatus';
import { useDashboardStore } from '@/store/dashboardStore';
import {
  dailyRevenueData, companyRevenueBreakdown, sparklineDataTotalLeads,
  sparklineDataPipeline, activityFeed, pipelineStages, campaigns, leads,
} from '@/data/mockData';

// ─── Animation Variants ──────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

// ─── Count-Up Hook ───────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1200, suffix: string = '') {
  const [display, setDisplay] = useState(`0${suffix}`);

  useEffect(() => {
    let startTime: number | null = null;
    let raf: number;

    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.round(easeOutExpo(progress) * target);
      setDisplay(`${current.toLocaleString()}${suffix}`);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    const timer = setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, 400);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, suffix]);

  return display;
}

// ─── Activity Icon Mapper ────────────────────────────────────────────────────

const activityIcons: Record<string, React.ElementType> = {
  UserPlus, Sparkles, CheckCircle, GitBranch, TrendingUp, AlertTriangle, Zap,
  BarChart3, Megaphone,
};

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { bg: string; text: string }> = {
    Routed: { bg: 'bg-info/15', text: 'text-info' },
    Qualified: { bg: 'bg-success/15', text: 'text-success' },
    Pending: { bg: 'bg-warning/15', text: 'text-warning' },
    'Low Match': { bg: 'bg-text-tertiary/15', text: 'text-text-secondary' },
    Contracted: { bg: 'bg-success/15', text: 'text-success' },
    Quoted: { bg: 'bg-info/15', text: 'text-info' },
    Active: { bg: 'bg-success/15', text: 'text-success' },
  };
  const v = variants[status] || { bg: 'bg-text-tertiary/15', text: 'text-text-secondary' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${v.bg} ${v.text}`}>
      {status.toUpperCase()}
    </span>
  );
}

// ─── Score Color ─────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
}

// ─── KPI Sparkline (mini SVG) ────────────────────────────────────────────────

function MiniSparkline({ data, color, fillColor }: { data: number[]; color: string; fillColor: string }) {
  const w = 80;
  const h = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polygon points={fillPoints} fill={fillColor} opacity={0.15} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Mini Bar Chart for Marketing ROI ────────────────────────────────────────

function MiniBarChart() {
  const bars = [
    { h: 18, color: '#0A84FF' },
    { h: 24, color: '#F5A623' },
    { h: 14, color: '#7B61FF' },
    { h: 22, color: '#0A84FF' },
    { h: 16, color: '#F5A623' },
  ];
  return (
    <div className="flex items-end gap-[4px] h-[30px]">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-[10px] rounded-sm"
          style={{ height: `${bar.h}px`, backgroundColor: bar.color }}
        />
      ))}
    </div>
  );
}

// ─── Custom Tooltip for Revenue Chart ────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 shadow-xl">
      <div className="text-[11px] text-text-tertiary mb-1">Day {label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="text-text-primary font-medium">${entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Custom Tooltip for Donut ────────────────────────────────────────────────

function DonutTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2 text-[12px]">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.payload.color }} />
        <span className="text-text-secondary">{p.name}:</span>
        <span className="text-text-primary font-medium">${p.value.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ─── Main Overview Page ──────────────────────────────────────────────────────

export default function Home() {
  const { activeCompany } = useDashboardStore();

  // Count-up values
  const totalLeadsDisplay = useCountUp(247, 1200, '');
  const pipelineValueDisplay = useCountUp(84, 1200, '.2K');
  const marketingROIDisplay = useCountUp(3, 1200, '.4x');
  const aiDecisionsDisplay = useCountUp(1847, 1200, '');

  // Filtered data based on active company
  const filteredLeads = activeCompany === 'all'
    ? leads.slice(0, 10)
    : leads.filter((l) => l.companyId === activeCompany).slice(0, 10);

  const filteredActivity = activeCompany === 'all'
    ? activityFeed.slice(0, 20)
    : activityFeed.filter((a) => a.companyId === activeCompany).slice(0, 20);

  const totalRevenue = companyRevenueBreakdown.reduce((s, c) => s + c.value, 0);

  const getCompanyDot = (companyId: string) => {
    const colors: Record<string, string> = { harbor: '#0A84FF', party: '#F5A623', xmrt: '#7B61FF' };
    return <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[companyId] || '#8B95A5' }} />;
  };

  const getCompanyName = (companyId: string) => {
    const names: Record<string, string> = { harbor: '31 Harbor', party: 'Party Favor Photo', xmrt: 'XMRT DAO' };
    return names[companyId] || companyId;
  };

  return (
    <Layout>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* ─── Section 1: Page Header ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-[28px] font-bold text-text-primary tracking-tight">SuiteAI Command Center</h1>
            <p className="text-[14px] text-text-secondary mt-0.5">
              Unified intelligence for 31 Harbor · Party Favor Photo · XMRT DAO
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
              <span className="text-[12px] text-success font-medium">All systems operational</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-harbor-blue text-bg-darkest font-semibold text-[13px] rounded-md hover:brightness-110 transition-all">
              <UserPlus className="w-4 h-4" />
              New Lead
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-bg-hover border border-border-default text-text-primary font-medium text-[13px] rounded-md hover:bg-bg-hover/80 transition-all">
              <Play className="w-4 h-4" />
              Run Pipeline
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-bg-hover border border-border-default text-text-primary font-medium text-[13px] rounded-md hover:bg-bg-hover/80 transition-all">
              <Sparkles className="w-4 h-4" />
              Generate Content
            </button>
          </div>
        </motion.div>

        {/* ─── Section 2: KPI Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          {/* KPI 1: Total Leads */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 border-t-[3px] border-t-info"
          >
            <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">Total Leads</div>
            <div className="text-[42px] font-extrabold text-text-primary leading-tight tracking-tight">{totalLeadsDisplay}</div>
            <div className="flex items-center gap-1.5 mt-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[12px] text-success font-medium">12.5% vs last week</span>
            </div>
            <MiniSparkline data={sparklineDataTotalLeads.slice(-7)} color="#0EA5E9" fillColor="#0EA5E9" />
          </motion.div>

          {/* KPI 2: Pipeline Value */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 border-t-[3px] border-t-success"
          >
            <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">Pipeline Value</div>
            <div className="text-[42px] font-extrabold text-text-primary leading-tight tracking-tight">${pipelineValueDisplay}</div>
            <div className="flex items-center gap-1.5 mt-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[12px] text-success font-medium">8.3% vs last week</span>
            </div>
            <MiniSparkline data={sparklineDataPipeline.slice(-7)} color="#22C55E" fillColor="#22C55E" />
          </motion.div>

          {/* KPI 3: Marketing ROI */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 border-t-[3px] border-t-party-amber"
          >
            <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">Marketing ROI</div>
            <div className="text-[42px] font-extrabold text-text-primary leading-tight tracking-tight">{marketingROIDisplay}</div>
            <div className="flex items-center gap-1.5 mt-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[12px] text-success font-medium">0.2x vs last month</span>
            </div>
            <MiniBarChart />
          </motion.div>

          {/* KPI 4: AI Decisions */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 border-t-[3px] border-t-xmrt-purple"
          >
            <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">AI Decisions Today</div>
            <div className="text-[42px] font-extrabold text-text-primary leading-tight tracking-tight">{aiDecisionsDisplay}</div>
            <div className="flex items-center gap-1.5 mt-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[12px] text-success font-medium">234 vs yesterday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
              <span className="text-[12px] text-success font-medium">Live</span>
            </div>
          </motion.div>
        </div>

        {/* ─── Section 3: Charts Row ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Revenue Trend */}
          <motion.div
            custom={4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-all duration-200"
          >
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold text-text-primary">Revenue Trend</h3>
              <span className="text-[12px] text-text-tertiary">Last 30 days</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyRevenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradHarbor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0A84FF" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#0A84FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradParty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5A623" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#F5A623" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradXmrt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2235" />
                <XAxis dataKey="day" tick={{ fill: '#4A5568', fontSize: 12 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} />
                <YAxis tick={{ fill: '#4A5568', fontSize: 12 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="harbor" name="31 Harbor" stroke="#0A84FF" strokeWidth={2} fill="url(#gradHarbor)" />
                <Area type="monotone" dataKey="party" name="Party Favor" stroke="#F5A623" strokeWidth={2} fill="url(#gradParty)" />
                <Area type="monotone" dataKey="xmrt" name="XMRT DAO" stroke="#7B61FF" strokeWidth={2} fill="url(#gradXmrt)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-3">
              {[
                { name: '31 Harbor', color: '#0A84FF' },
                { name: 'Party Favor Photo', color: '#F5A623' },
                { name: 'XMRT DAO', color: '#7B61FF' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-[12px] text-text-secondary">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Company Revenue Breakdown */}
          <motion.div
            custom={5}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-semibold text-text-primary">Revenue by Company</h3>
              <span className="text-[14px] font-bold text-text-primary">100%</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={companyRevenueBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#0F1419"
                  strokeWidth={3}
                >
                  {companyRevenueBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-4 mb-3">
              <div className="text-[11px] text-text-tertiary uppercase tracking-wider">Total</div>
              <div className="text-[18px] font-bold text-text-primary">${(totalRevenue / 1000).toFixed(1)}K</div>
            </div>
            <div className="space-y-2">
              {companyRevenueBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary">{item.name}</span>
                  </div>
                  <span className="text-text-primary font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── Section 3.5: AI Service Status Widgets ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <OllamaStatus />
          <MuAPIStatus />
        </div>

        {/* ─── Section 4: Three-Column Status Row ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Live Activity Feed */}
          <motion.div
            custom={6}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-semibold text-text-primary">Live Activity</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-success/15 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
                  <span className="text-[10px] font-bold text-success uppercase tracking-wider">Live</span>
                </div>
              </div>
            </div>
            <div className="max-h-[320px] overflow-y-auto space-y-0 pr-1">
              {filteredActivity.map((item, i) => {
                const IconComp = activityIcons[item.icon] || Activity;
                return (
                  <motion.div
                    key={item.id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-start gap-3 py-2.5 border-b border-border-subtle last:border-b-0 hover:bg-bg-hover/50 px-2 -mx-2 rounded transition-colors"
                  >
                    {getCompanyDot(item.companyId)}
                    <IconComp className="w-4 h-4 text-text-secondary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-text-primary leading-snug">{item.description}</p>
                    </div>
                    <span className="text-[11px] text-text-tertiary shrink-0 font-mono tracking-tight">{item.timestamp}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Pipeline Status */}
          <motion.div
            custom={7}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-semibold text-text-primary">Pipeline Status</h3>
              <a href="#/pipeline" className="text-[13px] text-harbor-blue hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Pipeline Flow */}
            <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
              {pipelineStages.map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="px-3 py-1.5 bg-bg-hover border border-border-default rounded-full text-[11px] font-mono font-semibold text-text-primary whitespace-nowrap"
                      style={stage.needsApproval > 0 ? { borderLeftWidth: 3, borderLeftColor: '#F5A623' } : {}}
                    >
                      {stage.label}
                    </motion.div>
                    <span className="text-[14px] font-semibold text-text-primary mt-1.5 font-mono">{stage.count}</span>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-border-default shrink-0 mx-0.5" />
                  )}
                </div>
              ))}
            </div>

            {/* Approval Alert */}
            {pipelineStages.reduce((s, st) => s + st.needsApproval, 0) > 0 && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-warning/10 border-l-[3px] border-l-warning rounded-md">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <span className="text-[13px] text-text-primary flex-1">
                  {pipelineStages.reduce((s, st) => s + st.needsApproval, 0)} approvals pending
                </span>
                <a href="#/pipeline" className="text-[12px] text-warning hover:underline font-medium">Review →</a>
              </div>
            )}
          </motion.div>

          {/* Marketing Snapshot */}
          <motion.div
            custom={8}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-semibold text-text-primary">Marketing Performance</h3>
              <a href="#/marketing" className="text-[13px] text-harbor-blue hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Mini Horizontal Bars */}
            <div className="space-y-3 mb-4">
              {[
                { companyId: 'harbor', label: '31H', color: '#0A84FF', spend: 65, roas: '3.2x' },
                { companyId: 'party', label: 'PFP', color: '#F5A623', spend: 50, roas: '4.1x' },
                { companyId: 'xmrt', label: 'XMRT', color: '#7B61FF', spend: 45, roas: '2.8x' },
              ].map((bar) => (
                <div key={bar.companyId} className="flex items-center gap-3">
                  <span className="text-[12px] font-mono text-text-secondary w-10">{bar.label}</span>
                  <div className="flex-1 h-6 bg-bg-hover rounded overflow-hidden flex">
                    <div className="h-full rounded-l" style={{ width: `${bar.spend}%`, backgroundColor: bar.color, opacity: 0.6 }} />
                    <div className="h-full rounded-r" style={{ width: `${100 - bar.spend}%`, backgroundColor: bar.color, opacity: 0.25 }} />
                  </div>
                  <span className="text-[12px] font-semibold text-text-primary w-10 text-right">{bar.roas}</span>
                </div>
              ))}
            </div>

            {/* Active Campaigns */}
            <div className="space-y-2">
              {campaigns
                .filter((c) => c.status === 'Active' || c.status === 'Pending')
                .slice(0, 3)
                .map((campaign) => (
                  <div key={campaign.id} className="flex items-center gap-2.5 py-1.5">
                    {getCompanyDot(campaign.companyId)}
                    <span className="text-[13px] text-text-primary flex-1 truncate">{campaign.name}</span>
                    <StatusBadge status={campaign.status} />
                  </div>
                ))}
            </div>

            <a href="#/marketing" className="block mt-3 text-[12px] text-harbor-blue hover:underline font-medium">
              Manage Campaigns →
            </a>
          </motion.div>
        </div>

        {/* ─── Section 5: Recent Leads Table ────────────────────────────────── */}
        <motion.div
          custom={9}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[18px] font-semibold text-text-primary">Recent Leads</h3>
              <span className="text-[12px] text-text-tertiary">Last 24 hours</span>
            </div>
            <a href="#/leads" className="text-[13px] text-harbor-blue hover:underline flex items-center gap-1">
              View All Leads <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Lead</th>
                  <th className="text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Company</th>
                  <th className="text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Score</th>
                  <th className="text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Source</th>
                  <th className="text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Status</th>
                  <th className="text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Routed</th>
                  <th className="text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Time</th>
                  <th className="text-right text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className="border-b border-border-subtle last:border-b-0 hover:bg-bg-hover transition-colors"
                  >
                    <td className="px-3 py-3">
                      <div className="text-[14px] font-medium text-text-primary">{lead.name}</div>
                      <div className="text-[12px] text-text-tertiary">{lead.email}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {getCompanyDot(lead.companyId)}
                        <span className="text-[13px] text-text-primary">{getCompanyName(lead.companyId)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[14px] font-bold font-mono tabular-nums ${scoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[13px] text-text-secondary">{lead.source}</span>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-xmrt-purple" />
                        <span className="text-[13px] text-text-secondary">{lead.routedBy}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[12px] text-text-tertiary font-mono">{lead.timeAgo}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-bg-hover transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-text-tertiary" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
