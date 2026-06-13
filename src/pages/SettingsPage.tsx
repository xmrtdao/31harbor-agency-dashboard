import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Bot,
  Plug,
  Users,
  Bell,
  Palette,
  Save,
  UserPlus,
  Pencil,
  GitBranch,
  Workflow,
  Sparkles,
  Check,
  X,
  Trash2,
  Globe,
  Mail,
  Key,
  TestTubes,
  Shield,
  ArrowRight,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useDashboardStore } from '@/store/dashboardStore';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


// ─── Animation Config ───────────────────────────────────────────────────────

const easeSmooth = [0.16, 1, 0.3, 1] as [number, number, number, number];

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeSmooth } },
};

const tabContentVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeSmooth } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// ─── Nav Items ──────────────────────────────────────────────────────────────

const navItems = [
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'users', label: 'User Access', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

// ─── Company Data ───────────────────────────────────────────────────────────

const companyData = [
  {
    id: 'harbor',
    name: '31 Harbor',
    industry: 'Real Estate \u00B7 Property Management',
    leads: 142,
    abbreviation: '31H',
    color: '#0A84FF',
    colorDim: 'rgba(10,132,255,0.2)',
    displayName: '31 Harbor',
    industrySelect: 'Real Estate',
    autoRouting: true,
    scoreThreshold: 50,
    email: 'leads@31harbor.com',
    webhook: '',
    domain: '31harbor.com',
    apiKey: 'ak_harbor_xxxxxxxxxxxx',
    dnsVerified: true,
    webhookCount: 3,
  },
  {
    id: 'party',
    name: 'Party Favor Photo',
    industry: 'Events \u00B7 Photo Booth \u00B7 Wedding Services',
    leads: 98,
    abbreviation: 'PFP',
    color: '#F5A623',
    colorDim: 'rgba(245,166,35,0.2)',
    displayName: 'Party Favor Photo',
    industrySelect: 'Events',
    autoRouting: true,
    scoreThreshold: 45,
    email: 'bookings@partyfavorphoto.com',
    webhook: '',
    domain: 'partyfavorphoto.com',
    apiKey: 'ak_party_xxxxxxxxxxxx',
    dnsVerified: true,
    webhookCount: 2,
  },
  {
    id: 'xmrt',
    name: 'XMRT DAO',
    industry: 'Tech \u00B7 Crypto \u00B7 Blockchain \u00B7 DAO',
    leads: 67,
    abbreviation: 'XMRT',
    color: '#7B61FF',
    colorDim: 'rgba(123,97,255,0.2)',
    displayName: 'XMRT DAO',
    industrySelect: 'Technology',
    autoRouting: true,
    scoreThreshold: 55,
    email: 'contact@xmrt.dao',
    webhook: '',
    domain: 'xmrt.dao',
    apiKey: 'ak_xmrt_xxxxxxxxxxxx',
    dnsVerified: false,
    webhookCount: 1,
  },
];

// ─── Agent Data ─────────────────────────────────────────────────────────────

const agentData = [
  {
    id: 'cblr',
    name: 'Cross-Business Lead Router',
    version: 'v2.4.1',
    icon: GitBranch,
    color: '#0EA5E9',
    status: 'ACTIVE' as const,
    confidence: 85,
    fallback: 'Flag for review',
    autoRetrain: true,
    trainingSamples: 1247,
    lastTrained: '2 days ago',
    rateLimit: 120,
    enabled: true,
  },
  {
    id: 'abba',
    name: 'Autonomous Business Agent',
    version: 'v1.8.2',
    icon: Workflow,
    color: '#22C55E',
    status: 'ACTIVE' as const,
    autoAdvance: true,
    approvalGates: {
      quote: true,
      contract: true,
      payment: false,
      schedule: true,
    },
    stageTimeout: 24,
    quoteMode: 'AI-generated',
    maxConcurrency: 50,
    notifyOnComplete: true,
    enabled: true,
  },
  {
    id: 'ama',
    name: 'Autonomous Marketing Agency',
    version: 'v1.3.0',
    icon: Sparkles,
    color: '#7B61FF',
    status: 'ACTIVE' as const,
    contentGeneration: true,
    contentTypes: {
      social: true,
      blog: true,
      adCopy: true,
      video: false,
      email: true,
    },
    reviewRequired: true,
    postFrequency: 5,
    crossSell: true,
    matchScore: 70,
    enabled: true,
  },
];

// ─── Integration Data ───────────────────────────────────────────────────────

const integrationData = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database & backend services',
    status: 'connected' as const,
    color: '#3ECF8E',
    account: 'agenticos-db',
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Email delivery service',
    status: 'connected' as const,
    color: '#111111',
    account: 'alex@agenticos.com',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing',
    status: 'connected' as const,
    color: '#635BFF',
    account: 'acct_1Oxxxxxxxxx',
  },
  {
    id: 'muapi',
    name: 'MUAPI',
    description: 'Multi-user API gateway',
    status: 'error' as const,
    color: '#F59E0B',
    account: 'Connection failed',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Source code & CI/CD',
    status: 'connected' as const,
    color: '#6E5494',
    account: 'agenticos-org',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'CDN & edge compute',
    status: 'connected' as const,
    color: '#F48120',
    account: 'agenticos.dev',
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    description: 'ML model inference API',
    status: 'disconnected' as const,
    color: '#FFD21E',
    account: 'Not connected',
  },
  {
    id: 'solana',
    name: 'Solana',
    description: 'Blockchain payments',
    status: 'connected' as const,
    color: '#9945FF',
    account: '7x8G...p2K4',
  },
];

// ─── User Data ──────────────────────────────────────────────────────────────

