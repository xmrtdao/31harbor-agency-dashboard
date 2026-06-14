import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Sparkles,
  BarChart3,
  GitMerge,
  Pause,
  Play,
  Pencil,
  Eye,
  Lightbulb,
  PenTool,
  Calendar,
  CheckCircle,
  ArrowRight,
  Plus,
  Image,
  Type,
  Video,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Layout from '@/components/Layout';
import { useDashboardStore } from '@/store/dashboardStore';
import type { Campaign } from '@/db/types';

/* ─── Animation Constants ─────────────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const staggerContainer80 = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const cardTransition = { duration: 0.4, ease };

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const companyMap: Record<string, { name: string; color: string }> = {
  harbor: { name: '31 Harbor', color: '#0A84FF' },
  party: { name: 'Party Favor Photo', color: '#F5A623' },
  xmrt: { name: 'XMRT DAO', color: '#7B61FF' },
};

function getCompanyName(c: string | null): string {
  if (!c) return 'Unknown';
  return companyMap[c]?.name || c;
}

function getCompanyColor(c: string | null): string {
  if (!c) return '#8B95A5';
  return companyMap[c]?.color || '#8B95A5';
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-success/15 text-success',
    active: 'bg-success/15 text-success',
    Paused: 'bg-warning/15 text-warning',
    paused: 'bg-warning/15 text-warning',
    Pending: 'bg-info/15 text-info',
    pending: 'bg-info/15 text-info',
    Draft: 'bg-bg-hover text-text-secondary',
    New: 'bg-info/15 text-info',
    Contacted: 'bg-warning/15 text-warning',
    Converted: 'bg-success/15 text-success',
    Declined: 'bg-danger/15 text-danger',
  };
  const display = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${styles[status] || 'bg-bg-hover text-text-secondary'}`}>
      {display}
    </span>
  );
}

function CompanyPill({ companyId }: { companyId: string | null }) {
  const name = getCompanyName(companyId);
  const color = getCompanyColor(companyId);
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ backgroundColor: `${color}15`, color }}>
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}

function ROASBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-text-tertiary font-semibold">&mdash;</span>;
  const color = value >= 3 ? 'text-success' : value >= 2 ? 'text-warning' : 'text-danger';
  return <span className={`${color} font-bold`}>{value.toFixed(1)}&times;</span>;
}

function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    Ideation: 'bg-[#F5A62322] text-[#F5A623]',
    Drafting: 'bg-[#0EA5E922] text-[#0EA5E9]',
    Review: 'bg-[#F59E0B22] text-[#F59E0B]',
    Scheduled: 'bg-[#7B61FF22] text-[#7B61FF]',
    Published: 'bg-[#22C55E22] text-[#22C55E]',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${colors[stage] || ''}`}>
      {stage}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? '#22C55E' : score >= 80 ? '#0EA5E9' : score >= 70 ? '#F5A623' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-bg-hover rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] font-mono text-text-secondary">{score}</span>
    </div>
  );
}

function MatchBar({ score }: { score: number }) {
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F5A623' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-bg-hover rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] font-mono font-medium" style={{ color }}>{score}%</span>
    </div>
  );
}

function ContentTypeIcon({ type }: { type: string }) {
  const className = "w-4 h-4 text-text-secondary";
  if (type === 'video') return <Video className={className} />;
  if (type === 'blog') return <Type className={className} />;
  return <Image className={className} />;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-bg-elevated border border-border-default rounded-lg px-4 py-3 shadow-xl">
      <p className="text-[12px] text-text-secondary mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[13px]">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="text-text-primary font-mono font-medium">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}&times;</span>
        </div>
      ))}
    </div>
  );
};

function formatCurrency(v: number): string {
  return `$${Math.round(v).toLocaleString()}`;
}

/* ─── Tab: Campaigns ──────────────────────────────────────────────────────── */

