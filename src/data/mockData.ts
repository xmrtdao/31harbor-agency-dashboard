// ─── Companies ───────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  color: string;
  colorDim: string;
  industry: string;
}

export const companies: Company[] = [
  { id: 'harbor', name: '31 Harbor', shortName: '31 Harbor', abbreviation: '31H', color: '#0A84FF', colorDim: '#0A84FF33', industry: 'Real Estate' },
  { id: 'party', name: 'Party Favor Photo', shortName: 'Party Favor', abbreviation: 'PFP', color: '#F5A623', colorDim: '#F5A62333', industry: 'Events / Photo Booth' },
  { id: 'xmrt', name: 'XMRT DAO', shortName: 'XMRT DAO', abbreviation: 'XMRT', color: '#7B61FF', colorDim: '#7B61FF33', industry: 'Tech / Crypto' },
];

// ─── Leads ───────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  name: string;
  email: string;
  companyId: string;
  score: number;
  source: 'Organic' | 'Paid' | 'Referral';
  status: 'Routed' | 'Qualified' | 'Pending' | 'Low Match' | 'Contracted' | 'Quoted';
  routedBy: 'AI' | 'Manual';
  timeAgo: string;
  intent: string;
}

export const leads: Lead[] = [
  { id: 'L-2847', name: 'Sarah Mitchell', email: 'sarah@email.com', companyId: 'harbor', score: 87, source: 'Organic', status: 'Routed', routedBy: 'AI', timeAgo: '2m ago', intent: 'waterfront property inquiry' },
  { id: 'L-2848', name: 'James & Linda Chen', email: 'jlchen@events.com', companyId: 'party', score: 92, source: 'Paid', status: 'Qualified', routedBy: 'AI', timeAgo: '15m ago', intent: 'wedding photo booth package' },
  { id: 'L-2849', name: 'CryptoVentures LLC', email: 'contact@cryptov.com', companyId: 'xmrt', score: 64, source: 'Referral', status: 'Pending', routedBy: 'AI', timeAgo: '32m ago', intent: 'token partnership inquiry' },
  { id: 'L-2850', name: 'Roberto Alvarado', email: 'ralvarado@email.com', companyId: 'harbor', score: 45, source: 'Organic', status: 'Low Match', routedBy: 'AI', timeAgo: '1h ago', intent: 'general inquiry' },
  { id: 'L-2851', name: "Emily's Wedding Planning", email: 'emily@ewp.com', companyId: 'party', score: 78, source: 'Organic', status: 'Routed', routedBy: 'AI', timeAgo: '1h ago', intent: 'corporate event package' },
  { id: 'L-2852', name: 'DeFi Labs', email: 'partners@defilabs.io', companyId: 'xmrt', score: 95, source: 'Paid', status: 'Contracted', routedBy: 'AI', timeAgo: '2h ago', intent: 'smart contract audit' },
  { id: 'L-2853', name: 'Harbor View Properties', email: 'info@harborview.com', companyId: 'harbor', score: 71, source: 'Referral', status: 'Quoted', routedBy: 'AI', timeAgo: '3h ago', intent: 'commercial leasing' },
  { id: 'L-2854', name: 'Birthday Bash Events', email: 'hello@bbevents.com', companyId: 'party', score: 56, source: 'Organic', status: 'Qualified', routedBy: 'AI', timeAgo: '4h ago', intent: 'kids party package' },
  { id: 'L-2855', name: 'Blockchain Summit Org', email: 'team@bcsummit.org', companyId: 'xmrt', score: 88, source: 'Paid', status: 'Routed', routedBy: 'AI', timeAgo: '5h ago', intent: 'sponsorship inquiry' },
  { id: 'L-2856', name: 'Marina Residences', email: 'sales@marinares.com', companyId: 'harbor', score: 82, source: 'Organic', status: 'Qualified', routedBy: 'AI', timeAgo: '6h ago', intent: 'luxury condo viewing' },
  { id: 'L-2857', name: 'TokenForge Inc', email: 'dev@tokenforge.io', companyId: 'xmrt', score: 73, source: 'Referral', status: 'Quoted', routedBy: 'AI', timeAgo: '7h ago', intent: 'NFT marketplace dev' },
  { id: 'L-2858', name: 'Coastal Realty Group', email: 'info@coastalrealty.com', companyId: 'harbor', score: 91, source: 'Paid', status: 'Contracted', routedBy: 'AI', timeAgo: '8h ago', intent: 'property management' },
  { id: 'L-2859', name: 'SnapHappy Photobooth', email: 'book@snaphappy.com', companyId: 'party', score: 68, source: 'Organic', status: 'Pending', routedBy: 'AI', timeAgo: '9h ago', intent: 'graduation event' },
  { id: 'L-2860', name: 'Web3 Collective', email: 'hello@web3coll.org', companyId: 'xmrt', score: 59, source: 'Organic', status: 'Low Match', routedBy: 'AI', timeAgo: '10h ago', intent: 'consulting inquiry' },
  { id: 'L-2861', name: 'Sunset Bay Homes', email: 'sales@sunsetbay.com', companyId: 'harbor', score: 85, source: 'Referral', status: 'Routed', routedBy: 'AI', timeAgo: '11h ago', intent: 'new development presale' },
];