const userData = [
  {
    id: 'U-001',
    name: 'Alex Morgan',
    email: 'alex@agenticos.com',
    role: 'OWNER' as const,
    companies: ['harbor', 'party', 'xmrt'],
    lastActive: '2m ago',
    status: 'ACTIVE' as const,
  },
  {
    id: 'U-002',
    name: 'Jordan Lee',
    email: 'jordan@agenticos.com',
    role: 'ADMIN' as const,
    companies: ['harbor', 'party'],
    lastActive: '1h ago',
    status: 'ACTIVE' as const,
  },
  {
    id: 'U-003',
    name: 'Casey Smith',
    email: 'casey@agenticos.com',
    role: 'MANAGER' as const,
    companies: ['xmrt'],
    lastActive: '3h ago',
    status: 'ACTIVE' as const,
  },
  {
    id: 'U-004',
    name: 'Taylor Reed',
    email: 'taylor@agenticos.com',
    role: 'VIEWER' as const,
    companies: ['harbor', 'party', 'xmrt'],
    lastActive: '1d ago',
    status: 'INACTIVE' as const,
  },
  {
    id: 'U-005',
    name: 'Riley Park',
    email: 'riley@agenticos.com',
    role: 'ADMIN' as const,
    companies: ['xmrt', 'harbor'],
    lastActive: '5h ago',
    status: 'ACTIVE' as const,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'OWNER': return 'bg-xmrt-purple/20 text-xmrt-purple border-xmrt-purple/30';
    case 'ADMIN': return 'bg-harbor-blue/20 text-harbor-blue border-harbor-blue/30';
    case 'MANAGER': return 'bg-party-amber/20 text-party-amber border-party-amber/30';
    case 'VIEWER': return 'bg-bg-hover text-text-secondary border-border-default';
    default: return 'bg-bg-hover text-text-secondary';
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'ACTIVE': return 'bg-success/15 text-success border-success/30';
    case 'INACTIVE': return 'bg-bg-hover text-text-secondary border-border-default';
    case 'INVITED': return 'bg-info/15 text-info border-info/30';
    default: return 'bg-bg-hover text-text-secondary';
  }
}

function getCompanyColor(id: string) {
  switch (id) {
    case 'harbor': return '#0A84FF';
    case 'party': return '#F5A623';
    case 'xmrt': return '#7B61FF';
    default: return '#8B95A5';
  }
}

function getIntegrationStatusColor(status: string) {
  switch (status) {
    case 'connected': return 'text-success';
    case 'error': return 'text-danger';
    case 'disconnected': return 'text-text-tertiary';
    default: return 'text-text-tertiary';
  }
}

function getIntegrationStatusBg(status: string) {
  switch (status) {
    case 'connected': return 'bg-success';
    case 'error': return 'bg-danger';
    case 'disconnected': return 'bg-text-tertiary';
    default: return 'bg-text-tertiary';
  }
}

function getIntegrationBorderColor(status: string) {
  switch (status) {
    case 'connected': return 'border-l-success';
    case 'error': return 'border-l-danger';
    case 'disconnected': return 'border-l-text-tertiary';
    default: return 'border-l-text-tertiary';
  }
}

// ─── Section: Companies ─────────────────────────────────────────────────────

