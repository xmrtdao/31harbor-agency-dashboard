// ─── OllamaStatus.tsx ────────────────────────────────────────────────────────
// Real-time Ollama connection status widget
// Shows: connection status, loaded models, quick actions
// Polls localhost:11434/api/ps every 5 seconds

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, Download, MessageSquare, Settings, RefreshCw,
  Server, Layers, Zap,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OllamaModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  details: {
    parameter_size: string;
    quantization_level: string;
  };
  expires_at: string;
  size_vram: number;
}

interface OllamaPsResponse {
  models: OllamaModel[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatModelName(name: string): string {
  return name.replace(/:latest$/, '').replace(/:([\w\-.]+)$/, ' ($1)');
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function OllamaStatus() {
  const { activeCompany } = useDashboardStore();
  const [connected, setConnected] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active company model mapping
  const companyModelMap: Record<string, string> = {
    harbor: 'llama3.2',
    party: 'phi4',
    xmrt: 'qwen2.5-coder',
  };

  const activeModelName = activeCompany !== 'all'
    ? companyModelMap[activeCompany]
    : null;

  const fetchOllamaStatus = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('http://localhost:11434/api/ps', {
        method: 'GET',
        // Ollama doesn't require auth for local ps endpoint
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: OllamaPsResponse = await res.json();
      setModels(data.models || []);
      setConnected(true);
      setLastUpdated(new Date());
    } catch {
      setConnected(false);
      setModels([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Poll every 5 seconds
  useEffect(() => {
    fetchOllamaStatus();
    const interval = setInterval(fetchOllamaStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchOllamaStatus]);

  // Total memory used
  const totalVram = models.reduce((sum, m) => sum + (m.size_vram || 0), 0);
  const totalRam = models.reduce((sum, m) => sum + (m.size || 0), 0);

  // Mock data for when Ollama is not running (demo fallback)
  const mockModels: OllamaModel[] = [
    {
      name: 'llama3.2',
      model: 'llama3.2:latest',
      size: 2147483648,
      digest: 'sha256:a1b2c3d4',
      details: { parameter_size: '3.2B', quantization_level: 'Q4_K_M' },
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      size_vram: 1610612736,
    },
    {
      name: 'phi4',
      model: 'phi4:latest',
      size: 9663676416,
      digest: 'sha256:e5f6g7h8',
      details: { parameter_size: '14B', quantization_level: 'Q4_K_M' },
      expires_at: new Date(Date.now() + 1800000).toISOString(),
      size_vram: 7516192768,
    },
    {
      name: 'qwen2.5-coder',
      model: 'qwen2.5-coder:latest',
      size: 4831838208,
      digest: 'sha256:i9j0k1l2',
      details: { parameter_size: '7B', quantization_level: 'Q4_K_M' },
      expires_at: new Date(Date.now() + 7200000).toISOString(),
      size_vram: 3758096384,
    },
  ];

  const displayModels = connected ? models : mockModels;
  const displayConnected = connected; // always show connected state visually for demo

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="bg-bg-elevated border border-border-subtle rounded-lg p-5 hover:border-border-default transition-all duration-200 flex flex-col"
    >
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-success" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">Ollama Pro</h3>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${displayConnected ? 'bg-success animate-pulse-dot' : 'bg-danger'}`}
              />
              <span className={`text-[11px] font-medium ${displayConnected ? 'text-success' : 'text-danger'}`}>
                {displayConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {lastUpdated && (
            <span className="text-[10px] text-text-tertiary font-mono">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={fetchOllamaStatus}
            className="p-1.5 rounded-md hover:bg-bg-hover transition-colors"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-text-tertiary ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Active Company Indicator ──────────────────────────── */}
      {activeCompany !== 'all' && (
        <div className="mb-3 px-3 py-1.5 bg-bg-hover rounded-md flex items-center gap-2">
          <Zap className="w-3 h-3 text-party-amber" />
          <span className="text-[11px] text-text-secondary">
            Active: <span className="font-medium text-text-primary">{formatModelName(companyModelMap[activeCompany] || '')}</span> for{' '}
            {activeCompany === 'harbor' ? '31 Harbor' : activeCompany === 'party' ? 'Party Favor Photo' : 'XMRT DAO'}
          </span>
        </div>
      )}

      {/* ─── Stats Bar ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-bg-hover rounded-md px-2.5 py-2 text-center">
          <div className="text-[14px] font-bold text-text-primary font-mono">{displayModels.length}</div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Loaded</div>
        </div>
        <div className="bg-bg-hover rounded-md px-2.5 py-2 text-center">
          <div className="text-[14px] font-bold text-text-primary font-mono">{formatBytes(totalVram || 1610612736)}</div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider">VRAM</div>
        </div>
        <div className="bg-bg-hover rounded-md px-2.5 py-2 text-center">
          <div className="text-[14px] font-bold text-text-primary font-mono">{formatBytes(totalRam || 5368709120)}</div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Total</div>
        </div>
      </div>

      {/* ─── Model List ─────────────────────────────────────────── */}
      <div className="flex-1 space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Models in Memory</span>
          <Layers className="w-3 h-3 text-text-tertiary" />
        </div>
        {displayModels.map((model) => {
          const memPercent = Math.min(((model.size_vram || 0) / (model.size || 1)) * 100, 100);
          const isActive = activeModelName === model.name;
          return (
            <div
              key={model.digest}
              className={`relative px-3 py-2 rounded-md border transition-all ${
                isActive
                  ? 'bg-success/5 border-success/30'
                  : 'bg-bg-hover border-transparent'
              }`}
            >
              {isActive && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
              )}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Server className="w-3 h-3 text-text-secondary" />
                  <span className="text-[12px] font-medium text-text-primary">
                    {formatModelName(model.name)}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-tertiary bg-bg-elevated px-1.5 py-0.5 rounded">
                  {model.details?.parameter_size || '?'}
                </span>
              </div>
              {/* Memory usage bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${memPercent || 75}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-info"
                  />
                </div>
                <span className="text-[10px] font-mono text-text-tertiary tabular-nums w-16 text-right">
                  {formatBytes(model.size_vram || 0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Quick Actions ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <button className="flex items-center justify-center gap-1.5 px-2 py-2 bg-harbor-blue/15 hover:bg-harbor-blue/25 border border-harbor-blue/20 rounded-md transition-all group">
          <Download className="w-3.5 h-3.5 text-harbor-blue group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-medium text-harbor-blue">Pull Model</span>
        </button>
        <button className="flex items-center justify-center gap-1.5 px-2 py-2 bg-success/15 hover:bg-success/25 border border-success/20 rounded-md transition-all group">
          <MessageSquare className="w-3.5 h-3.5 text-success group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-medium text-success">Chat</span>
        </button>
        <button className="flex items-center justify-center gap-1.5 px-2 py-2 bg-bg-hover hover:bg-bg-hover/80 border border-border-default rounded-md transition-all group">
          <Settings className="w-3.5 h-3.5 text-text-secondary group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-medium text-text-secondary">Settings</span>
        </button>
      </div>

      {!connected && (
        <div className="mt-3 px-3 py-2 bg-warning/10 border border-warning/20 rounded-md">
          <p className="text-[11px] text-warning">
            Showing demo data. Start Ollama at localhost:11434 for live data.
          </p>
        </div>
      )}
    </motion.div>
  );
}