// ─── Pipeline Stages ─────────────────────────────────────────────────────────

export interface PipelineStage {
  id: string;
  label: string;
  count: number;
  needsApproval: number;
  activeCompanies: string[];
}

export const pipelineStages: PipelineStage[] = [
  { id: 'scraping', label: 'SCRAPING', count: 12, needsApproval: 0, activeCompanies: ['harbor', 'party', 'xmrt'] },
  { id: 'qualify', label: 'QUALIFY', count: 8, needsApproval: 0, activeCompanies: ['harbor', 'party'] },
  { id: 'quote', label: 'QUOTE', count: 5, needsApproval: 1, activeCompanies: ['xmrt'] },
  { id: 'contract', label: 'CONTRACT', count: 3, needsApproval: 1, activeCompanies: ['party', 'xmrt'] },
  { id: 'paid', label: 'PAID', count: 2, needsApproval: 0, activeCompanies: ['harbor'] },
];

// ─── Campaigns ───────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  companyId: string;
  status: 'Active' | 'Pending' | 'Draft';
  spend: number;
  revenue: number;
  roas: number;
  impressions: number;
  clicks: number;
}

export const campaigns: Campaign[] = [
  { id: 'C-101', name: 'Wedding Season Boost', companyId: 'party', status: 'Active', spend: 4200, revenue: 16800, roas: 4.0, impressions: 125000, clicks: 3400 },
  { id: 'C-102', name: 'Harbor Waterfront', companyId: 'harbor', status: 'Active', spend: 6800, revenue: 20400, roas: 3.0, impressions: 98000, clicks: 2100 },
  { id: 'C-103', name: 'XMRT Token Launch', companyId: 'xmrt', status: 'Pending', spend: 3500, revenue: 0, roas: 0, impressions: 0, clicks: 0 },
  { id: 'C-104', name: 'Spring Photo Special', companyId: 'party', status: 'Active', spend: 2800, revenue: 11200, roas: 4.0, impressions: 87000, clicks: 1900 },
  { id: 'C-105', name: 'Luxury Condos Campaign', companyId: 'harbor', status: 'Active', spend: 5500, revenue: 17600, roas: 3.2, impressions: 76000, clicks: 1800 },
  { id: 'C-106', name: 'DeFi Integration Push', companyId: 'xmrt', status: 'Active', spend: 4200, revenue: 12600, roas: 3.0, impressions: 54000, clicks: 1500 },
  { id: 'C-107', name: 'Beach House Rentals', companyId: 'harbor', status: 'Pending', spend: 1800, revenue: 0, roas: 0, impressions: 0, clicks: 0 },
  { id: 'C-108', name: 'Holiday Event Booking', companyId: 'party', status: 'Draft', spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0 },
];

// ─── Activity Feed ───────────────────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  companyId: string;
  icon: string;
  description: string;
  timestamp: string;
}

