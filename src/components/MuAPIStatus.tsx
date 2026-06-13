// ─── MuAPIStatus.tsx ─────────────────────────────────────────────────────────
// MuAPI service status + recent generations
// Shows: API connection, generation queue, credits remaining

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video, Image as ImageIcon, AudioLines, Box, CircleDot,
  Sparkles, Clock, CheckCircle2, AlertCircle, CreditCard,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceStatus {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'up' | 'degraded' | 'down';
  latency: number;
  queue: number;
  color: string;
  bgColor: string;
}

interface GenerationItem {
  id: string;
  type: 'video' | 'image' | 'audio' | '3d';
  title: string;
  status: 'generating' | 'completed' | 'failed' | 'queued';
  companyId: string;
  timestamp: string;
  color: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MuAPIStatus() {
  const [connected, setConnected] = useState(true);
  const [creditsUsed, setCreditsUsed] = useState(0);

  // Animate credits bar on mount
  useEffect(() => {
    const timer = setTimeout(() => setCreditsUsed(67), 600);
    return () => clearTimeout(timer);
  }, []);

  const services: ServiceStatus[] = [
    { id: 'video', label: 'Video', icon: Video, status: 'up', latency: 120, queue: 2, color: 'text-harbor-blue', bgColor: 'bg-harbor-blue/15' },
    { id: 'image', label: 'Image', icon: ImageIcon, status: 'up', latency: 45, queue: 0, color: 'text-success', bgColor: 'bg-success/15' },
    { id: 'audio', label: 'Audio', icon: AudioLines, status: 'degraded', latency: 280, queue: 4, color: 'text-party-amber', bgColor: 'bg-party-amber/15' },
    { id: '3d', label: '3D', icon: Box, status: 'up', latency: 95, queue: 1, color: 'text-xmrt-purple', bgColor: 'bg-xmrt-purple/15' },
  ];

  const recentGenerations: GenerationItem[] = [
    {
      id: 'G-001', type: 'video', title: 'Harbor Promo Teaser',
      status: 'completed', companyId: 'harbor', timestamp: '2m ago', color: '#0A84FF',
    },
    {
      id: 'G-002', type: 'image', title: 'Party Favor Hero Banner',
      status: 'generating', companyId: 'party', timestamp: 'Now', color: '#F5A623',
    },
    {
      id: 'G-003', type: 'audio', title: 'XMRT Podcast Intro',
      status: 'queued', companyId: 'xmrt', timestamp: 'Queued', color: '#7B61FF',
    },
  ];

  const totalCredits = 1000;
  const creditsRemaining = totalCredits - creditsUsed;
  const creditsPercent = (creditsUsed / totalCredits) * 100;

  const statusDotClass = (status: string) => {
    switch (status) {
      case 'up': return 'bg-success';
      case 'degraded': return 'bg-party-amber';
      case 'down': return 'bg-danger';
      default: return 'bg-text-tertiary';
    }
  };

  const genStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-success" />;
      case 'generating': return <CircleDot className="w-3 h-3 text-party-amber animate-pulse" />;
      case 'queued': return <Clock className="w-3 h-3 text-text-tertiary" />;
      case 'failed': return <AlertCircle className="w-3 h-3 text-danger" />;
      default: return null;
    }
  };

  const genStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/15 text-success';
      case 'generating': return 'bg-party-amber/15 text-party-amber';
      case 'queued': return 'bg-text-tertiary/15 text-text-tertiary';
      case 'failed': return 'bg-danger/15 text-danger';
      default: return 'bg-text-tertiary/15 text-text-tertiary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-all duration-200 flex flex-col"
    >
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-xmrt-purple/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-xmrt-purple" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">MuAPI</h3>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-success animate-pulse-dot' : 'bg-danger'}`} />
              <span className={`text-[11px] font-medium ${connected ? 'text-success' : 'text-danger'}`}>
                {connected ? 'All Services Up' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-text-tertiary" />
          <span className="text-[11px] font-mono text-text-secondary">{creditsRemaining} cr</span>
        </div>
      </div>

      {/* ─── Service Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="bg-bg-hover rounded-md px-3 py-2.5 border border-transparent hover:border-border-default transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md ${svc.bgColor} flex items-center justify-center`}>
                  <svc.icon className={`w-3 h-3 ${svc.color}`} />
                </div>
                <span className="text-[12px] font-medium text-text-primary">{svc.label}</span>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ${statusDotClass(svc.status)}`} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-tertiary font-mono">{svc.latency}ms</span>
              {svc.queue > 0 && (
                <span className="text-[10px] font-medium text-party-amber bg-party-amber/15 px-1.5 py-0.5 rounded-full">
                  {svc.queue} queued
                </span>
              )}
              {svc.queue === 0 && (
                <span className="text-[10px] font-medium text-success">Idle</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Recent Generations ─────────────────────────────────── */}
      <div className="flex-1 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Recent Generations</span>
          <Clock className="w-3 h-3 text-text-tertiary" />
        </div>
        <div className="space-y-2">
          {recentGenerations.map((gen) => (
            <div
              key={gen.id}
              className="flex items-center gap-3 px-3 py-2 bg-bg-hover rounded-md border border-transparent hover:border-border-default transition-all"
            >
              {/* Thumbnail placeholder */}
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${gen.color}20` }}
              >
                {gen.type === 'video' && <Video className="w-3.5 h-3.5" style={{ color: gen.color }} />}
                {gen.type === 'image' && <ImageIcon className="w-3.5 h-3.5" style={{ color: gen.color }} />}
                {gen.type === 'audio' && <AudioLines className="w-3.5 h-3.5" style={{ color: gen.color }} />}
                {gen.type === '3d' && <Box className="w-3.5 h-3.5" style={{ color: gen.color }} />}
              </div>
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-text-primary truncate">{gen.title}</p>
                <p className="text-[10px] text-text-tertiary">{gen.timestamp}</p>
              </div>
              {/* Status */}
              <div className="flex items-center gap-1.5">
                {genStatusIcon(gen.status)}
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${genStatusText(gen.status)}`}>
                  {gen.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Credits Remaining Bar ──────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-text-tertiary">Credits Used</span>
          <span className="text-[11px] font-medium font-mono text-text-secondary">{creditsUsed} / {totalCredits}</span>
        </div>
        <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${creditsPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className={`h-full rounded-full ${
              creditsPercent > 80 ? 'bg-danger' : creditsPercent > 50 ? 'bg-party-amber' : 'bg-success'
            }`}
          />
        </div>
        <p className="text-[10px] text-text-tertiary mt-1.5">
          {creditsPercent > 80 ? 'Low credits — consider topping up' : `${creditsRemaining} credits remaining this cycle`}
        </p>
      </div>
    </motion.div>
  );
}
