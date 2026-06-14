import { useState } from 'react';
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

/* ─── Animation Constants ─────────────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const staggerContainer80 = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const cardTransition = { duration: 0.4, ease };

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const tabs = [
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'content', label: 'Content Queue', icon: Sparkles },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'crosssell', label: 'Cross-Sell', icon: GitMerge },
];

const companyMap: Record<string, { name: string; color: string }> = {
  harbor: { name: '31 Harbor', color: '#0A84FF' },
  party: { name: 'Party Favor Photo', color: '#F5A623' },
  xmrt: { name: 'XMRT DAO', color: '#7B61FF' },
};

interface Campaign {
  id: string;
  name: string;
  companyId: string;
  status: 'Active' | 'Paused' | 'Pending';
  spend: number;
  revenue: number;
  roas: number;
  budgetUsed: number;
  platforms: string[];
  description: string;
}

const campaigns: Campaign[] = [
  { id: '1', name: 'Wedding Season Boost 2024', companyId: 'party', status: 'Active', spend: 4200, revenue: 17200, roas: 4.1, budgetUsed: 67, platforms: ['Instagram', 'Facebook'], description: 'Targeted Instagram and Facebook campaign for Q2 wedding bookings' },
  { id: '2', name: 'Waterfront Property Showcase', companyId: 'harbor', status: 'Active', spend: 8500, revenue: 31200, roas: 3.7, budgetUsed: 82, platforms: ['Google Ads', 'Zillow'], description: 'Showcase premium waterfront listings to high-intent buyers' },
  { id: '3', name: 'Token Launch Awareness', companyId: 'xmrt', status: 'Paused', spend: 12000, revenue: 8400, roas: 0.7, budgetUsed: 95, platforms: ['Twitter', 'Discord', 'Reddit'], description: 'Awareness campaign for XMRT token launch event' },
  { id: '4', name: 'First-Time Buyer Guide', companyId: 'harbor', status: 'Active', spend: 2100, revenue: 9800, roas: 4.7, budgetUsed: 42, platforms: ['Google Ads', 'Facebook'], description: 'Educational content campaign for first-time homebuyers' },
  { id: '5', name: 'Corporate Event Package', companyId: 'party', status: 'Pending', spend: 0, revenue: 0, roas: 0, budgetUsed: 0, platforms: ['LinkedIn', 'Instagram'], description: 'B2B corporate event photography package promotion' },
  { id: '6', name: 'Developer Partnership Program', companyId: 'xmrt', status: 'Active', spend: 6300, revenue: 18900, roas: 3.0, budgetUsed: 55, platforms: ['Twitter', 'GitHub', 'Medium'], description: 'Recruit developer partners for XMRT ecosystem' },
];

const roiTrendData = [
  { week: 'W1', harbor: 2.1, party: 1.8, xmrt: 1.2 },
  { week: 'W2', harbor: 2.4, party: 2.2, xmrt: 1.5 },
  { week: 'W3', harbor: 2.8, party: 2.5, xmrt: 1.8 },
  { week: 'W4', harbor: 3.1, party: 2.9, xmrt: 2.1 },
  { week: 'W5', harbor: 2.9, party: 3.2, xmrt: 1.9 },
  { week: 'W6', harbor: 3.3, party: 3.5, xmrt: 2.3 },
  { week: 'W7', harbor: 3.5, party: 3.1, xmrt: 2.6 },
  { week: 'W8', harbor: 3.7, party: 3.8, xmrt: 2.9 },
  { week: 'W9', harbor: 4.0, party: 3.6, xmrt: 3.2 },
  { week: 'W10', harbor: 3.8, party: 4.1, xmrt: 3.0 },
  { week: 'W11', harbor: 4.2, party: 3.9, xmrt: 3.4 },
  { week: 'W12', harbor: 4.5, party: 4.3, xmrt: 3.7 },
];

const spendRevenueData = [
  { company: '31 Harbor', spend: 14800, revenue: 41000 },
  { company: 'Party Favor', spend: 9100, revenue: 36400 },
  { company: 'XMRT DAO', spend: 21300, revenue: 35700 },
];

const platformPerformance = [
  { platform: 'Instagram', company: 'party', impressions: 142300, clicks: 4200, ctr: 2.95, spend: 3200, revenue: 12800, roas: 4.0 },
  { platform: 'Facebook', company: 'harbor', impressions: 98500, clicks: 2100, ctr: 2.13, spend: 4800, revenue: 16800, roas: 3.5 },
  { platform: 'Google Ads', company: 'harbor', impressions: 76200, clicks: 1850, ctr: 2.43, spend: 5300, revenue: 21200, roas: 4.0 },
  { platform: 'Twitter', company: 'xmrt', impressions: 45000, clicks: 1200, ctr: 2.67, spend: 4200, revenue: 10500, roas: 2.5 },
  { platform: 'LinkedIn', company: 'party', impressions: 28000, clicks: 560, ctr: 2.0, spend: 1500, revenue: 5400, roas: 3.6 },
  { platform: 'Discord', company: 'xmrt', impressions: 15000, clicks: 380, ctr: 2.53, spend: 2100, revenue: 6300, roas: 3.0 },
];

interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'video' | 'social';
  companyId: string;
  stage: 'Ideation' | 'Drafting' | 'Review' | 'Scheduled' | 'Published';
  platform: string;
  score: number;
  created: string;
  assigned: string;
}

const contentQueue: ContentItem[] = [
  { id: 'CT-001', title: '5 Beachfront Properties Under $500K', type: 'social', companyId: 'harbor', stage: 'Drafting', platform: 'Instagram', score: 87, created: '10m ago', assigned: 'AI Generated' },
  { id: 'CT-002', title: 'Behind the Scenes: Wedding Setup', type: 'video', companyId: 'party', stage: 'Review', platform: 'TikTok', score: 92, created: '1h ago', assigned: 'Sarah K.' },
  { id: 'CT-003', title: 'DeFi Yield Farming Explained', type: 'blog', companyId: 'xmrt', stage: 'Ideation', platform: 'Twitter', score: 76, created: '2h ago', assigned: 'AI Generated' },
  { id: 'CT-004', title: 'Just Listed: Harbor View Condo', type: 'social', companyId: 'harbor', stage: 'Scheduled', platform: 'Facebook', score: 94, created: '3h ago', assigned: 'AI Generated' },
  { id: 'CT-005', title: 'Photo Booth Magic: Before & After', type: 'video', companyId: 'party', stage: 'Published', platform: 'Instagram', score: 89, created: '1d ago', assigned: 'AI Generated' },
  { id: 'CT-006', title: 'XMRT Roadmap Q3 2024', type: 'blog', companyId: 'xmrt', stage: 'Review', platform: 'Medium', score: 81, created: '5h ago', assigned: 'Marcus T.' },
  { id: 'CT-007', title: 'First-Time Buyer Checklist', type: 'blog', companyId: 'harbor', stage: 'Drafting', platform: 'Blog', score: 85, created: '6h ago', assigned: 'AI Generated' },
  { id: 'CT-008', title: 'Corporate Event Highlights', type: 'social', companyId: 'party', stage: 'Ideation', platform: 'LinkedIn', score: 72, created: '8h ago', assigned: 'AI Generated' },
];

const pipelineStages = [
  { name: 'Ideation', icon: Lightbulb, color: '#F5A623', count: 8 },
  { name: 'Drafting', icon: PenTool, color: '#0EA5E9', count: 5 },
  { name: 'Review', icon: Eye, color: '#F59E0B', count: 3 },
  { name: 'Scheduled', icon: Calendar, color: '#7B61FF', count: 12 },
  { name: 'Published', icon: CheckCircle, color: '#22C55E', count: 47 },
];

const crossSellOpportunities = [
  { id: 1, sourceCompany: 'harbor', targetCompany: 'party', title: 'New homeowners often book housewarming events', description: '3 recent 31 Harbor leads also inquired about event photography', potentialValue: 8400, confidence: 87 },
  { id: 2, sourceCompany: 'party', targetCompany: 'harbor', title: 'Wedding clients frequently look for first homes', description: '5 wedding photography clients started property searches', potentialValue: 12600, confidence: 74 },
  { id: 3, sourceCompany: 'xmrt', targetCompany: 'harbor', title: 'Crypto investors diversifying into real estate', description: '4 XMRT DAO members expressed interest in property investment', potentialValue: 24000, confidence: 63 },
];

const crossSellLeads = [
  { id: 1, name: 'Sarah Mitchell', sourceCompany: 'harbor', matchedService: 'Party Favor Photo — Wedding Photography', matchScore: 87, potentialValue: 4200, suggestedAction: 'Send photo booth offer', status: 'New' },
  { id: 2, name: 'James & Linda Chen', sourceCompany: 'party', matchedService: '31 Harbor — First-Time Buyer Guide', matchScore: 74, potentialValue: 3800, suggestedAction: 'Share property listings', status: 'Contacted' },
  { id: 3, name: 'CryptoVentures LLC', sourceCompany: 'xmrt', matchedService: '31 Harbor — Commercial Properties', matchScore: 63, potentialValue: 15000, suggestedAction: 'Schedule property tour', status: 'New' },
  { id: 4, name: "Emily's Wedding Planning", sourceCompany: 'party', matchedService: '31 Harbor — Waterfront Venue', matchScore: 71, potentialValue: 5200, suggestedAction: 'Recommend venue partners', status: 'Converted' },
  { id: 5, name: 'Marina Residences', sourceCompany: 'harbor', matchedService: 'Party Favor Photo — Corporate Event', matchScore: 82, potentialValue: 6800, suggestedAction: 'Offer event package', status: 'New' },
];

const leadSourceData = [
  { name: 'Organic', value: 474, color: '#22C55E' },
  { name: 'Paid', value: 362, color: '#0A84FF' },
  { name: 'Referral', value: 224, color: '#F5A623' },
  { name: 'Scraped', value: 125, color: '#7B61FF' },
  { name: 'Manual', value: 62, color: '#8B95A5' },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-success/15 text-success',
    Paused: 'bg-warning/15 text-warning',
    Pending: 'bg-info/15 text-info',
    Draft: 'bg-bg-hover text-text-secondary',
    New: 'bg-info/15 text-info',
    Contacted: 'bg-warning/15 text-warning',
    Converted: 'bg-success/15 text-success',
    Declined: 'bg-danger/15 text-danger',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${styles[status] || 'bg-bg-hover text-text-secondary'}`}>
      {status}
    </span>
  );
}

function CompanyPill({ companyId }: { companyId: string }) {
  const c = companyMap[companyId];
  if (!c) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ backgroundColor: `${c.color}15`, color: c.color }}>
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
      {c.name}
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

/* ─── Tab: Campaigns ──────────────────────────────────────────────────────── */