export const activityFeed: ActivityEntry[] = [
  { id: 'A-001', companyId: 'harbor', icon: 'UserPlus', description: 'New lead routed to 31 Harbor — Sarah M. interested in waterfront property', timestamp: '2m ago' },
  { id: 'A-002', companyId: 'party', icon: 'Sparkles', description: 'AI generated 3 Instagram posts for Party Favor Photo', timestamp: '5m ago' },
  { id: 'A-003', companyId: 'xmrt', icon: 'CheckCircle', description: 'Pipeline stage completed: Contract signed — XMRT DAO', timestamp: '8m ago' },
  { id: 'A-004', companyId: 'harbor', icon: 'GitBranch', description: 'Lead classifier retrained — accuracy 94.2%', timestamp: '12m ago' },
  { id: 'A-005', companyId: 'party', icon: 'TrendingUp', description: 'Campaign ROAS hit 4.1x — wedding season promo', timestamp: '18m ago' },
  { id: 'A-006', companyId: 'xmrt', icon: 'AlertTriangle', description: 'Human approval needed: Quote $12,500 — XMRT DAO', timestamp: '24m ago' },
  { id: 'A-007', companyId: 'harbor', icon: 'Zap', description: 'Automated follow-up sent — 31 Harbor lead #2847', timestamp: '31m ago' },
  { id: 'A-008', companyId: 'party', icon: 'UserPlus', description: 'New lead: James & Linda Chen — wedding photo booth inquiry', timestamp: '38m ago' },
  { id: 'A-009', companyId: 'xmrt', icon: 'BarChart3', description: 'Weekly analytics report generated for XMRT DAO', timestamp: '45m ago' },
  { id: 'A-010', companyId: 'harbor', icon: 'CheckCircle', description: 'Pipeline stage completed: Quote accepted — Harbor View', timestamp: '52m ago' },
  { id: 'A-011', companyId: 'party', icon: 'Megaphone', description: 'Ad spend optimized: -12% CPC improvement', timestamp: '1h ago' },
  { id: 'A-012', companyId: 'xmrt', icon: 'Zap', description: 'Smart contract deployed for DeFi Labs partnership', timestamp: '1h ago' },
  { id: 'A-013', companyId: 'harbor', icon: 'TrendingUp', description: 'Lead score updated: Marina Residences +8 points', timestamp: '1h ago' },
  { id: 'A-014', companyId: 'party', icon: 'Sparkles', description: 'AI drafted email sequence for Birthday Bash Events', timestamp: '2h ago' },
  { id: 'A-015', companyId: 'xmrt', icon: 'GitBranch', description: 'Routing rule updated: crypto leads now score +15%', timestamp: '2h ago' },
  { id: 'A-016', companyId: 'harbor', icon: 'AlertTriangle', description: 'Low match alert: Roberto Alvarado — manual review suggested', timestamp: '2h ago' },
  { id: 'A-017', companyId: 'party', icon: 'CheckCircle', description: 'Content published: 2 Instagram Reels, 1 TikTok', timestamp: '3h ago' },
  { id: 'A-018', companyId: 'xmrt', icon: 'UserPlus', description: 'New lead: Blockchain Summit Org — sponsorship inquiry', timestamp: '3h ago' },
  { id: 'A-019', companyId: 'harbor', icon: 'BarChart3', description: 'Revenue target 68% complete — ahead of schedule', timestamp: '4h ago' },
  { id: 'A-020', companyId: 'party', icon: 'Zap', description: 'Automated SMS campaign sent to 47 leads', timestamp: '4h ago' },
];

// ─── Revenue Data (12 months) ────────────────────────────────────────────────

export interface RevenueDataPoint {
  month: string;
  harbor: number;
  party: number;
  xmrt: number;
}

export const revenueData: RevenueDataPoint[] = [
  { month: 'Jan', harbor: 18500, party: 12200, xmrt: 8900 },
  { month: 'Feb', harbor: 22100, party: 14500, xmrt: 10200 },
  { month: 'Mar', harbor: 19800, party: 16800, xmrt: 12500 },
  { month: 'Apr', harbor: 25400, party: 19200, xmrt: 11800 },
  { month: 'May', harbor: 28200, party: 22400, xmrt: 14100 },
  { month: 'Jun', harbor: 31100, party: 25800, xmrt: 16500 },
  { month: 'Jul', harbor: 29800, party: 24100, xmrt: 15200 },
  { month: 'Aug', harbor: 33500, party: 27500, xmrt: 17800 },
  { month: 'Sep', harbor: 36200, party: 26300, xmrt: 19400 },
  { month: 'Oct', harbor: 34800, party: 28900, xmrt: 21100 },
  { month: 'Nov', harbor: 38400, party: 31200, xmrt: 19500 },
  { month: 'Dec', harbor: 42100, party: 33800, xmrt: 22800 },
];

// ─── Daily Revenue Data (30 days for trend chart) ────────────────────────────

export interface DailyRevenuePoint {
  day: string;
  harbor: number;
  party: number;
  xmrt: number;
}

