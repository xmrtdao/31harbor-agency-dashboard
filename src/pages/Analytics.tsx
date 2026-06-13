import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  GitBranch,
  Workflow,
  Sparkles,
  FileText,
  Save,
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
  Table2,
  Filter,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import Layout from '@/components/Layout';

/* ─── Animation Constants ─────────────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const cardTransition = { duration: 0.4, ease };

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const dateRanges = ['Today', '7D', '30D', '90D', '1Y', 'Custom'];

const dailyRevenueData = Array.from({ length: 30 }, (_, i) => {
  const d = i + 1;
  const baseH = 1200 + Math.sin(d * 0.4) * 800 + d * 60;
  const baseP = 800 + Math.cos(d * 0.35) * 500 + d * 45;
  const baseX = 500 + Math.sin(d * 0.3) * 400 + d * 35;
  return {
    day: `Jan ${d.toString().padStart(2, '0')}`,
    harbor: Math.round(baseH),
    party: Math.round(baseP),
    xmrt: Math.round(baseX),
    total: Math.round(baseH + baseP + baseX),
  };
});

const radarData = [
  { metric: 'Revenue', harbor: 85, party: 72, xmrt: 65 },
  { metric: 'Leads', harbor: 78, party: 82, xmrt: 58 },
  { metric: 'Conversion', harbor: 65, party: 70, xmrt: 55 },
  { metric: 'ROI', harbor: 90, party: 85, xmrt: 60 },
  { metric: 'Efficiency', harbor: 88, party: 75, xmrt: 82 },
];

const funnelData = [
  { stage: 'Leads', count: 1247, fill: '#0EA5E9', width: 100 },
  { stage: 'Qualified', count: 892, fill: '#7B61FF', width: 72 },
  { stage: 'Quoted', count: 534, fill: '#F5A623', width: 43 },
  { stage: 'Contracted', count: 312, fill: '#22C55E', width: 25 },
  { stage: 'Converted', count: 407, fill: '#22C55E', width: 33 },
];

const funnelConversions = [
  { from: 'Leads', to: 'Qualified', rate: 71.5 },
  { from: 'Qualified', to: 'Quoted', rate: 59.9 },
  { from: 'Quoted', to: 'Contracted', rate: 58.4 },
  { from: 'Contracted', to: 'Converted', rate: 100 },
];

const leadSourceData = [
  { name: 'Organic', value: 474, color: '#22C55E' },
  { name: 'Paid Ads', value: 362, color: '#0A84FF' },
  { name: 'Referral', value: 224, color: '#F5A623' },
  { name: 'Scraped', value: 125, color: '#7B61FF' },
  { name: 'Manual', value: 62, color: '#8B95A5' },
];

const agents = [
  { id: 'CBLR', name: 'Cross-Business Lead Router', icon: GitBranch, color: '#0EA5E9', description: 'Lead routing & classification', tasks: '1,847', success: '94.2%', time: '1.2s' },
  { id: 'ABBA', name: 'Autonomous Business Agent', icon: Workflow, color: '#22C55E', description: 'Pipeline orchestration', tasks: '892', success: '91.7%', time: '4.2d' },
  { id: 'AMA', name: 'Autonomous Marketing Agency', icon: Sparkles, color: '#7B61FF', description: 'Campaign & content management', tasks: '2,341', success: '88.3%', time: '2.1h' },
];

const healthMonitors = [
  { name: 'Lead Ingestion API', status: 'Operational', uptime: '99.97%', latency: '45ms', color: '#22C55E' },
  { name: 'AI Classification Model', status: 'Operational', uptime: '99.91%', latency: '120ms', color: '#22C55E' },
  { name: 'Pipeline Orchestrator', status: 'Operational', uptime: '99.85%', latency: '80ms', color: '#22C55E' },
  { name: 'Content Generator', status: 'Operational', uptime: '99.78%', latency: '340ms', color: '#22C55E' },
  { name: 'Campaign Manager', status: 'Operational', uptime: '99.94%', latency: '55ms', color: '#22C55E' },
  { name: 'Database', status: 'Operational', uptime: '100%', latency: '12ms', color: '#22C55E' },
  { name: 'Notification Service', status: 'Operational', uptime: '99.88%', latency: '28ms', color: '#22C55E' },
];

const reportMetrics = [
  { label: 'Revenue', checked: true },
  { label: 'Leads', checked: true },
  { label: 'Conversion Rate', checked: true },
  { label: 'ROI', checked: true },
  { label: 'Cost per Lead', checked: false },
  { label: 'Pipeline Velocity', checked: true },
  { label: 'Agent Performance', checked: false },
  { label: 'Source Breakdown', checked: true },
];

const reportDimensions = [
  { label: 'Company', selected: true },
  { label: 'Date (daily)', selected: false },
  { label: 'Date (weekly)', selected: false },
  { label: 'Date (monthly)', selected: false },
  { label: 'Campaign', selected: false },
  { label: 'Lead Source', selected: false },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-bg-elevated border border-border-default rounded-lg px-4 py-3 shadow-xl">
      <p className="text-[12px] text-text-secondary mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[13px]">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="text-text-primary font-mono font-medium">
            {typeof p.value === 'number' ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── Conversion Funnel ───────────────────────────────────────────────────── */

