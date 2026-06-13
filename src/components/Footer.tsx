import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="h-8 flex items-center justify-between px-6 bg-bg-darkest border-t border-border-subtle shrink-0 text-[11px] text-text-tertiary">
      <div className="flex items-center gap-2">
        <Activity className="w-3 h-3 text-success" />
        <span>All systems operational</span>
        <span className="text-border-default mx-1">|</span>
        <span>AgenticOS v0.1.0</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
        <span>Connected to 3 companies</span>
      </div>
    </footer>
  );
}
