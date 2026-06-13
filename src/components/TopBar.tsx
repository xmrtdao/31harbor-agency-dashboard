import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

const routeTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/': { title: 'SuiteAI Command Center', breadcrumb: 'Overview' },
  '/leads': { title: 'Lead Router', breadcrumb: 'Lead Router' },
  '/pipeline': { title: 'Pipeline Manager', breadcrumb: 'Pipeline' },
  '/marketing': { title: 'Marketing Center', breadcrumb: 'Marketing' },
  '/analytics': { title: 'Analytics Dashboard', breadcrumb: 'Analytics' },
  '/settings': { title: 'Settings', breadcrumb: 'Settings' },
};

const companyDots = [
  { id: 'harbor', color: '#0A84FF', label: '31 Harbor' },
  { id: 'party', color: '#F5A623', label: 'Party Favor Photo' },
  { id: 'xmrt', color: '#7B61FF', label: 'XMRT DAO' },
];

export default function TopBar() {
  const location = useLocation();
  const { notifications, markAllNotificationsRead } = useDashboardStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const routeInfo = routeTitles[location.pathname] || { title: 'SuiteAI', breadcrumb: 'Page' };
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-bg-darkest border-b border-border-subtle flex items-center px-6 sticky top-0 z-40 shrink-0">
      {/* Left: Title + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-[12px] text-text-tertiary uppercase tracking-wider">Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
        <h1 className="text-[16px] font-semibold text-text-primary truncate">{routeInfo.breadcrumb}</h1>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <div
          className={`
            relative flex items-center w-[320px] transition-all duration-200
            ${searchFocused ? 'ring-2 ring-border-focus/30' : ''}
          `}
        >
          <Search className="absolute left-3 w-4 h-4 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads, campaigns, pipelines..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-9 pl-9 pr-3 bg-bg-input border border-border-default rounded-md text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-focus transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Company Switcher Pills */}
        <div className="flex items-center gap-1.5 mr-2">
          {companyDots.map((dot) => (
            <button
              key={dot.id}
              title={dot.label}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-bg-hover transition-colors"
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: dot.color }}
              />
            </button>
          ))}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-md hover:bg-bg-hover transition-colors"
          >
            <Bell className="w-[18px] h-[18px] text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-[360px] bg-bg-elevated border border-border-default rounded-lg shadow-xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                  <span className="text-[14px] font-semibold text-text-primary">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[12px] text-harbor-blue hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-[13px] text-text-tertiary">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 border-b border-border-subtle hover:bg-bg-hover transition-colors ${
                          !notif.read ? 'bg-bg-hover/40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              notif.type === 'success'
                                ? 'bg-success'
                                : notif.type === 'warning'
                                ? 'bg-warning'
                                : notif.type === 'error'
                                ? 'bg-danger'
                                : 'bg-info'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-text-primary">{notif.title}</div>
                            <div className="text-[12px] text-text-secondary mt-0.5">{notif.message}</div>
                            <div className="text-[11px] text-text-tertiary mt-1">{notif.timeAgo}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