function ConversionFunnel() {
  return (
    <div className="space-y-1">
      {funnelData.map((step, i) => (
        <div key={step.stage}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease }}
            className="flex items-center gap-4"
          >
            <div className="flex-1">
              <div
                className="h-9 rounded-md flex items-center justify-between px-4"
                style={{
                  width: `${step.width}%`,
                  minWidth: '120px',
                  background: `linear-gradient(to right, ${step.fill}, ${step.fill}cc)`,
                }}
              >
                <span className="text-[12px] font-semibold text-white whitespace-nowrap">{step.stage}</span>
                <span className="text-[12px] font-mono text-white/90 whitespace-nowrap">{step.count.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
          {i < funnelConversions.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.05, duration: 0.3 }}
              className="flex items-center py-1 pl-4"
            >
              <div className="text-[11px] text-text-tertiary font-mono">
                <span className="inline-block mr-1">&darr;</span>
                {funnelConversions[i].rate}%
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Analytics Page ─────────────────────────────────────────────────── */

export default function Analytics() {
  const [activeRange, setActiveRange] = useState('30D');
  const [selectedMetrics, setSelectedMetrics] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(reportMetrics.map((m) => [m.label, m.checked]))
  );
  const [selectedDimension, setSelectedDimension] = useState('Company');
  const [selectedChartType, setSelectedChartType] = useState('Line');

  const toggleMetric = (label: string) => {
    setSelectedMetrics((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const chartTypes = [
    { label: 'Line', icon: LineChart },
    { label: 'Bar', icon: BarChart },
    { label: 'Area', icon: AreaChart },
    { label: 'Pie', icon: PieChart },
    { label: 'Funnel', icon: Filter },
    { label: 'Table', icon: Table2 },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-6 h-6 text-info" />
              <h1 className="text-[28px] font-bold text-text-primary tracking-tight">Analytics</h1>
            </div>
            <p className="text-[14px] text-text-secondary">Deep insights across 31 Harbor &middot; Party Favor Photo &middot; XMRT DAO</p>
          </div>
          <div className="flex items-center gap-2">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                  activeRange === range
                    ? 'bg-bg-hover border border-border-default text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/50'
                }`}
              >
                {range}
              </button>
            ))}
            <button className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-default text-text-secondary text-[12px] font-medium hover:bg-bg-hover transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </motion.div>

        {/* KPI Row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {[
            {
              label: 'Total Revenue',
              value: '$124,600',
              change: '▲ 18.2% vs previous period',
              color: '#22C55E',
              accent: '#22C55E',
              sub: null,
            },
            {
              label: 'Total Leads',
              value: '1,247',
              change: '▲ 234 vs previous period',
              color: '#22C55E',
              accent: '#0EA5E9',
              sub: (
                <div className="flex items-center gap-3 mt-2">
                  {[
                    { label: '31H', count: 482, color: '#0A84FF' },
                    { label: 'PFP', count: 431, color: '#F5A623' },
                    { label: 'XMRT', count: 334, color: '#7B61FF' },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-[11px] text-text-secondary font-mono">{c.count}</span>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              label: 'Conversion Rate',
              value: '32.6%',
              change: '▲ 3.4% vs previous period',
              color: '#22C55E',
              accent: '#F5A623',
              sub: null,
            },
            {
              label: 'AI Efficiency',
              value: '94.2%',
              change: null,
              color: '#7B61FF',
              accent: '#7B61FF',
              sub: (
                <div className="text-[11px] text-text-tertiary mt-2">
                  Routing: 96% &middot; Content: 92% &middot; Pipeline: 95%
                </div>
              ),
            },
          ].map((kpi) => (
            <motion.div
              key={kpi.label}
              variants={fadeUp}
              transition={cardTransition}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-all duration-200"
              style={{ borderTopWidth: '3px', borderTopColor: kpi.accent }}
            >
              <div className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5">{kpi.label}</div>
              <div className="text-[28px] font-extrabold text-text-primary font-tabular leading-tight">{kpi.value}</div>
              {kpi.change && (
                <div className="text-[12px] mt-1.5 font-medium text-success">{kpi.change}</div>
              )}
              {kpi.sub}
            </motion.div>
          ))}
        </motion.div>

        {/* Row: Revenue Trend + Company Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease }}
            className="lg:col-span-2 bg-bg-elevated border border-border-subtle rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-text-primary">Revenue Trend</h3>
              <span className="text-[11px] text-text-tertiary uppercase tracking-wider">{activeRange}</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={dailyRevenueData}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A2332" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1A2332" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2235" />
                <XAxis dataKey="day" tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} />
                <YAxis tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#8B95A5' }} />
                <Bar dataKey="total" name="Total" fill="url(#barGrad)" barSize={12} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="harbor" name="31 Harbor" stroke="#0A84FF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="party" name="Party Favor Photo" stroke="#F5A623" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="xmrt" name="XMRT DAO" stroke="#7B61FF" strokeWidth={2} dot={false} />
                <Brush height={30} stroke="#232D42" fill="#0B0E14" travellerWidth={8} tickFormatter={() => ''} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Company Comparison Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease }}
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5"
          >
            <h3 className="text-[16px] font-semibold text-text-primary mb-4">Company Comparison</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width={220} height={180}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#1A2235" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#4A5568', fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: '#4A5568', fontSize: 9 }} domain={[0, 100]} />
                  <Radar name="31 Harbor" dataKey="harbor" stroke="#0A84FF" fill="#0A84FF" fillOpacity={0.08} strokeWidth={2} />
                  <Radar name="Party Favor" dataKey="party" stroke="#F5A623" fill="#F5A623" fillOpacity={0.08} strokeWidth={2} />
                  <Radar name="XMRT DAO" dataKey="xmrt" stroke="#7B61FF" fill="#7B61FF" fillOpacity={0.08} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Mini Comparison Table */}
            <div className="mt-4">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-2 text-text-tertiary font-medium">Metric</th>
                    <th className="text-center py-2 text-harbor-blue font-medium">31H</th>
                    <th className="text-center py-2 text-party-amber font-medium">PFP</th>
                    <th className="text-center py-2 text-xmrt-purple font-medium">XMRT</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'Revenue', harbor: '$52.4K', party: '$38.7K', xmrt: '$33.5K' },
                    { metric: 'Leads', harbor: '482', party: '431', xmrt: '334' },
                    { metric: 'Conv. Rate', harbor: '34.2%', party: '31.8%', xmrt: '28.5%' },
                    { metric: 'ROI', harbor: '4.1x', party: '3.8x', xmrt: '2.9x' },
                  ].map((row) => (
                    <tr key={row.metric} className="border-b border-border-subtle/50">
                      <td className="py-2 text-text-secondary">{row.metric}</td>
                      <td className="py-2 text-center font-mono text-harbor-blue">{row.harbor}</td>
                      <td className="py-2 text-center font-mono text-party-amber">{row.party}</td>
                      <td className="py-2 text-center font-mono text-xmrt-purple">{row.xmrt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Row: Conversion Funnel + Lead Source */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Conversion Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease }}
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-text-primary">Conversion Funnel</h3>
              <select className="bg-bg-input border border-border-default rounded-md text-[12px] text-text-primary px-2 py-1 focus:outline-none focus:border-border-focus">
                <option>All Companies</option>
                <option>31 Harbor</option>
                <option>Party Favor Photo</option>
                <option>XMRT DAO</option>
              </select>
            </div>
            <ConversionFunnel />
          </motion.div>

          {/* Lead Source Donut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4, ease }}
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5"
          >
            <h3 className="text-[16px] font-semibold text-text-primary mb-4">Lead Sources</h3>
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <ResponsiveContainer width={180} height={180}>
                  <RePieChart>
                    <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} stroke="#0F1419" strokeWidth={2} dataKey="value">
                      {leadSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0];
                      return (
                        <div className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 shadow-xl text-[12px]">
                          <span className="text-text-secondary">{p.name}: </span>
                          <span className="text-text-primary font-mono">{p.value} ({((p.value / 1247) * 100).toFixed(0)}%)</span>
                        </div>
                      );
                    }} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-[18px] font-bold text-text-primary font-tabular">1,247</div>
                    <div className="text-[10px] text-text-tertiary uppercase">Total</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {leadSourceData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-[13px] text-text-secondary">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1 bg-bg-hover rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(s.value / 474) * 100}%`, backgroundColor: s.color }} />
                      </div>
                      <span className="text-[12px] font-mono text-text-primary w-8 text-right">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row: Agent Performance + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Agent Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease }}
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5"
          >
            <h3 className="text-[16px] font-semibold text-text-primary mb-4">AI Agent Performance</h3>
            <div className="space-y-1">
              {agents.map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease }}
                    className="flex items-center gap-4 py-3 border-b border-border-subtle last:border-0"
                  >
                    {/* Agent Icon */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${agent.color}20` }}>
                      <Icon className="w-[18px] h-[18px]" style={{ color: agent.color }} />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-text-primary">{agent.name}</div>
                      <div className="text-[12px] text-text-secondary">{agent.description}</div>
                    </div>
                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-[12px] font-mono">
                      <div className="text-text-secondary">
                        <span className="text-text-tertiary mr-1">Tasks:</span>
                        <span className="text-text-primary font-medium">{agent.tasks}</span>
                      </div>
                      <div>
                        <span className="text-text-tertiary mr-1">Success:</span>
                        <span className="font-medium" style={{ color: agent.color }}>{agent.success}</span>
                      </div>
                      <div className="text-text-secondary">
                        <span className="text-text-tertiary mr-1">Avg:</span>
                        <span className="text-text-primary font-medium">{agent.time}</span>
                      </div>
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
                      <span className="text-[11px] text-success">Operational</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4, ease }}
            className="bg-bg-elevated border border-border-subtle rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-text-primary">System Health</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
                <span className="text-[12px] text-success font-medium">All Systems OK</span>
              </div>
            </div>
            <div className="space-y-1">
              {healthMonitors.map((monitor, i) => (
                <motion.div
                  key={monitor.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease }}
                  className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: monitor.color }} />
                    <span className="text-[14px] font-medium text-text-primary">{monitor.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] font-mono text-text-primary">{monitor.uptime}</span>
                    <span className="text-[12px] font-mono text-text-tertiary">{monitor.latency}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-text-tertiary">
              Last incident: 3 days ago &mdash; Pipeline delay resolved in 4m
            </div>
          </motion.div>
        </div>

        {/* Section: Custom Report Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4, ease }}
          className="bg-bg-elevated border border-border-subtle rounded-lg p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-semibold text-text-primary">Custom Report Builder</h3>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-xmrt-purple/20 text-xmrt-purple text-[12px] font-semibold hover:bg-xmrt-purple/30 transition-colors">
                <FileText className="w-3.5 h-3.5" />
                Generate Report
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-default text-text-secondary text-[12px] font-medium hover:bg-bg-hover transition-colors">
                <Save className="w-3.5 h-3.5" />
                Save Template
              </button>
            </div>
          </div>

          {/* Configurator Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4, ease }}
            >
              <h4 className="text-[14px] font-semibold text-text-primary mb-3">Metrics</h4>
              <div className="bg-bg-input border border-border-default rounded-md p-3 space-y-1">
                {reportMetrics.map((m) => (
                  <label key={m.label} className="flex items-center gap-2.5 py-1.5 px-2 rounded hover:bg-bg-hover/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedMetrics[m.label]}
                      onChange={() => toggleMetric(m.label)}
                      className="w-3.5 h-3.5 rounded border-border-default bg-bg-input checked:bg-xmrt-purple accent-xmrt-purple"
                    />
                    <span className="text-[13px] text-text-primary">{m.label}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Column 2: Dimensions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78, duration: 0.4, ease }}
            >
              <h4 className="text-[14px] font-semibold text-text-primary mb-3">Group By</h4>
              <div className="space-y-1">
                {reportDimensions.map((d) => (
                  <label key={d.label} className="flex items-center gap-2.5 py-1.5 px-2 rounded hover:bg-bg-hover/50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="dimension"
                      checked={selectedDimension === d.label}
                      onChange={() => setSelectedDimension(d.label)}
                      className="w-3.5 h-3.5 accent-xmrt-purple"
                    />
                    <span className="text-[13px] text-text-primary">{d.label}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Column 3: Chart Type + Preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.86, duration: 0.4, ease }}
            >
              <h4 className="text-[14px] font-semibold text-text-primary mb-3">Chart Type</h4>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {chartTypes.map((ct) => {
                  const Icon = ct.icon;
                  const isSelected = selectedChartType === ct.label;
                  return (
                    <button
                      key={ct.label}
                      onClick={() => setSelectedChartType(ct.label)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-md border transition-all ${
                        isSelected
                          ? 'border-xmrt-purple bg-xmrt-purple/10 text-xmrt-purple'
                          : 'border-border-default text-text-secondary hover:border-border-focus hover:text-text-primary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium">{ct.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="border border-dashed border-border-default rounded-md p-6 flex items-center justify-center bg-bg-input/50">
                <span className="text-[12px] text-text-tertiary text-center">Preview will appear here after generation</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