function CompaniesSection() {
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('suiteai-company-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return companyData.map((c) => ({ ...c, ...parsed[c.id] }));
      } catch { /* fall through */ }
    }
    return companyData;
  });

  const updateCompany = (id: string, field: string, value: unknown) => {
    setCompanies((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, [field]: value } : c));
      const toSave: Record<string, Record<string, unknown>> = {};
      next.forEach((c) => {
        toSave[c.id] = {
          displayName: c.displayName,
          industrySelect: c.industrySelect,
          color: c.color,
          scoreThreshold: c.scoreThreshold,
          email: c.email,
          domain: c.domain,
          webhook: c.webhook,
          autoRouting: c.autoRouting,
        };
      });
      localStorage.setItem('suiteai-company-settings', JSON.stringify(toSave));
      return next;
    });
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      {/* Section Header */}
      <motion.div variants={staggerItem} className="mb-6">
        <h2 className="text-[18px] font-bold text-text-primary">Company Profiles</h2>
        <p className="text-[12px] text-text-secondary mt-1">Manage your business configurations</p>
      </motion.div>

      {/* Company Cards */}
      <div className="space-y-4">
        {companies.map((company) => (
          <motion.div
            key={company.id}
            variants={staggerItem}
            className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden"
          >
            {/* Top accent strip */}
            <div className="h-1" style={{ backgroundColor: company.color }} />

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left column - info */}
                <div className="lg:w-[40%] space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: company.color }}
                    />
                    <h3 className="text-[18px] font-bold" style={{ color: company.color }}>
                      {company.name}
                    </h3>
                  </div>

                  <p className="text-[13px] text-text-secondary">{company.industry}</p>
                  <p className="text-[12px] font-mono text-text-tertiary font-tabular">
                    Active leads: {company.leads}
                  </p>

                  {/* Logo placeholder */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: company.colorDim }}
                  >
                    <span className="text-[16px] font-mono font-semibold" style={{ color: company.color }}>
                      {company.abbreviation}
                    </span>
                  </div>
                </div>

                {/* Right column - form */}
                <div className="lg:w-[60%] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-text-secondary">Display name</label>
                      <Input
                        value={company.displayName}
                        onChange={(e) => updateCompany(company.id, 'displayName', e.target.value)}
                        className="h-9 bg-bg-input border-border-default text-text-primary text-[13px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-text-secondary">Industry</label>
                      <select
                        value={company.industrySelect}
                        onChange={(e) => updateCompany(company.id, 'industrySelect', e.target.value)}
                        className="h-9 w-full bg-bg-input border border-border-default rounded-md text-text-primary text-[13px] px-3 outline-none focus:border-border-focus transition-colors"
                      >
                        <option>Real Estate</option>
                        <option>Property Management</option>
                        <option>Brokerage</option>
                        <option>Events</option>
                        <option>Technology</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-text-secondary">Primary color</label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border border-border-default shrink-0"
                          style={{ backgroundColor: company.color }}
                        />
                        <Input
                          value={company.color}
                          onChange={(e) => updateCompany(company.id, 'color', e.target.value)}
                          className="h-9 bg-bg-input border-border-default text-text-primary text-[13px] font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-text-secondary">Lead score threshold</label>
                      <Input
                        type="number"
                        value={company.scoreThreshold}
                        onChange={(e) => updateCompany(company.id, 'scoreThreshold', Number(e.target.value))}
                        className="h-9 bg-bg-input border-border-default text-text-primary text-[13px]"
                      />
                      <p className="text-[11px] text-text-tertiary">Minimum score to route</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-text-secondary flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> Notification email
                      </label>
                      <Input
                        value={company.email}
                        onChange={(e) => updateCompany(company.id, 'email', e.target.value)}
                        className="h-9 bg-bg-input border-border-default text-text-primary text-[13px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-text-secondary">Domain</label>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                        <Input
                          value={company.domain}
                          onChange={(e) => updateCompany(company.id, 'domain', e.target.value)}
                          className="h-9 bg-bg-input border-border-default text-text-primary text-[13px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[12px] font-medium text-text-secondary flex items-center gap-1.5">
                        <Key className="w-3 h-3" /> API Key
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={company.apiKey}
                          readOnly
                          className="h-9 bg-bg-input border-border-default text-text-primary text-[13px] font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-2 text-text-secondary hover:text-text-primary"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[12px] font-medium text-text-secondary">Webhook URL</label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="https://..."
                          value={company.webhook}
                          onChange={(e) => updateCompany(company.id, 'webhook', e.target.value)}
                          className="h-9 bg-bg-input border-border-default text-text-primary text-[13px]"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-9 px-3 text-[12px]"
                        >
                          <TestTubes className="w-3.5 h-3.5 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status row */}
                  <div className="flex items-center flex-wrap gap-4 pt-2 border-t border-border-subtle">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={company.autoRouting}
                        onCheckedChange={(v) => updateCompany(company.id, 'autoRouting', v)}
                      />
                      <span className="text-[13px] text-text-primary">Auto-routing enabled</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {company.dnsVerified ? (
                        <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-[11px]">
                          <Check className="w-3 h-3 mr-1" /> DNS Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30 text-[11px]">
                          <X className="w-3 h-3 mr-1" /> DNS Pending
                        </Badge>
                      )}
                    </div>

                    <span className="text-[12px] font-mono text-text-tertiary">
                      {company.webhookCount} webhook{company.webhookCount !== 1 ? 's' : ''}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[12px] text-text-secondary hover:text-text-primary ml-auto"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Lead Sharing Matrix ────────────────────────────────────────── */}
      <LeadSharingMatrix />
    </motion.div>
  );
}

// ─── Lead Sharing Matrix ────────────────────────────────────────────────────

const companyMatrix = [
  { id: 'harbor', name: '31 Harbor', color: '#0A84FF' },
  { id: 'party', name: 'Party Favor', color: '#F5A623' },
  { id: 'xmrt', name: 'XMRT DAO', color: '#7B61FF' },
];

