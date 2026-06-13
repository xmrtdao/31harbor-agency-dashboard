import { useEffect, useState, useMemo } from 'react';
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
import { useDashboardStore } from '@/store/dashboardStore';
import { companies as mockCompanies } from '@/data/mockData';

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
  BarChart3, Megaphone, routing: GitBranch, lead: UserPlus, pipeline: GitBranch,
  campaign: Megaphone, ai: Sparkles, system: Zap, approval: AlertTriangle,
  content: Sparkles, analytics: BarChart3, conversion: TrendingUp,
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
    new: { bg: 'bg-info/15', text: 'text-info' },
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

function getScoreColorHex(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
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

function MiniBarChart({ data }: { data: number[] }) {
  const colors = ['#0A84FF', '#F5A623', '#7B61FF', '#0A84FF', '#F5A623'];
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[4px] h-[30px]">
      {data.slice(0, 5).map((val, i) => (
        <div
          key={i}
          className="w-[10px] rounded-sm"
          style={{ height: `${Math.max((val / max) * 24, 4)}px`, backgroundColor: colors[i % colors.length] }}
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

// ─── Time Ago Helper ─────────────────────────────────────────────────────────

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

// ─── Main Overview Page ──────────────────────────────────────────────────────

export default function Home() {
  const store = useDashboardStore();
  const { activeCompany, leads, campaigns, pipelineStages, activityFeed, companies } = store;

  // ── Derived KPI values (reactive from store) ────────────────────────────
  const filteredLeads = useMemo(() => {
    if (activeCompany === 'all') return leads;
    return leads.filter((l) => l.company_routed === activeCompany);
  }, [leads, activeCompany]);

  const filteredCampaigns = useMemo(() => {
    if (activeCompany === 'all') return campaigns;
    return campaigns.filter((c) => c.company === activeCompany);
  }, [campaigns, activeCompany]);

  const totalLeads = filteredLeads.length;
  const pipelineValue = filteredLeads.reduce((sum, l) => sum + (l.value || 0), 0);
  const avgRoi = filteredCampaigns.length > 0
    ? filteredCampaigns.reduce((s, c) => s + (c.roi || 0), 0) / filteredCampaigns.length
    : 0;
  const aiDecisions = leads.filter((l) => l.ai_confidence && l.ai_confidence !== 'low').length;

  // Count-up displays (recomputed when derived values change)
  const totalLeadsDisplay = useCountUp(totalLeads, 1200, '');
  const pipelineValueDisplay = useCountUp(Math.round(pipelineValue / 1000), 1200, 'K');
  const marketingROIDisplay = useCountUp(Math.round(avgRoi * 10), 1200, `.${Math.round((avgRoi % 1) * 10)}x`);
  const aiDecisionsDisplay = useCountUp(aiDecisions, 1200, '');

  // ── Revenue chart data from store ───────────────────────────────────────
  const revenueData = store.getRevenueData();
  const activeRevenueData = useMemo(() => {
    if (activeCompany === 'all') return revenueData;
    return revenueData.map((d: any) => ({
      ...d,
      harbor: d.harbor * (activeCompany === 'harbor' ? 1 : 0.3),
      party: d.party * (activeCompany === 'party' ? 1 : 0.3),
      xmrt: d.xmrt * (activeCompany === 'xmrt' ? 1 : 0.3),
    }));
  }, [revenueData, activeCompany]);

  // ── Company donut chart (derived from real leads) ───────────────────────
  const companyDonutData = useMemo(() => {
    const companyColors: Record<string, string> = {
      harbor: '#0A84FF',
      party: '#F5A623',
      xmrt: '#7B61FF',
    };
    const companyNames: Record<string, string> = {
      harbor: '31 Harbor',
      party: 'Party Favor Photo',
      xmrt: 'XMRT DAO',
    };
    const relevantLeads = activeCompany === 'all' ? leads : leads.filter((l) => l.company_routed === activeCompany);
    const counts: Record<string, number> = {};
    relevantLeads.forEach((l) => {
      const cid = l.company_routed || 'unknown';
      counts[cid] = (counts[cid] || 0) + 1;
    });
    const data = Object.entries(counts).map(([company, count]) => ({
      name: companyNames[company] || company,
      value: count,
      color: companyColors[company] || '#8B95A5',
    }));
    if (data.length === 0) {
      return [{ name: 'No Data', value: 1, color: '#8B95A5' }];
    }
    return data;
  }, [leads, activeCompany]);

  const totalDonutValue = companyDonutData.reduce((s, c) => s + c.value, 0);

  // ── Activity feed from store ────────────────────────────────────────────
  const filteredActivity = useMemo(() => {
    const feed = activityFeed || [];
    const relevant = activeCompany === 'all'
      ? feed
      : feed.filter((a) => a.company === activeCompany);
    return relevant.slice(0, 20);
  }, [activityFeed, activeCompany]);

  // ── Pipeline stages with counts from store ──────────────────────────────
  const pipelineData = store.getPipelineData();
  const activePipelineStages = useMemo(() => {
    return pipelineData.map((s: any) => ({
      id: s.id,
      label: s.name.toUpperCase(),
      count: s.count,
      needsApproval: s.requires_approval,
      activeCompanies: [s.id],
    }));
  }, [pipelineData]);

  const totalApprovals = activePipelineStages.reduce((s, st) => s + st.needsApproval, 0);

  // ── Recent leads (top 10 from store) ────────────────────────────────────
  const recentLeads = useMemo(() => {
    return filteredLeads.slice(0, 10);
  }, [filteredLeads]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getCompanyDot = (companyId: string | null) => {
    const colors: Record<string, string> = { harbor: '#0A84FF', party: '#F5A623', xmrt: '#7B61FF' };
    return <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[companyId || ''] || '#8B95A5' }} />;
  };

  const getCompanyName = (companyId: string | null) => {
    const names: Record<string, string> = { harbor: '31 Harbor', party: 'Party Favor Photo', xmrt: 'XMRT DAO' };
    return names[companyId || ''] || companyId || 'Unknown';
  };

  const getCompanyColor = (companyId: string | null) => {
    const colors: Record<string, string> = { harbor: '#0A84FF', party: '#F5A623', xmrt: '#7B61FF' };
    return colors[companyId || ''] || '#8B95A5';
  };

  const getCompanyColorDim = (companyId: string | null) => {
    const dims: Record<string, string> = { harbor: '#0A84FF33', party: '#F5A62333', xmrt: '#7B61FF33' };
    return dims[companyId || ''] || '#8B95A533';
  };

  // ── Sparkline data (derived from actual lead counts over time) ──────────
  const leadSparkline = useMemo(() => {
    const counts: number[] = [];
    const sorted = [...filteredLeads].sort((a, b) =>
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );
    let running = 0;
    sorted.forEach(() => {
      running++;
      counts.push(running);
    });
    return counts.length >= 5 ? counts : [12, 18, 25, 32, 38, 42, 48, 55, 60, 68, 72, 80, 85, 92, 100, 105, 112, 120, 128, 135];
  }, [filteredLeads]);

  const pipelineSparkline = useMemo(() => {
    const stages = activePipelineStages;
    return stages.map((s) => s.count * 1.5);
  }, [activePipelineStages]);

  const campaignBarData = useMemo(() => {
    return filteredCampaigns.map((c) => c.spend || 0);
  }, [filteredCampaigns]);

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
            <h1 className="text-[28px] font-bold text-text-primary tracking-tight">AgenticOS Command Center</h1>
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
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 border-t-[3px] border-t-harbor-blue"
          >
            <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">Total Leads</div>
            <div className="text-[42px] font-extrabold text-text-primary leading-tight tracking-tight">{totalLeadsDisplay}</div>
            <div className="flex items-center gap-1.5 mt-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[12px] text-success font-medium">{filteredLeads.filter((l) => (l.score || 0) >= 80).length} high-intent</span>
            </div>
            <MiniSparkline data={leadSparkline} color="#0A84FF" fillColor="#0A84FF" />
          </motion.div>

          {/* KPI 2: Pipeline Value */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 border-t-[3px] border-t-party-gold"
          >
            <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">Pipeline Value</div>
            <div className="text-[42px] font-extrabold text-text-primary leading-tight tracking-tight">${pipelineValueDisplay}</div>
            <div className="flex items-center gap-1.5 mt-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[12px] text-success font-medium">{filteredLeads.filter((l) => l.status === 'Contracted' || l.status === 'contracted').length} contracted</span>
            </div>
            <MiniSparkline data={pipelineSparkline.length >= 5 ? pipelineSparkline : [12, 14, 13, 15, 16, 15, 17, 18, 17, 19, 20, 19, 21, 22, 21]} color="#F5A623" fillColor="#F5A623" />
          </motion.div>

          {/* KPI 3: Marketing ROI */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 border-t-[3px] border-t-success"
          >
            <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">Marketing ROI</div>
            <div className="text-[42px] font-extrabold text-text-primary leading-tight tracking-tight">{avgRoi > 0 ? `${avgRoi.toFixed(1)}x` : marketingROIDisplay}</div>
            <div className="flex items-center gap-1.5 mt-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[12px] text-success font-medium">{filteredCampaigns.filter((c) => (c.roi || 0) > 0).length} active campaigns</span>
            </div>
            <MiniBarChart data={campaignBarData.length > 0 ? campaignBarData : [4200, 2800, 5500, 3500, 1800]} />
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
              <span className="text-[12px] text-success font-medium">{leads.filter((l) => (l.score || 0) >= 80).length} high-confidence</span>
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
              <span className="text-[12px] text-text-tertiary">Last 12 months</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activeRevenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
                <XAxis dataKey="month" tick={{ fill: '#4A5568', fontSize: 12 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} />
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
              <h3 className="text-[18px] font-semibold text-text-primary">Leads by Company</h3>
              <span className="text-[14px] font-bold text-text-primary">{totalDonutValue}</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={companyDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#0F1419"
                  strokeWidth={3}
                >
                  {companyDonutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-4 mb-3">
              <div className="text-[11px] text-text-tertiary uppercase tracking-wider">Total</div>
              <div className="text-[18px] font-bold text-text-primary">{totalDonutValue} leads</div>
            </div>
            <div className="space-y-2">
              {companyDonutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary">{item.name}</span>
                  </div>
                  <span className="text-text-primary font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
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
                const IconComp = activityIcons[item.type || ''] || Activity;
                return (
                  <motion.div
                    key={item.id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-start gap-3 py-2.5 border-b border-border-subtle last:border-b-0 hover:bg-bg-hover/50 px-2 -mx-2 rounded transition-colors"
                  >
                    {getCompanyDot(item.company)}
                    <IconComp className="w-4 h-4 text-text-secondary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-text-primary leading-snug">{item.description}</p>
                    </div>
                    <span className="text-[11px] text-text-tertiary shrink-0 font-mono tracking-tight">{timeAgo(item.created_at)}</span>
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
              {activePipelineStages.map((stage, i) => (
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
                  {i < activePipelineStages.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-border-default shrink-0 mx-0.5" />
                  )}
                </div>
              ))}
            </div>

            {/* Approval Alert */}
            {totalApprovals > 0 && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-warning/10 border-l-[3px] border-l-warning rounded-md">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <span className="text-[13px] text-text-primary flex-1">
                  {totalApprovals} approvals pending
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
              {mockCompanies.map((bar) => {
                const companyCampaigns = campaigns.filter((c) => c.company === bar.id);
                const totalSpend = companyCampaigns.reduce((s, c) => s + (c.spend || 0), 0);
                const maxSpend = Math.max(...campaigns.map((c) => c.spend || 1), 1);
                const avgRoas = companyCampaigns.length > 0
                  ? companyCampaigns.reduce((s, c) => s + (c.roi || 0), 0) / companyCampaigns.length
                  : 0;
                if (activeCompany !== 'all' && activeCompany !== bar.id) return null;
                return (
                  <div key={bar.id} className="flex items-center gap-3">
                    <span className="text-[12px] font-mono text-text-secondary w-10">{bar.abbreviation}</span>
                    <div className="flex-1 h-6 bg-bg-hover rounded overflow-hidden flex">
                      <div className="h-full rounded-l" style={{ width: `${Math.min((totalSpend / maxSpend) * 100, 100)}%`, backgroundColor: bar.color, opacity: 0.6 }} />
                      <div className="h-full rounded-r flex-1" style={{ backgroundColor: bar.color, opacity: 0.15 }} />
                    </div>
                    <span className="text-[12px] font-semibold text-text-primary w-10 text-right">{avgRoas.toFixed(1)}x</span>
                  </div>
                );
              })}
            </div>

            {/* Active Campaigns */}
            <div className="space-y-2">
              {campaigns
                .filter((c) => {
                  if (activeCompany !== 'all' && c.company !== activeCompany) return false;
                  return (c.status || '').toLowerCase() === 'active' || (c.status || '').toLowerCase() === 'pending';
                })
                .slice(0, 3)
                .map((campaign) => (
                  <div key={campaign.id} className="flex items-center gap-2.5 py-1.5">
                    {getCompanyDot(campaign.company)}
                    <span className="text-[13px] text-text-primary flex-1 truncate">{campaign.name}</span>
                    <StatusBadge status={campaign.status || 'Draft'} />
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
              <span className="text-[12px] text-text-tertiary">From SQLite database</span>
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
                  <th className="text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Intent</th>
                  <th className="text-left text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Time</th>
                  <th className="text-right text-[11px] font-medium text-text-secondary uppercase tracking-wider px-3 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead, i) => (
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
                      <div className="text-[12px] text-text-tertiary">{lead.email || '—'}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {getCompanyDot(lead.company_routed)}
                        <span className="text-[13px] text-text-primary">{getCompanyName(lead.company_routed)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[14px] font-bold font-mono tabular-nums ${scoreColor(lead.score || 0)}`}>
                        {lead.score || 0}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[13px] text-text-secondary">{lead.source || '—'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={lead.status || 'New'} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-xmrt-purple" />
                        <span className="text-[13px] text-text-secondary truncate max-w-[140px]">{lead.intent || '—'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[12px] text-text-tertiary font-mono">{timeAgo(lead.created_at)}</span>
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
            {recentLeads.length === 0 && (
              <div className="py-12 text-center text-[14px] text-text-secondary">No leads found for the selected company.</div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
