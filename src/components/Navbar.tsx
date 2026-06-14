import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GitBranch,
  Workflow,
  Megaphone,
  BarChart3,
  Radio,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  User,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { Company } from '@/data/mockData';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/leads', label: 'Lead Router', icon: GitBranch },
  { path: '/pipeline', label: 'Pipeline', icon: Workflow },
  { path: '/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/gossip', label: 'GossipHub', icon: Radio },
  { path: '/settings', label: 'Settings', icon: Settings2 },
];

const companyOptions: { value: 'all' | Company['id']; label: string; color: string }[] = [
  { value: 'all', label: 'All Companies', color: '#8B95A5' },
  { value: 'harbor', label: '31 Harbor', color: '#0A84FF' },
  { value: 'party', label: 'Party Favor Photo', color: '#F5A623' },
  { value: 'xmrt', label: 'XMRT DAO', color: '#7B61FF' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, activeCompany, setActiveCompany } = useDashboardStore();
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  const activeCompanyData = companyOptions.find((c) => c.value === activeCompany);

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0, width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="fixed left-0 top-0 h-[100dvh] bg-bg-elevated border-r border-border-subtle flex flex-col z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-harbor-blue/15 flex items-center justify-center shrink-0">
            <Hexagon className="w-5 h-5 text-harbor-blue" />
          </div>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[18px] font-bold text-text-primary tracking-tight whitespace-nowrap"
            >
              SuiteAI
            </motion.span>
          )}
        </div>
      </div>

      {/* Company Selector */}
      <div className="px-3 pt-4 pb-2 shrink-0">
        <button
          onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md bg-bg-input border border-border-default hover:border-border-focus transition-colors text-left"
        >
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: activeCompanyData?.color || '#8B95A5' }}
          />
          {!sidebarCollapsed && (
            <>
              <span className="text-[13px] text-text-primary flex-1 truncate">
                {activeCompanyData?.label || 'All Companies'}
              </span>
              <svg className="w-3.5 h-3.5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>

        {/* Dropdown */}
        {companyDropdownOpen && !sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 bg-bg-elevated border border-border-default rounded-md shadow-lg overflow-hidden"
          >
            {companyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setActiveCompany(opt.value as 'all' | 'harbor' | 'party' | 'xmrt');
                  setCompanyDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-bg-hover transition-colors text-left"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: opt.color }}
                />
                <span className="text-[13px] text-text-primary">{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-all duration-150
                ${isActive
                  ? 'bg-bg-hover text-text-white border-l-[3px]'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border-l-[3px] border-transparent'
                }
              `}
              style={isActive ? { borderLeftColor: '#0A84FF' } : {}}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="shrink-0 border-t border-border-subtle px-3 py-3 space-y-2">
        {/* User Avatar */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-xmrt-purple/20 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-xmrt-purple" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-text-primary truncate">Alex Morgan</div>
              <div className="text-[11px] text-text-tertiary">Super Admin</div>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors text-[12px]"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