function LeadSharingMatrix() {
  const store = useDashboardStore();
  const [rules, setRules] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    store.sharingRules.forEach((r) => {
      initial[`${r.from_company}-${r.to_company}`] = r.allowed;
    });
    return initial;
  });

  const isAllowed = (from: string, to: string) => {
    if (from === to) return true;
    const key = `${from}-${to}`;
    const val = rules[key];
    // Default to allowed (1) if not explicitly set
    return val !== undefined ? val === 1 : store.canShareLead(from, to);
  };

  const toggleRule = (from: string, to: string) => {
    if (from === to) return;
    const nextAllowed = !isAllowed(from, to);
    store.setSharingRule(from, to, nextAllowed);
    setRules((prev) => ({
      ...prev,
      [`${from}-${to}`]: nextAllowed ? 1 : 0,
    }));
  };

  return (
    <motion.div
      variants={staggerItem}
      className="mt-8 bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden"
    >
      {/* Top accent strip */}
      <div className="h-1" style={{ backgroundColor: '#22C55E' }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-success/15">
            <Shield className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-text-primary">Lead Sharing Matrix</h3>
            <p className="text-[12px] text-text-secondary">
              Control which companies can receive leads from each other
            </p>
          </div>
        </div>

        {/* Explanatory text */}
        <p className="text-[12px] text-text-tertiary mb-5 ml-12">
          Blocked routes will show a warning in the Lead Router. Self-routing is always enabled.
        </p>

        {/* Matrix Grid */}
        <div className="ml-0 sm:ml-12">
          {/* Header row */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2 mb-3 items-center">
            <div className="flex items-center justify-end pr-2">
              <span className="text-[11px] text-text-tertiary uppercase tracking-wider">FROM \ TO</span>
            </div>
            {companyMatrix.map((to) => (
              <div key={to.id} className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: to.color }} />
                  <span className="text-[12px] font-semibold" style={{ color: to.color }}>
                    {to.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          <div className="space-y-2">
            {companyMatrix.map((from) => (
              <div key={from.id} className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2 items-center">
                {/* Row label */}
                <div className="flex items-center justify-end pr-2 gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: from.color }} />
                  <span className="text-[12px] font-medium text-text-primary">{from.name}</span>
                </div>

                {/* Cells */}
                {companyMatrix.map((to) => {
                  const allowed = isAllowed(from.id, to.id);
                  const isSelf = from.id === to.id;

                  return (
                    <div key={to.id} className="flex items-center justify-center">
                      {isSelf ? (
                        <div
                          className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border-subtle bg-bg-hover"
                          title="Always enabled (self-routing)"
                        >
                          <Check className="w-3.5 h-3.5 text-success" />
                          <span className="text-[11px] text-text-secondary font-medium">Self</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleRule(from.id, to.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-md border transition-all duration-200 cursor-pointer ${
                            allowed
                              ? 'border-success/40 bg-success/10 hover:bg-success/20'
                              : 'border-danger/40 bg-danger/10 hover:bg-danger/20'
                          }`}
                          title={`${from.name} ${allowed ? 'can' : 'cannot'} route to ${to.name}`}
                        >
                          {allowed ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-success" />
                              <span className="text-[11px] text-success font-medium">Allow</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-danger" />
                              <span className="text-[11px] text-danger font-medium">Block</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Arrow indicators */}
          <div className="flex items-center justify-center gap-2 mt-4 text-text-tertiary">
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="text-[11px]">Direction indicates lead flow (FROM source TO destination)</span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-subtle">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-success/40" />
              <span className="text-[11px] text-text-secondary">Allowed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-danger/40" />
              <span className="text-[11px] text-text-secondary">Blocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-bg-hover border border-border-subtle" />
              <span className="text-[11px] text-text-secondary">Self (always on)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section: Agents ────────────────────────────────────────────────────────

function AgentsSection() {
  const [agents, setAgents] = useState(agentData);

  const updateAgent = (id: string, field: string, value: unknown) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      {/* Section Header */}
      <motion.div variants={staggerItem} className="mb-6">
        <h2 className="text-[18px] font-bold text-text-primary">AI Agent Configuration</h2>
        <p className="text-[12px] text-text-secondary mt-1">Tune agent behavior, thresholds, and automation levels</p>
      </motion.div>

      {/* Agent Cards */}
      <div className="space-y-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <motion.div
              key={agent.id}
              variants={staggerItem}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-6"
            >
              {/* Agent Header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${agent.color}22` }}
                >
                  <Icon className="w-5 h-5" style={{ color: agent.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[18px] font-bold text-text-primary">{agent.name}</h3>
                    <Badge
                      variant="outline"
                      className="bg-success/15 text-success border-success/30 text-[11px]"
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="text-[12px] font-mono text-text-tertiary mt-0.5">{agent.version}</p>
                </div>
                <Switch
                  checked={agent.enabled}
                  onCheckedChange={(v) => updateAgent(agent.id, 'enabled', v)}
                />
              </div>

              {/* Agent-specific settings */}
              {agent.id === 'cblr' && (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-4"
                >
                  <motion.div variants={staggerItem} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-medium text-text-primary">Confidence threshold</label>
                      <span className="text-[13px] font-mono text-info">{agent.confidence}%</span>
                    </div>
                    <Slider
                      value={[(agent as typeof agentData[0]).confidence ?? 50]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([v]) => updateAgent(agent.id, 'confidence', v)}
                      className="w-full"
                    />
                    <p className="text-[11px] text-text-tertiary">Minimum confidence to auto-route</p>
                  </motion.div>

                  <motion.div variants={staggerItem} className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Fallback behavior</label>
                    <select
                      value={agent.fallback}
                      onChange={(e) => updateAgent(agent.id, 'fallback', e.target.value)}
                      className="h-9 w-full sm:w-[280px] bg-bg-input border border-border-default rounded-md text-text-primary text-[13px] px-3 outline-none focus:border-border-focus"
                    >
                      <option>Flag for review</option>
                      <option>Route to default company</option>
                      <option>Hold in queue</option>
                    </select>
                  </motion.div>

                  <motion.div variants={staggerItem} className="flex items-center gap-3">
                    <Switch
                      checked={agent.autoRetrain}
                      onCheckedChange={(v) => updateAgent(agent.id, 'autoRetrain', v)}
                    />
                    <div>
                      <span className="text-[13px] text-text-primary">Auto-retrain model</span>
                      <p className="text-[11px] text-text-tertiary">Automatically retrain model weekly</p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} className="flex items-center gap-3 flex-wrap">
                    <span className="text-[13px] text-text-secondary">
                      <span className="font-mono font-tabular">{(agent as typeof agentData[0]).trainingSamples?.toLocaleString()}</span>{' '}
                      samples &middot; Last trained:{" "}
                      <span className="font-mono">{(agent as typeof agentData[0]).lastTrained}</span>
                    </span>
                    <Button variant="secondary" size="sm" className="h-8 text-[12px]">
                      Retrain Now
                    </Button>
                  </motion.div>

                  <motion.div variants={staggerItem} className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">API rate limit</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-text-secondary">Requests per minute:</span>
                      <Input
                        type="number"
                        value={agent.rateLimit}
                        onChange={(e) => updateAgent(agent.id, 'rateLimit', Number(e.target.value))}
                        className="h-8 w-20 bg-bg-input border-border-default text-text-primary text-[13px]"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {agent.id === 'abba' && (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-4"
                >
                  <motion.div variants={staggerItem} className="flex items-center gap-3">
                    <Switch
                      checked={agent.autoAdvance}
                      onCheckedChange={(v) => updateAgent(agent.id, 'autoAdvance', v)}
                    />
                    <div>
                      <span className="text-[13px] text-text-primary">Pipeline auto-advance</span>
                      <p className="text-[11px] text-text-tertiary">Automatically advance leads through pipeline stages</p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} className="space-y-2">
                    <label className="text-[13px] font-medium text-text-primary">Human approval gates</label>
                    {Object.entries((agent as typeof agentData[1]).approvalGates ?? {}).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                        <div className="w-4 h-4 rounded border border-border-default flex items-center justify-center bg-bg-input">
                          {value && <Check className="w-3 h-3 text-success" />}
                        </div>
                        <span className="text-[13px] text-text-secondary capitalize">
                          {key === 'quote' && 'Quote generation (> $5,000)'}
                          {key === 'contract' && 'Contract signing'}
                          {key === 'payment' && 'Payment processing (auto)'}
                          {key === 'schedule' && 'Schedule confirmation'}
                        </span>
                      </label>
                    ))}
                  </motion.div>

                  <motion.div variants={staggerItem} className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Stage timeout (hours)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-text-secondary">Hours before auto-escalate:</span>
                      <Input
                        type="number"
                        value={agent.stageTimeout}
                        onChange={(e) => updateAgent(agent.id, 'stageTimeout', Number(e.target.value))}
                        className="h-8 w-16 bg-bg-input border-border-default text-text-primary text-[13px]"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Quote generation</label>
                    <select
                      value={agent.quoteMode}
                      onChange={(e) => updateAgent(agent.id, 'quoteMode', e.target.value)}
                      className="h-9 w-full sm:w-[280px] bg-bg-input border border-border-default rounded-md text-text-primary text-[13px] px-3 outline-none focus:border-border-focus"
                    >
                      <option>AI-generated</option>
                      <option>Template-based</option>
                      <option>Manual only</option>
                    </select>
                  </motion.div>

                  <motion.div variants={staggerItem} className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Max pipeline concurrency</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-text-secondary">Max active leads:</span>
                      <Input
                        type="number"
                        value={agent.maxConcurrency}
                        onChange={(e) => updateAgent(agent.id, 'maxConcurrency', Number(e.target.value))}
                        className="h-8 w-16 bg-bg-input border-border-default text-text-primary text-[13px]"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} className="flex items-center gap-3">
                    <Switch
                      checked={agent.notifyOnComplete}
                      onCheckedChange={(v) => updateAgent(agent.id, 'notifyOnComplete', v)}
                    />
                    <span className="text-[13px] text-text-primary">Notification on completion</span>
                  </motion.div>
                </motion.div>
              )}

              {agent.id === 'ama' && (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-4"
                >
                  <motion.div variants={staggerItem} className="flex items-center gap-3">
                    <Switch
                      checked={agent.contentGeneration}
                      onCheckedChange={(v) => updateAgent(agent.id, 'contentGeneration', v)}
                    />
                    <div>
                      <span className="text-[13px] text-text-primary">Content generation</span>
                      <p className="text-[11px] text-text-tertiary">Enable AI content generation</p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} className="space-y-2">
                    <label className="text-[13px] font-medium text-text-primary">Content types</label>
                    {Object.entries((agent as typeof agentData[2]).contentTypes ?? {}).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                        <div className="w-4 h-4 rounded border border-border-default flex items-center justify-center bg-bg-input">
                          {value && <Check className="w-3 h-3 text-success" />}
                        </div>
                        <span className="text-[13px] text-text-secondary capitalize">
                          {key === 'social' && 'Social media posts'}
                          {key === 'blog' && 'Blog articles'}
                          {key === 'adCopy' && 'Ad copy'}
                          {key === 'video' && 'Video scripts'}
                          {key === 'email' && 'Email campaigns'}
                        </span>
                      </label>
                    ))}
                  </motion.div>

                  <motion.div variants={staggerItem} className="flex items-center gap-3">
                    <Switch
                      checked={agent.reviewRequired}
                      onCheckedChange={(v) => updateAgent(agent.id, 'reviewRequired', v)}
                    />
                    <div>
                      <span className="text-[13px] text-text-primary">Review required</span>
                      <p className="text-[11px] text-text-tertiary">Human review before publishing</p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-secondary">Post frequency</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-text-secondary">Max posts per day:</span>
                      <Input
                        type="number"
                        value={agent.postFrequency}
                        onChange={(e) => updateAgent(agent.id, 'postFrequency', Number(e.target.value))}
                        className="h-8 w-16 bg-bg-input border-border-default text-text-primary text-[13px]"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} className="flex items-center gap-3">
                    <Switch
                      checked={agent.crossSell}
                      onCheckedChange={(v) => updateAgent(agent.id, 'crossSell', v)}
                    />
                    <div>
                      <span className="text-[13px] text-text-primary">Cross-sell engine</span>
                      <p className="text-[11px] text-text-tertiary">Enable automated cross-sell recommendations</p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-medium text-text-primary">Minimum match score</label>
                      <span className="text-[13px] font-mono text-xmrt-purple">{agent.matchScore}%</span>
                    </div>
                    <Slider
                      value={[(agent as typeof agentData[2]).matchScore ?? 70]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([v]) => updateAgent(agent.id, 'matchScore', v)}
                      className="w-full"
                    />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Section: Integrations ──────────────────────────────────────────────────

function IntegrationsSection() {
  const [integrations, setIntegrations] = useState(integrationData);

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const nextStatus = i.status === 'connected' ? 'disconnected' : 'connected';
        return { ...i, status: nextStatus as 'connected' | 'disconnected' | 'error' };
      })
    );
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      {/* Section Header */}
      <motion.div variants={staggerItem} className="mb-6">
        <h2 className="text-[18px] font-bold text-text-primary">Integrations</h2>
        <p className="text-[12px] text-text-secondary mt-1">Connected services and API keys</p>
      </motion.div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <motion.div
            key={integration.id}
            variants={staggerItem}
            className={`
              bg-bg-elevated border border-border-subtle rounded-lg p-5
              flex items-center gap-4 border-l-[3px] ${getIntegrationBorderColor(integration.status)}
              hover:border-border-default transition-colors
            `}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${integration.color}22` }}
            >
              <span className="text-[14px] font-bold" style={{ color: integration.color }}>
                {integration.name.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-text-primary">{integration.name}</h3>
              <p className="text-[12px] text-text-secondary">{integration.description}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${getIntegrationStatusBg(integration.status)}`} />
                <span className={`text-[12px] capitalize ${getIntegrationStatusColor(integration.status)}`}>
                  {integration.status === 'connected' && 'Connected'}
                  {integration.status === 'error' && 'Error'}
                  {integration.status === 'disconnected' && 'Not connected'}
                </span>
                <span className="text-[11px] text-text-tertiary ml-1">&middot; {integration.account}</span>
              </div>
            </div>

            {/* Action */}
            <Button
              variant={integration.status === 'connected' ? 'ghost' : 'default'}
              size="sm"
              onClick={() => toggleIntegration(integration.id)}
              className="h-8 text-[12px] shrink-0"
            >
              {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Section: Users ─────────────────────────────────────────────────────────

function UsersSection() {
  const [users] = useState(userData);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      {/* Section Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-text-primary">User Access</h2>
          <p className="text-[12px] text-text-secondary mt-1">Manage team members and permissions</p>
        </div>
        <Button size="sm" className="h-9 text-[13px]">
          <UserPlus className="w-4 h-4 mr-1.5" />
          Invite Member
        </Button>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={staggerItem} className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border-default hover:bg-transparent">
              <TableHead className="text-[11px] uppercase tracking-wider text-text-secondary font-medium w-[28%]">User</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-text-secondary font-medium w-[15%]">Role</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-text-secondary font-medium w-[20%]">Companies</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-text-secondary font-medium w-[15%]">Last Active</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-text-secondary font-medium w-[12%]">Status</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-text-secondary font-medium w-[10%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-border-subtle hover:bg-bg-hover">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-xmrt-purple/20 flex items-center justify-center shrink-0">
                      <span className="text-[12px] font-semibold text-xmrt-purple">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-text-primary">{user.name}</p>
                      <p className="text-[11px] text-text-secondary">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} text-[11px]`}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {user.companies.map((cid) => (
                      <div
                        key={cid}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getCompanyColor(cid) }}
                        title={cid}
                      />
                    ))}
                    <span className="text-[12px] text-text-secondary ml-1">
                      {user.companies.length === 3 ? 'All' : user.companies.length}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[12px] font-mono text-text-secondary font-tabular">{user.lastActive}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getStatusBadgeColor(user.status)} text-[11px]`}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-text-primary">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {user.role !== 'OWNER' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}

// ─── Section: Notifications ─────────────────────────────────────────────────

function NotificationsSection() {
  const loadSaved = () => {
    try {
      const saved = localStorage.getItem('suiteai-notification-settings');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  };

  const saved = loadSaved();

  const [categories, setCategories] = useState(saved?.categories ?? {
    lead: {
      enabled: true,
      items: { newLead: true, routed: true, rejected: true, summary: false },
    },
    pipeline: {
      enabled: true,
      items: { approval: true, timeout: true, completed: true, payment: true },
    },
    marketing: {
      enabled: true,
      items: { spend: true, review: true, summary: false },
    },
    system: {
      enabled: true,
      items: { downtime: true, errors: true, rateLimit: true },
    },
  });

  const [channels, setChannels] = useState(saved?.channels ?? {
    email: true,
    slack: true,
    inApp: true,
  });

  const persist = (nextCat: typeof categories, nextCh: typeof channels) => {
    localStorage.setItem('suiteai-notification-settings', JSON.stringify({
      categories: nextCat,
      channels: nextCh,
    }));
  };

  const updateCategory = (cat: string, enabled: boolean) => {
    setCategories((prev: typeof categories) => {
      const next = { ...prev, [cat]: { ...prev[cat as keyof typeof prev], enabled } };
      persist(next, channels);
      return next;
    });
  };

  const updateChannel = (key: keyof typeof channels, value: boolean) => {
    setChannels((prev: typeof channels) => {
      const next = { ...prev, [key]: value };
      persist(categories, next);
      return next;
    });
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      {/* Section Header */}
      <motion.div variants={staggerItem} className="mb-6">
        <h2 className="text-[18px] font-bold text-text-primary">Notification Preferences</h2>
        <p className="text-[12px] text-text-secondary mt-1">Manage your alert settings</p>
      </motion.div>

      {/* Notification Categories */}
      <div className="space-y-4 mb-8">
        {/* Lead Alerts */}
        <motion.div variants={staggerItem} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <Switch checked={categories.lead.enabled} onCheckedChange={(v) => updateCategory('lead', v)} />
            <h3 className="text-[15px] font-semibold text-text-primary">Lead Alerts</h3>
          </div>
          {categories.lead.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-11">
              {Object.entries(categories.lead.items).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <div className="w-4 h-4 rounded border border-border-default flex items-center justify-center bg-bg-input">
                    {Boolean(value) && <Check className="w-3 h-3 text-success" />}
                  </div>
                  <span className="text-[13px] text-text-secondary capitalize">
                    {key === 'newLead' ? 'New lead received' :
                     key === 'routed' ? 'Lead routed (low confidence)' :
                     key === 'rejected' ? 'Lead rejected' :
                     key === 'summary' ? 'Daily lead summary' : key}
                  </span>
                </label>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pipeline Alerts */}
        <motion.div variants={staggerItem} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <Switch checked={categories.pipeline.enabled} onCheckedChange={(v) => updateCategory('pipeline', v)} />
            <h3 className="text-[15px] font-semibold text-text-primary">Pipeline Alerts</h3>
          </div>
          {categories.pipeline.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-11">
              {Object.entries(categories.pipeline.items).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <div className="w-4 h-4 rounded border border-border-default flex items-center justify-center bg-bg-input">
                    {Boolean(value) && <Check className="w-3 h-3 text-success" />}
                  </div>
                  <span className="text-[13px] text-text-secondary capitalize">
                    {key === 'approval' ? 'Approval required' :
                     key === 'timeout' ? 'Stage timeout' :
                     key === 'completed' ? 'Pipeline completed' :
                     key === 'payment' ? 'Payment received' : key}
                  </span>
                </label>
              ))}
            </div>
          )}
        </motion.div>

        {/* Marketing Alerts */}
        <motion.div variants={staggerItem} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <Switch checked={categories.marketing.enabled} onCheckedChange={(v) => updateCategory('marketing', v)} />
            <h3 className="text-[15px] font-semibold text-text-primary">Marketing Alerts</h3>
          </div>
          {categories.marketing.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-11">
              {Object.entries(categories.marketing.items).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <div className="w-4 h-4 rounded border border-border-default flex items-center justify-center bg-bg-input">
                    {Boolean(value) && <Check className="w-3 h-3 text-success" />}
                  </div>
                  <span className="text-[13px] text-text-secondary capitalize">
                    {key === 'spend' ? 'Campaign spend threshold (80%)' :
                     key === 'review' ? 'Content ready for review' :
                     key === 'summary' ? 'Weekly performance summary' : key}
                  </span>
                </label>
              ))}
            </div>
          )}
        </motion.div>

        {/* System Alerts */}
        <motion.div variants={staggerItem} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <Switch checked={categories.system.enabled} onCheckedChange={(v) => updateCategory('system', v)} />
            <h3 className="text-[15px] font-semibold text-text-primary">System Alerts</h3>
          </div>
          {categories.system.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-11">
              {Object.entries(categories.system.items).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <div className="w-4 h-4 rounded border border-border-default flex items-center justify-center bg-bg-input">
                    {Boolean(value) && <Check className="w-3 h-3 text-success" />}
                  </div>
                  <span className="text-[13px] text-text-secondary capitalize">
                    {key === 'downtime' ? 'Agent downtime' :
                     key === 'errors' ? 'Integration errors' :
                     key === 'rateLimit' ? 'API rate limit warning' : key}
                  </span>
                </label>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Delivery Methods */}
      <motion.div variants={staggerItem} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
        <h3 className="text-[15px] font-semibold text-text-primary mb-4">Delivery Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={channels.email} onCheckedChange={(v) => updateChannel('email', v)} />
              <div>
                <span className="text-[13px] text-text-primary">Email notifications</span>
                <p className="text-[11px] text-text-tertiary">alex@agenticos.com</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={channels.slack} onCheckedChange={(v) => updateChannel('slack', v)} />
              <div>
                <span className="text-[13px] text-text-primary">Slack notifications</span>
                <p className="text-[11px] text-text-tertiary">#agenticos-alerts</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={channels.inApp} disabled />
              <div>
                <span className="text-[13px] text-text-primary">In-app notifications</span>
                <p className="text-[11px] text-text-tertiary">Always enabled</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Section: Appearance ────────────────────────────────────────────────────

function AppearanceSection() {
  const loadAppearance = () => {
    try {
      const saved = localStorage.getItem('suiteai-appearance-settings');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  };

  const saved = loadAppearance();
  const [theme, setTheme] = useState<'dark' | 'light'>(saved?.theme ?? 'dark');
  const density = 'comfortable' as const;
  const [accentIntensity, setAccentIntensity] = useState(saved?.accentIntensity ?? 75);
  const [animations, setAnimations] = useState(saved?.animations ?? true);
  const [reducedMotion, setReducedMotion] = useState(saved?.reducedMotion ?? false);
  const sidebarDefault = 'expanded' as const;
  const [showCompanySelector, setShowCompanySelector] = useState(saved?.showCompanySelector ?? true);

  useEffect(() => {
    localStorage.setItem('suiteai-appearance-settings', JSON.stringify({
      theme, accentIntensity, animations, reducedMotion, showCompanySelector,
    }));
  }, [theme, accentIntensity, animations, reducedMotion, showCompanySelector]);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      {/* Section Header */}
      <motion.div variants={staggerItem} className="mb-6">
        <h2 className="text-[18px] font-bold text-text-primary">Appearance</h2>
        <p className="text-[12px] text-text-secondary mt-1">Customize your dashboard experience</p>
      </motion.div>

      <div className="space-y-6">
        {/* Theme Selection */}
        <motion.div variants={staggerItem}>
          <h3 className="text-[14px] font-semibold text-text-primary mb-3">Theme</h3>
          <div className="flex gap-4">
            {/* Dark Theme */}
            <button
              onClick={() => setTheme('dark')}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all
                ${theme === 'dark'
                  ? 'border-xmrt-purple shadow-[0_0_0_2px_rgba(123,97,255,0.2)]'
                  : 'border-border-subtle hover:border-border-default'
                }
              `}
            >
              <div className="w-[140px] h-[90px] rounded-md bg-bg-darkest border border-border-subtle flex flex-col gap-1.5 p-2 overflow-hidden">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-harbor-blue" />
                  <div className="w-8 h-1 rounded bg-border-default" />
                </div>
                <div className="flex gap-1">
                  <div className="w-4 h-6 rounded-sm bg-bg-elevated" />
                  <div className="flex-1 h-6 rounded-sm bg-bg-elevated" />
                </div>
                <div className="h-4 rounded-sm bg-bg-elevated" />
              </div>
              <span className="text-[13px] text-text-primary">Dark</span>
              {theme === 'dark' && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-xmrt-purple flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>

            {/* Light Theme */}
            <button
              onClick={() => setTheme('light')}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all
                ${theme === 'light'
                  ? 'border-xmrt-purple shadow-[0_0_0_2px_rgba(123,97,255,0.2)]'
                  : 'border-border-subtle hover:border-border-default'
                }
              `}
            >
              <div className="w-[140px] h-[90px] rounded-md bg-gray-100 border border-gray-300 flex flex-col gap-1.5 p-2 overflow-hidden">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-harbor-blue" />
                  <div className="w-8 h-1 rounded bg-gray-300" />
                </div>
                <div className="flex gap-1">
                  <div className="w-4 h-6 rounded-sm bg-white border border-gray-200" />
                  <div className="flex-1 h-6 rounded-sm bg-white border border-gray-200" />
                </div>
                <div className="h-4 rounded-sm bg-white border border-gray-200" />
              </div>
              <span className="text-[13px] text-text-primary">Light</span>
              {theme === 'light' && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-xmrt-purple flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          </div>
        </motion.div>

        {/* Density */}
        <motion.div variants={staggerItem} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
          <h3 className="text-[14px] font-semibold text-text-primary mb-3">Data Density</h3>
          <div className="space-y-2.5">
            {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
              <label key={d} className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`
                    w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                    ${density === d ? 'border-xmrt-purple' : 'border-border-default'}
                  `}
                >
                  {density === d && <div className="w-2 h-2 rounded-full bg-xmrt-purple" />}
                </div>
                <div>
                  <span className="text-[13px] text-text-primary capitalize">{d}</span>
                  <span className="text-[11px] text-text-tertiary ml-2">
                    {d === 'compact' && 'More data, tighter spacing'}
                    {d === 'comfortable' && 'Balanced view'}
                    {d === 'spacious' && 'Relaxed, more whitespace'}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Accent Color Intensity */}
        <motion.div variants={staggerItem} className="bg-bg-elevated border border-border-subtle rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold text-text-primary">Accent Color Intensity</h3>
            <span className="text-[13px] font-mono text-xmrt-purple">{accentIntensity}%</span>
          </div>
          <Slider
            value={[accentIntensity]}
            min={0}
            max={100}
            step={5}
            onValueChange={([v]) => setAccentIntensity(v)}
            className="w-full"
          />
        </motion.div>

        {/* Animations */}
        <motion.div variants={staggerItem} className="bg-bg-elevated border border-border-subtle rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={animations} onCheckedChange={setAnimations} />
              <div>
                <span className="text-[13px] text-text-primary">Enable animations</span>
                <p className="text-[11px] text-text-tertiary">Smooth transitions and micro-interactions</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
              <div>
                <span className="text-[13px] text-text-primary">Reduced motion</span>
                <p className="text-[11px] text-text-tertiary">Minimize animations for accessibility</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={staggerItem} className="bg-bg-elevated border border-border-subtle rounded-lg p-5 space-y-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Sidebar</h3>
          <div className="space-y-2.5">
            <span className="text-[12px] text-text-secondary block mb-2">Default sidebar state</span>
            {(['expanded', 'collapsed'] as const).map((s) => (
              <label key={s} className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`
                    w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                    ${sidebarDefault === s ? 'border-xmrt-purple' : 'border-border-default'}
                  `}
                >
                  {sidebarDefault === s && <div className="w-2 h-2 rounded-full bg-xmrt-purple" />}
                </div>
                <span className="text-[13px] text-text-primary capitalize">{s}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
            <Switch checked={showCompanySelector} onCheckedChange={setShowCompanySelector} />
            <span className="text-[13px] text-text-primary">Show company selector</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Main Settings Page ─────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('companies');
  const [hasChanges] = useState(false);

  return (
    <Layout>
      <div className="p-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeSmooth }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-[28px] font-bold text-text-primary tracking-tight">Settings</h1>
            <p className="text-[14px] text-text-secondary mt-1">
              Configure AgenticOS — companies, agents, integrations, and access
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <>
                <div className="flex items-center gap-1.5 text-[12px] text-party-amber">
                  <div className="w-1.5 h-1.5 rounded-full bg-party-amber" />
                  Unsaved changes
                </div>
                <Button variant="ghost" size="sm" className="h-9 text-[13px]">
                  Discard
                </Button>
              </>
            )}
            <Button
              size="sm"
              disabled={!hasChanges}
              className="h-9 text-[13px]"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Changes
            </Button>
          </div>
        </motion.div>

        {/* Two-column layout: Nav + Content */}
        <div className="flex gap-6">
          {/* Settings Navigation */}
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: easeSmooth, delay: 0.1 }}
            className="w-[240px] shrink-0 sticky top-[80px] self-start bg-bg-elevated border border-border-subtle rounded-lg p-3 space-y-1 max-h-[calc(100dvh-120px)]"
          >
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: easeSmooth, delay: 0.05 * index }}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-bg-hover text-text-white border-l-[3px] border-xmrt-purple'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border-l-[3px] border-transparent'
                    }
                  `}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </motion.nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {activeTab === 'companies' && <CompaniesSection />}
                {activeTab === 'agents' && <AgentsSection />}
                {activeTab === 'integrations' && <IntegrationsSection />}
                {activeTab === 'users' && <UsersSection />}
                {activeTab === 'notifications' && <NotificationsSection />}
                {activeTab === 'appearance' && <AppearanceSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}