function CampaignsTab() {
  const [activeCards, setActiveCards] = useState<Record<string, boolean>>({});

  const toggleStatus = (id: string) => {
    setActiveCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <motion.div variants={staggerContainer80} initial="hidden" animate="visible" className="space-y-6">
      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {companyFilteredCampaigns.map((c) => {
          const comp = companyMap[c.companyId];
          const isPaused = activeCards[c.id] || c.status === 'Paused';
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
                  <CompanyPill companyId={c.companyId} />
                  <StatusBadge status={isPaused ? 'Paused' : c.status} />
                </div>
                {/* Name */}
                <h3 className="text-[16px] font-bold text-text-primary mb-1.5 leading-tight">{c.name}</h3>
                <p className="text-[12px] text-text-secondary line-clamp-2 mb-4">{c.description}</p>
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider mb-0.5">Spend</div>
                    <div className="text-[15px] font-semibold text-text-primary font-tabular">${c.spend.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider mb-0.5">Revenue</div>
                    <div className="text-[15px] font-semibold text-text-primary font-tabular">${c.revenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider mb-0.5">ROAS</div>
                    <div className="text-[15px] font-bold font-tabular"><ROASBadge value={c.roas} /></div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-tertiary">Budget used</span>
                    <span className="text-text-secondary font-mono">{c.budgetUsed}%</span>
                  </div>
                  <div className="w-full h-1 bg-bg-hover rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${c.budgetUsed}%`, backgroundColor: comp.color }} />
                  </div>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                  <div className="flex items-center gap-2">
                    {c.platforms.map((p) => (
                      <span key={p} className="text-[10px] text-text-tertiary bg-bg-hover px-1.5 py-0.5 rounded">{p}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleStatus(c.id)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors" title={isPaused ? 'Resume' : 'Pause'}>
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
              {companyFilteredCampaigns.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.3, ease }}
                  className="border-b border-border-subtle hover:bg-bg-hover/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-text-primary">{c.name}</div>
                    <div className="mt-1"><CompanyPill companyId={c.companyId} /></div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.platforms.map((p) => (
                        <span key={p} className="text-[10px] text-text-tertiary bg-bg-hover px-1.5 py-0.5 rounded">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary font-mono">{c.budgetUsed}%</td>
                  <td className="px-4 py-3 text-text-secondary font-mono">${c.spend.toLocaleString()}</td>
                  <td className="px-4 py-3 text-success font-mono">${c.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3"><ROASBadge value={c.roas} /></td>
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
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Tab: Content Queue ──────────────────────────────────────────────────── */

function ContentQueueTab() {
  const [filterStage, setFilterStage] = useState('All');
  const stages = ['All', 'Ideation', 'Drafting', 'Review', 'Scheduled', 'Published'];
  const filtered = filterStage === 'All' ? contentQueue : contentQueue.filter((c) => c.stage === filterStage);

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
          {pipelineStages.map((stage, idx) => {
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
                  {idx < pipelineStages.length - 1 && (
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
              {filtered.map((item, i) => (
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

function PerformanceTab() {
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
              {platformPerformance.map((p, i) => {
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

function CrossSellTab() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* AI Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {crossSellOpportunities.map((opp, i) => {
          const source = companyMap[opp.sourceCompany];
          return (
            <motion.div
              key={opp.id}
              variants={fadeUp}
              transition={{ delay: i * 0.08, duration: 0.4, ease }}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default hover:shadow-lg transition-all duration-200"
              style={{ borderLeftWidth: '3px', borderLeftColor: source.color }}
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
                  <div className="text-[22px] font-bold text-success font-tabular">${opp.potentialValue.toLocaleString()}</div>
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
                {crossSellLeads.map((lead, i) => (
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
  const { activeCompany } = useDashboardStore();
  const isLocked = activeCompany !== 'all';
  const companyFilteredCampaigns = isLocked ? campaigns.filter((c) => c.companyId === activeCompany) : campaigns;
  const companyFilteredQueue = isLocked ? contentQueue.filter((q) => q.companyId === activeCompany) : contentQueue;
  const companyFilteredPerformance = isLocked ? performanceData.filter((p) => p.companyId === activeCompany) : performanceData;
  const companyFilteredCrossSell = isLocked ? crossSellOpps.filter((o) => o.sourceCompany === activeCompany || o.targetCompany === activeCompany) : crossSellOpps;
  const [activeTab, setActiveTab] = useState('campaigns');

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
          {[
            { label: 'Active Campaigns', value: '6', change: '+2 this month', color: '#7B61FF', positive: true },
            { label: 'Content Pieces', value: '75', change: '12 in queue', color: '#0EA5E9', positive: true },
            { label: 'Avg ROI', value: '3.2x', change: '+0.4 vs last month', color: '#22C55E', positive: true },
            { label: 'Cross-Sell Revenue', value: '$45.3K', change: '+18.2% growth', color: '#F5A623', positive: true },
          ].map((kpi) => (
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
            {activeTab === 'campaigns' && <CampaignsTab />}
            {activeTab === 'content' && <ContentQueueTab />}
            {activeTab === 'performance' && <PerformanceTab />}
            {activeTab === 'crosssell' && <CrossSellTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}