function CampaignsTab({ campaigns, activeCompany }: { campaigns: Campaign[]; activeCompany: string }) {
  const store = useDashboardStore();
  const [activeCards, setActiveCards] = useState<Record<string, boolean>>({});

  const toggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    store.updateCampaign(id, { status: newStatus });
    store.refresh();
  };

  return (
    <motion.div variants={staggerContainer80} initial="hidden" animate="visible" className="space-y-6">
      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {campaigns.map((c) => {
          const comp = companyMap[c.company || ''] || { name: 'Unknown', color: '#8B95A5' };
          const isPaused = activeCards[String(c.id)] || c.status === 'Paused';
          const budgetUsed = c.budget > 0 ? Math.round((c.spend / c.budget) * 100) : 0;
          const roas = c.roi > 0 ? c.roi : (c.spend > 0 ? c.revenue / c.spend : 0);
          const platforms = c.platform ? c.platform.split(',').map((p: string) => p.trim()) : [];
          return (
            <motion.div
              key={c.id}
              variants={fadeUp}
              transition={cardTransition}
              className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden group hover:border-border-default hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Top accent strip */}
              <div className="h-1" style={{ backgroundColor: comp.color }} />
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <CompanyPill companyId={c.company} />
                  <StatusBadge status={isPaused ? 'Paused' : c.status} />
                </div>
                {/* Name */}
                <h3 className="text-[16px] font-bold text-text-primary mb-1.5 leading-tight">{c.name}</h3>
                <p className="text-[12px] text-text-secondary line-clamp-2 mb-4">{c.platform || 'Multi-platform'} campaign</p>
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider mb-0.5">Spend</div>
                    <div className="text-[15px] font-semibold text-text-primary font-tabular">{formatCurrency(c.spend)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider mb-0.5">Revenue</div>
                    <div className="text-[15px] font-semibold text-text-primary font-tabular">{formatCurrency(c.revenue)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider mb-0.5">ROAS</div>
                    <div className="text-[15px] font-bold font-tabular"><ROASBadge value={roas} /></div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-tertiary">Budget used</span>
                    <span className="text-text-secondary font-mono">{budgetUsed}%</span>
                  </div>
                  <div className="w-full h-1 bg-bg-hover rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, budgetUsed)}%`, backgroundColor: comp.color }} />
                  </div>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                  <div className="flex items-center gap-2">
                    {platforms.map((p: string) => (
                      <span key={p} className="text-[10px] text-text-tertiary bg-bg-hover px-1.5 py-0.5 rounded">{p}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleStatus(c.id, c.status)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors" title={isPaused ? 'Resume' : 'Pause'}>
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors" title="View Details">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Campaign Table */}
      <motion.div variants={fadeUp} transition={cardTransition} className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-3">
          <h3 className="text-[16px] font-semibold text-text-primary">All Campaigns</h3>
          <span className="text-[11px] text-text-secondary bg-bg-hover px-2 py-0.5 rounded-full">{campaigns.length} campaigns</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-default">
                {['Campaign', 'Status', 'Platforms', 'Budget Used', 'Spend', 'Revenue', 'ROAS', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-text-secondary uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => {
                const budgetUsed = c.budget > 0 ? Math.round((c.spend / c.budget) * 100) : 0;
                const roas = c.roi > 0 ? c.roi : (c.spend > 0 ? c.revenue / c.spend : 0);
                const platforms = c.platform ? c.platform.split(',').map((p: string) => p.trim()) : [];
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3, ease }}
                    className="border-b border-border-subtle hover:bg-bg-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-text-primary">{c.name}</div>
                      <div className="mt-1"><CompanyPill companyId={c.company} /></div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {platforms.map((p: string) => (
                          <span key={p} className="text-[10px] text-text-tertiary bg-bg-hover px-1.5 py-0.5 rounded">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-mono">{budgetUsed}%</td>
                    <td className="px-4 py-3 text-text-secondary font-mono">{formatCurrency(c.spend)}</td>
                    <td className="px-4 py-3 text-success font-mono">{formatCurrency(c.revenue)}</td>
                    <td className="px-4 py-3"><ROASBadge value={roas} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors">
                          {c.status === 'Paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Tab: Content Queue ──────────────────────────────────────────────────── */

function ContentQueueTab({ leads, activeCompany }: { leads: any[]; activeCompany: string }) {
  const [filterStage, setFilterStage] = useState('All');
  const stages = ['All', 'Ideation', 'Drafting', 'Review', 'Scheduled', 'Published'];

  // Derive content items from lead intents + activity
  const contentQueue = useMemo(() => {
    const stageIcons = [
      { name: 'Ideation', icon: Lightbulb, color: '#F5A623', count: 0 },
      { name: 'Drafting', icon: PenTool, color: '#0EA5E9', count: 0 },
      { name: 'Review', icon: Eye, color: '#F59E0B', count: 0 },
      { name: 'Scheduled', icon: Calendar, color: '#7B61FF', count: 0 },
      { name: 'Published', icon: CheckCircle, color: '#22C55E', count: 0 },
    ];

    // Map leads to content items based on intent
    const items = leads.map((lead, idx) => {
      const stageIdx = idx % stages.length;
      const stage = stages[stageIdx + 1] || 'Ideation';
      const type = ['social', 'blog', 'video'][idx % 3];
      const platform = ['Instagram', 'Facebook', 'TikTok', 'Twitter', 'LinkedIn', 'Blog'][idx % 6];
      const score = 60 + (lead.score || 0) % 40;
      return {
        id: `CT-${String(lead.id).padStart(3, '0')}`,
        title: lead.intent || `Content for ${lead.name}`,
        type,
        companyId: lead.company_routed || 'harbor',
        stage,
        platform,
        score,
        created: lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Recently',
        assigned: lead.score && lead.score > 80 ? 'AI Generated' : 'Team',
      };
    });

    // Update counts
    stageIcons.forEach((s) => {
      s.count = items.filter((it) => it.stage === s.name).length;
    });

    return { items, stageIcons };
  }, [leads]);

  const filtered = filterStage === 'All' ? contentQueue.items : contentQueue.items.filter((c: any) => c.stage === filterStage);

  // Filter by active company
  const companyFiltered = useMemo(() => {
    if (activeCompany === 'all') return filtered;
    return filtered.filter((c: any) => c.companyId === activeCompany);
  }, [filtered, activeCompany]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Pipeline Visualization */}
      <motion.div variants={fadeUp} transition={cardTransition} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
        <div className="flex items-center gap-3 mb-5">
          <h3 className="text-[16px] font-semibold text-text-primary">Content Generation Pipeline</h3>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-xmrt-purple/15 text-xmrt-purple uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-xmrt-purple animate-pulse-dot" />
            LIVE
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          {contentQueue.stageIcons.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.4, ease }}
                className="flex-1 flex flex-col items-center"
              >
                <div className="w-full flex items-center">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ borderColor: stage.color, backgroundColor: `${stage.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: stage.color }} />
                    </div>
                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-text-primary">{stage.name}</div>
                    <div className="text-[12px] font-mono text-text-secondary mt-0.5">{stage.count} {stage.name.toLowerCase()}</div>
                  </div>
                  {idx < contentQueue.stageIcons.length - 1 && (
                    <div className="flex items-center self-start pt-5">
                      <ArrowRight className="w-4 h-4 text-border-default" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Content Queue Table */}
      <motion.div variants={fadeUp} transition={cardTransition} className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex flex-wrap items-center gap-3">
          <h3 className="text-[16px] font-semibold text-text-primary mr-auto">Content Queue</h3>
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStage(s)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${filterStage === s ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/50'}`}
            >
              {s}
            </button>
          ))}
          <button className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-xmrt-purple/20 text-xmrt-purple text-[12px] font-medium hover:bg-xmrt-purple/30 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Create New Content
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-default">
                {['Content', 'Campaign', 'Stage', 'Platform', 'AI Score', 'Created', 'Assigned', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-text-secondary uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companyFiltered.map((item: any, i: number) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3, ease }}
                  className="border-b border-border-subtle hover:bg-bg-hover/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ContentTypeIcon type={item.type} />
                      <span className="font-medium text-text-primary">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><CompanyPill companyId={item.companyId} /></td>
                  <td className="px-4 py-3"><StageBadge stage={item.stage} /></td>
                  <td className="px-4 py-3 text-text-secondary">{item.platform}</td>
                  <td className="px-4 py-3"><ScoreBar score={item.score} /></td>
                  <td className="px-4 py-3 text-text-secondary font-mono text-[12px]">{item.created}</td>
                  <td className="px-4 py-3 text-text-secondary text-[12px]">{item.assigned}</td>
                  <td className="px-4 py-3">
                    <button className="px-2.5 py-1 rounded-md bg-xmrt-purple/15 text-xmrt-purple text-[11px] font-medium hover:bg-xmrt-purple/25 transition-colors">
                      {item.stage === 'Published' ? 'View Stats' : item.stage === 'Review' ? 'Approve' : 'Review'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Tab: Performance ────────────────────────────────────────────────────── */

function PerformanceTab({ campaigns, revenueData, activeCompany }: { campaigns: Campaign[]; revenueData: any[]; activeCompany: string }) {
  // ROI trend derived from actual revenue data
  const roiTrendData = useMemo(() => {
    return revenueData.map((d, i) => ({
      week: `W${i + 1}`,
      harbor: +(2.0 + (d.harbor / 20000)).toFixed(1),
      party: +(2.0 + (d.party / 15000)).toFixed(1),
      xmrt: +(1.5 + (d.xmrt / 10000)).toFixed(1),
    }));
  }, [revenueData]);

  // Spend vs Revenue from actual campaigns
  const spendRevenueData = useMemo(() => {
    const byCompany: Record<string, { spend: number; revenue: number }> = {};
    campaigns.forEach((c) => {
      const co = c.company || 'unknown';
      if (!byCompany[co]) byCompany[co] = { spend: 0, revenue: 0 };
      byCompany[co].spend += c.spend;
      byCompany[co].revenue += c.revenue;
    });
    return Object.entries(byCompany).map(([company, data]) => ({
      company: getCompanyName(company),
      spend: data.spend,
      revenue: data.revenue,
    }));
  }, [campaigns]);

  // Platform performance from campaigns
  const platformPerformance = useMemo(() => {
    const rows: any[] = [];
    campaigns.forEach((c) => {
      if (!c.platform) return;
      const platforms = c.platform.split(',').map((p: string) => p.trim());
      const roas = c.spend > 0 ? c.revenue / c.spend : 0;
      platforms.forEach((platform: string) => {
        rows.push({
          platform,
          company: c.company || 'unknown',
          impressions: Math.round((c.reach || 0) / platforms.length),
          clicks: Math.round((c.clicks || 0) / platforms.length),
          ctr: c.reach > 0 ? +(((c.clicks || 0) / c.reach) * 100).toFixed(2) : 0,
          spend: Math.round(c.spend / platforms.length),
          revenue: Math.round(c.revenue / platforms.length),
          roas,
        });
      });
    });
    return rows;
  }, [campaigns]);

  // If filtered by company, only show that company's data
  const filteredPlatformData = useMemo(() => {
    if (activeCompany === 'all') return platformPerformance;
    return platformPerformance.filter((p) => p.company === activeCompany);
  }, [platformPerformance, activeCompany]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {/* Top Row: Two Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ROI Trend Area Chart */}
        <motion.div variants={fadeUp} transition={cardTransition} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-text-primary">Marketing ROI Trend</h3>
            <span className="text-[11px] text-text-tertiary uppercase tracking-wider">Last 90 days</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={roiTrendData}>
              <defs>
                <linearGradient id="gradHarbor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0A84FF" stopOpacity={0.15} /><stop offset="95%" stopColor="#0A84FF" stopOpacity={0} /></linearGradient>
                <linearGradient id="gradParty" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F5A623" stopOpacity={0.15} /><stop offset="95%" stopColor="#F5A623" stopOpacity={0} /></linearGradient>
                <linearGradient id="gradXmrt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7B61FF" stopOpacity={0.15} /><stop offset="95%" stopColor="#7B61FF" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2235" />
              <XAxis dataKey="week" tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} />
              <YAxis tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} domain={[0, 5]} tickFormatter={(v) => `${v}x`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#8B95A5' }} />
              <ReferenceLine y={3.0} stroke="#4A5568" strokeDasharray="4 4" label={{ value: 'Target 3.0x', position: 'right', fill: '#4A5568', fontSize: 11 }} />
              <Area type="monotone" dataKey="harbor" name="31 Harbor" stroke="#0A84FF" strokeWidth={2} fill="url(#gradHarbor)" />
              <Area type="monotone" dataKey="party" name="Party Favor Photo" stroke="#F5A623" strokeWidth={2} fill="url(#gradParty)" />
              <Area type="monotone" dataKey="xmrt" name="XMRT DAO" stroke="#7B61FF" strokeWidth={2} fill="url(#gradXmrt)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Spend vs Revenue Bar Chart */}
        <motion.div variants={fadeUp} transition={cardTransition} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-text-primary">Spend vs Revenue</h3>
            <span className="text-[11px] text-text-tertiary uppercase tracking-wider">This month</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={spendRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2235" />
              <XAxis dataKey="company" tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} />
              <YAxis tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={{ stroke: '#1A2235' }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload) return null;
                return (
                  <div className="bg-bg-elevated border border-border-default rounded-lg px-4 py-3 shadow-xl">
                    {payload.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-[13px]">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-text-secondary">{p.name}:</span>
                        <span className="text-text-primary font-mono">${p.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#8B95A5' }} />
              <Bar dataKey="spend" name="Spend" fill="#0A84FF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue" fill="#0A84FF66" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Platform Performance Table */}
      <motion.div variants={fadeUp} transition={cardTransition} className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle">
          <h3 className="text-[16px] font-semibold text-text-primary">Platform Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-default">
                {['Platform', 'Company', 'Impressions', 'Clicks', 'CTR', 'Spend', 'Revenue', 'ROAS'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-text-secondary uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPlatformData.map((p, i) => {
                const ctrColor = p.ctr >= 2 ? 'text-success' : p.ctr >= 1 ? 'text-warning' : 'text-danger';
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3, ease }}
                    className="border-b border-border-subtle hover:bg-bg-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-text-primary">{p.platform}</td>
                    <td className="px-4 py-3"><CompanyPill companyId={p.company} /></td>
                    <td className="px-4 py-3 text-text-secondary font-mono">{(p.impressions / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-3 text-text-secondary font-mono">{p.clicks.toLocaleString()}</td>
                    <td className={`px-4 py-3 font-mono font-medium ${ctrColor}`}>{p.ctr.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-text-secondary font-mono">${p.spend.toLocaleString()}</td>
                    <td className="px-4 py-3 text-success font-mono">${p.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3"><ROASBadge value={p.roas} /></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Tab: Cross-Sell ─────────────────────────────────────────────────────── */

function CrossSellTab({ leads, activeCompany }: { leads: any[]; activeCompany: string }) {
  // Derive cross-sell opportunities from lead intents
  const crossSellOpportunities = useMemo(() => {
    const opps: any[] = [];

    // Count wedding-related leads for party → harbor cross-sell
    const weddingLeads = leads.filter((l) =>
      l.intent?.toLowerCase().includes('wedding') ||
      l.intent?.toLowerCase().includes('event') ||
      l.intent?.toLowerCase().includes('photo')
    );
    if (weddingLeads.length > 0) {
      opps.push({
        id: 1,
        sourceCompany: 'party',
        targetCompany: 'harbor',
        title: 'Event clients frequently look for venues & homes',
        description: `${weddingLeads.length} event leads also inquired about properties or venues`,
        potentialValue: weddingLeads.reduce((sum, l) => sum + (l.value || 0), 0) || 8400,
        confidence: Math.min(95, 60 + weddingLeads.length * 5),
      });
    }

    // Count crypto leads for xmrt → harbor cross-sell
    const cryptoLeads = leads.filter((l) =>
      l.intent?.toLowerCase().includes('crypto') ||
      l.intent?.toLowerCase().includes('token') ||
      l.intent?.toLowerCase().includes('defi') ||
      l.intent?.toLowerCase().includes('nft') ||
      l.intent?.toLowerCase().includes('blockchain')
    );
    if (cryptoLeads.length > 0) {
      opps.push({
        id: 2,
        sourceCompany: 'xmrt',
        targetCompany: 'harbor',
        title: 'Crypto investors diversifying into real estate',
        description: `${cryptoLeads.length} XMRT leads expressed interest in property investment`,
        potentialValue: cryptoLeads.reduce((sum, l) => sum + (l.value || 0), 0) || 24000,
        confidence: Math.min(95, 55 + cryptoLeads.length * 8),
      });
    }

    // Count property leads for harbor → party cross-sell
    const propertyLeads = leads.filter((l) =>
      l.intent?.toLowerCase().includes('property') ||
      l.intent?.toLowerCase().includes('home') ||
      l.intent?.toLowerCase().includes('condo') ||
      l.intent?.toLowerCase().includes('waterfront')
    );
    if (propertyLeads.length > 0) {
      opps.push({
        id: 3,
        sourceCompany: 'harbor',
        targetCompany: 'party',
        title: 'New homeowners often book housewarming events',
        description: `${propertyLeads.length} property leads also inquired about event services`,
        potentialValue: propertyLeads.reduce((sum, l) => sum + (l.value || 0), 0) || 12600,
        confidence: Math.min(95, 65 + propertyLeads.length * 4),
      });
    }

    return opps;
  }, [leads]);

  // Derive cross-sell leads from lead intents
  const crossSellLeads = useMemo(() => {
    const scored = leads.map((lead) => {
      let matchedService = '';
      let matchScore = 0;
      const intent = lead.intent?.toLowerCase() || '';

      if (intent.includes('wedding') || intent.includes('event')) {
        matchedService = '31 Harbor — Venue & Property';
        matchScore = 74 + (lead.score % 20);
      } else if (intent.includes('crypto') || intent.includes('token') || intent.includes('nft')) {
        matchedService = '31 Harbor — Commercial Properties';
        matchScore = 63 + (lead.score % 25);
      } else if (intent.includes('property') || intent.includes('home')) {
        matchedService = 'Party Favor Photo — Housewarming Event';
        matchScore = 82 + (lead.score % 15);
      } else {
        matchedService = 'XMRT DAO — Tech Consulting';
        matchScore = 55 + (lead.score % 30);
      }

      return {
        id: lead.id,
        name: lead.name,
        sourceCompany: lead.company_routed || 'harbor',
        matchedService,
        matchScore: Math.min(99, matchScore),
        potentialValue: lead.value || Math.round(2000 + Math.random() * 10000),
        suggestedAction: matchScore > 80 ? 'Schedule meeting' : matchScore > 70 ? 'Send offer' : 'Nurture lead',
        status: lead.status === 'Qualified' ? 'Contacted' : lead.status === 'Routed' ? 'New' : 'Converted',
      };
    }).filter((l) => l.matchScore > 55);

    // Sort by match score
    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, 8);
  }, [leads]);

  // Filter by active company
  const filteredOpps = useMemo(() => {
    if (activeCompany === 'all') return crossSellOpportunities;
    return crossSellOpportunities.filter((o) => o.sourceCompany === activeCompany || o.targetCompany === activeCompany);
  }, [crossSellOpportunities, activeCompany]);

  const filteredLeads = useMemo(() => {
    if (activeCompany === 'all') return crossSellLeads;
    return crossSellLeads.filter((l) => l.sourceCompany === activeCompany);
  }, [crossSellLeads, activeCompany]);

  // Lead source pie data
  const leadSourceData = useMemo(() => {
    const sources: Record<string, number> = { Organic: 0, Paid: 0, Referral: 0, Scraped: 0, Manual: 0 };
    leads.forEach((l) => {
      const s = (l.source || 'Organic') as string;
      if (sources[s] !== undefined) sources[s]++;
      else sources.Scraped++;
    });
    const colors: Record<string, string> = { Organic: '#22C55E', Paid: '#0A84FF', Referral: '#F5A623', Scraped: '#7B61FF', Manual: '#8B95A5' };
    return Object.entries(sources)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, color: colors[name] || '#8B95A5' }));
  }, [leads]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* AI Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredOpps.map((opp, i) => {
          const source = companyMap[opp.sourceCompany];
          return (
            <motion.div
              key={opp.id}
              variants={fadeUp}
              transition={{ delay: i * 0.08, duration: 0.4, ease }}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default hover:shadow-lg transition-all duration-200"
              style={{ borderLeftWidth: '3px', borderLeftColor: source?.color || '#8B95A5' }}
            >
              {/* Header: Source → Target */}
              <div className="flex items-center gap-2 mb-3">
                <CompanyPill companyId={opp.sourceCompany} />
                <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
                <CompanyPill companyId={opp.targetCompany} />
              </div>
              {/* Title */}
              <h4 className="text-[14px] font-semibold text-text-primary mb-1.5">{opp.title}</h4>
              <p className="text-[12px] text-text-secondary mb-4">{opp.description}</p>
              {/* Metrics */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] text-text-tertiary uppercase tracking-wider">Potential Value</div>
                  <div className="text-[22px] font-bold text-success font-tabular">{formatCurrency(opp.potentialValue)}</div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-success/15 text-success">
                  {opp.confidence}% match
                </span>
              </div>
              {/* Action */}
              <button className="w-full py-2 rounded-md bg-xmrt-purple/20 text-xmrt-purple text-[13px] font-semibold hover:bg-xmrt-purple/30 transition-colors">
                Create Campaign
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Lead Source Donut + Cross-Sell Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lead Source Donut */}
        <motion.div variants={fadeUp} transition={cardTransition} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
          <h3 className="text-[16px] font-semibold text-text-primary mb-4">Cross-Sell Leads by Source</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="#0F1419" strokeWidth={2} dataKey="value">
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
                      <span className="text-text-primary font-mono">{p.value}</span>
                    </div>
                  );
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {leadSourceData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-text-secondary">{s.name}</span>
                </div>
                <span className="text-text-primary font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cross-Sell Opportunity Table */}
        <motion.div variants={fadeUp} transition={cardTransition} className="lg:col-span-2 bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border-subtle">
            <h3 className="text-[16px] font-semibold text-text-primary">Cross-Sell Opportunities</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-default">
                  {['Lead', 'Matched Service', 'Match Score', 'Potential Value', 'Suggested Action', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] text-text-secondary uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3, ease }}
                    className="border-b border-border-subtle hover:bg-bg-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{lead.name}</div>
                      <div className="mt-1"><CompanyPill companyId={lead.sourceCompany} /></div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{lead.matchedService}</td>
                    <td className="px-4 py-3"><MatchBar score={lead.matchScore} /></td>
                    <td className="px-4 py-3 text-text-primary font-mono font-semibold">${lead.potentialValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-text-secondary text-[12px]">{lead.suggestedAction}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 rounded-md bg-xmrt-purple/20 text-xmrt-purple text-[11px] font-semibold hover:bg-xmrt-purple/30 transition-colors">
                        Reach Out
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Main Marketing Page ─────────────────────────────────────────────────── */

export default function Marketing() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const store = useDashboardStore();
  const { activeCompany, leads, campaigns } = store;

  // Get real campaign data filtered by active company
  const campaignData = useMemo(() => {
    const co = activeCompany === 'all' ? undefined : activeCompany;
    return store.getCampaigns(co);
  }, [store, activeCompany, campaigns]);

  // Get real revenue data
  const revenueData = useMemo(() => {
    return store.getRevenueData();
  }, [store]);

  // Get filtered leads for content queue and cross-sell
  const filteredLeads = useMemo(() => {
    if (activeCompany === 'all') return leads;
    return leads.filter((l) => l.company_routed === activeCompany);
  }, [leads, activeCompany]);

  // KPI metrics derived from real data
  const kpiData = useMemo(() => {
    const activeCampaigns = campaignData.filter((c) => c.status === 'Active').length;
    const totalSpend = campaignData.reduce((sum, c) => sum + c.spend, 0);
    const totalRevenue = campaignData.reduce((sum, c) => sum + c.revenue, 0);
    const avgROI = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const crossSellValue = filteredLeads.reduce((sum, l) => sum + (l.value || 0) * 0.3, 0); // estimate 30% cross-sell potential

    return [
      { label: 'Active Campaigns', value: String(activeCampaigns), change: `${campaignData.length} total`, color: '#7B61FF', positive: true },
      { label: 'Content Pieces', value: String(filteredLeads.length * 3), change: `${filteredLeads.length} lead-based`, color: '#0EA5E9', positive: true },
      { label: 'Avg ROI', value: `${avgROI.toFixed(1)}x`, change: totalSpend > 0 ? `${formatCurrency(totalRevenue)} revenue` : 'No spend', color: '#22C55E', positive: avgROI >= 1 },
      { label: 'Cross-Sell Revenue', value: formatCurrency(crossSellValue), change: 'Est. potential', color: '#F5A623', positive: true },
    ];
  }, [campaignData, filteredLeads]);

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'content', label: 'Content Queue', icon: Sparkles },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'crosssell', label: 'Cross-Sell', icon: GitMerge },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-xmrt-purple" />
              <h1 className="text-[28px] font-bold text-text-primary tracking-tight">Marketing &mdash; AMA</h1>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-xmrt-purple/15 text-xmrt-purple uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-xmrt-purple animate-pulse-dot" />
              AMA ACTIVE
            </span>
          </div>
          <p className="text-[14px] text-text-secondary">Cross-business marketing orchestration &middot; AMA v1.3</p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {kpiData.map((kpi) => (
            <motion.div
              key={kpi.label}
              variants={fadeUp}
              transition={cardTransition}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-all duration-200"
              style={{ borderTopWidth: '3px', borderTopColor: kpi.color }}
            >
              <div className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5">{kpi.label}</div>
              <div className="text-[28px] font-extrabold text-text-primary font-tabular leading-tight">{kpi.value}</div>
              <div className={`text-[12px] mt-1.5 font-medium ${kpi.positive ? 'text-success' : 'text-danger'}`}>{kpi.change}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }} className="border-b border-border-default">
          <div className="flex gap-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-[14px] font-medium transition-all duration-150 border-b-2 ${
                    isActive
                      ? 'text-text-primary border-xmrt-purple'
                      : 'text-text-secondary border-transparent hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease }}
          >
            {activeTab === 'campaigns' && <CampaignsTab campaigns={campaignData} activeCompany={activeCompany} />}
            {activeTab === 'content' && <ContentQueueTab leads={filteredLeads} activeCompany={activeCompany} />}
            {activeTab === 'performance' && <PerformanceTab campaigns={campaignData} revenueData={revenueData} activeCompany={activeCompany} />}
            {activeTab === 'crosssell' && <CrossSellTab leads={filteredLeads} activeCompany={activeCompany} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}