export const dailyRevenueData: DailyRevenuePoint[] = [
  { day: '01', harbor: 1200, party: 800, xmrt: 500 },
  { day: '02', harbor: 1350, party: 920, xmrt: 650 },
  { day: '03', harbor: 1100, party: 780, xmrt: 480 },
  { day: '04', harbor: 1480, party: 1050, xmrt: 720 },
  { day: '05', harbor: 1620, party: 980, xmrt: 680 },
  { day: '06', harbor: 1390, party: 1120, xmrt: 590 },
  { day: '07', harbor: 1750, party: 1240, xmrt: 810 },
  { day: '08', harbor: 1580, party: 1080, xmrt: 750 },
  { day: '09', harbor: 1420, party: 950, xmrt: 620 },
  { day: '10', harbor: 1890, party: 1320, xmrt: 890 },
  { day: '11', harbor: 2100, party: 1450, xmrt: 920 },
  { day: '12', harbor: 1950, party: 1380, xmrt: 850 },
  { day: '13', harbor: 1680, party: 1200, xmrt: 780 },
  { day: '14', harbor: 2240, party: 1520, xmrt: 960 },
  { day: '15', harbor: 2380, party: 1680, xmrt: 1050 },
  { day: '16', harbor: 2150, party: 1540, xmrt: 980 },
  { day: '17', harbor: 1920, party: 1420, xmrt: 890 },
  { day: '18', harbor: 2560, party: 1780, xmrt: 1120 },
  { day: '19', harbor: 2680, party: 1850, xmrt: 1200 },
  { day: '20', harbor: 2420, party: 1720, xmrt: 1080 },
  { day: '21', harbor: 2180, party: 1600, xmrt: 950 },
  { day: '22', harbor: 2850, party: 1980, xmrt: 1250 },
  { day: '23', harbor: 2980, party: 2050, xmrt: 1320 },
  { day: '24', harbor: 2720, party: 1890, xmrt: 1180 },
  { day: '25', harbor: 2520, party: 1750, xmrt: 1100 },
  { day: '26', harbor: 3120, party: 2180, xmrt: 1380 },
  { day: '27', harbor: 3280, party: 2320, xmrt: 1450 },
  { day: '28', harbor: 3050, party: 2150, xmrt: 1320 },
  { day: '29', harbor: 2890, party: 2080, xmrt: 1280 },
  { day: '30', harbor: 3420, party: 2450, xmrt: 1520 },
];

// ─── KPI Sparkline Data ──────────────────────────────────────────────────────

export const sparklineDataTotalLeads = [32, 38, 35, 42, 40, 45, 52, 48, 55, 60, 58, 62, 68, 72, 65, 70, 75, 80, 78, 85, 82, 88, 92, 90, 95, 100, 98, 105, 110, 115];

export const sparklineDataPipeline = [12.5, 13.2, 12.8, 14.5, 15.1, 14.8, 16.2, 17.5, 16.8, 18.2, 19.5, 18.8, 20.1, 21.5, 20.8, 22.5, 23.8, 23.2, 24.5, 25.8, 26.5, 27.2, 28.5, 29.8, 30.5, 31.2, 32.5, 33.8, 34.2, 35.5];

// ─── Company Breakdown for Donut Chart ───────────────────────────────────────

export const companyRevenueBreakdown = [
  { name: '31 Harbor', value: 52400, color: '#0A84FF', percentage: 42 },
  { name: 'Party Favor Photo', value: 38700, color: '#F5A623', percentage: 31 },
  { name: 'XMRT DAO', value: 33500, color: '#7B61FF', percentage: 27 },
];

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timeAgo: string;
}

export const notifications: Notification[] = [
  { id: 'N-001', title: 'Pipeline Alert', message: '2 approvals pending in XMRT DAO pipeline', type: 'warning', read: false, timeAgo: '5m ago' },
  { id: 'N-002', title: 'Lead Routed', message: 'New high-intent lead: Sarah Mitchell (87)', type: 'success', read: false, timeAgo: '12m ago' },
  { id: 'N-003', title: 'Campaign Milestone', message: 'Wedding Season Boost hit 4.0x ROAS', type: 'success', read: true, timeAgo: '1h ago' },
  { id: 'N-004', title: 'System Update', message: 'Lead classifier retrained — 94.2% accuracy', type: 'info', read: true, timeAgo: '2h ago' },
];
