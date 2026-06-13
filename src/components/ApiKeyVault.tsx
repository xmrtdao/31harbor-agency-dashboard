import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Plus,
  Pencil,
  Trash2,
  TestTube,
  Check,
  X,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  Loader2,
  Globe,
  Sparkles,
  Bot,
  Mic,
  Zap,
  Cpu,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ─── Types ─────────────────────────────────────────────────────────────────

type KeyStatus = 'connected' | 'invalid' | 'untested';
type ProviderId = 'anthropic' | 'openai' | 'muapi' | 'elevenlabs' | 'groq' | 'google' | 'ollama' | 'together';
type CompanyId = 'harbor' | 'party' | 'xmrt' | 'all';

interface ApiKeyEntry {
  id: string;
  providerId: ProviderId;
  companyId: CompanyId;
  key: string;
  status: KeyStatus;
  createdAt: string;
  lastTested?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const PROVIDERS: { id: ProviderId; name: string; icon: typeof KeyRound; color: string }[] = [
  { id: 'anthropic', name: 'Anthropic', icon: Sparkles, color: '#D4A574' },
  { id: 'openai', name: 'OpenAI', icon: Bot, color: '#10A37F' },
  { id: 'muapi', name: 'MuAPI', icon: Globe, color: '#7B61FF' },
  { id: 'elevenlabs', name: 'ElevenLabs', icon: Mic, color: '#3ECF8E' },
  { id: 'groq', name: 'Groq', icon: Zap, color: '#F55036' },
  { id: 'google', name: 'Google', icon: Globe, color: '#4285F4' },
  { id: 'ollama', name: 'Ollama', icon: Cpu, color: '#F9A03E' },
  { id: 'together', name: 'Together', icon: Shield, color: '#0EA5E9' },
];

const COMPANIES: { id: CompanyId; name: string; color: string }[] = [
  { id: 'harbor', name: '31 Harbor', color: '#0A84FF' },
  { id: 'party', name: 'Party Favor Photo', color: '#F5A623' },
  { id: 'xmrt', name: 'XMRT DAO', color: '#7B61FF' },
  { id: 'all', name: 'All Companies', color: '#8B95A5' },
];

// ─── Simple XOR "encryption" for stored keys ───────────────────────────────

const XOR_KEY = 'SuiteAI-v4-KeyVault-2024';

function xorEncrypt(plaintext: string): string {
  let result = '';
  for (let i = 0; i < plaintext.length; i++) {
    result += String.fromCharCode(plaintext.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
  }
  return btoa(result);
}

function xorDecrypt(ciphertext: string): string {
  try {
    const decoded = atob(ciphertext);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
    }
    return result;
  } catch {
    return '';
  }
}

function maskKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
}

// ─── Mock Data ─────────────────────────────────────────────────────────────

const INITIAL_KEYS: ApiKeyEntry[] = [
  {
    id: 'key-1',
    providerId: 'anthropic',
    companyId: 'harbor',
    key: xorEncrypt('sk-ant-api03-test-key-harbor-abc123'),
    status: 'connected',
    createdAt: '2025-01-15',
    lastTested: '2025-01-20 10:30',
  },
  {
    id: 'key-2',
    providerId: 'openai',
    companyId: 'party',
    key: xorEncrypt('sk-proj-test-key-party-xyz789'),
    status: 'connected',
    createdAt: '2025-01-18',
    lastTested: '2025-01-19 14:22',
  },
  {
    id: 'key-3',
    providerId: 'muapi',
    companyId: 'all',
    key: xorEncrypt('muapi-test-key-global-mno456'),
    status: 'invalid',
    createdAt: '2025-01-10',
    lastTested: '2025-01-20 09:15',
  },
  {
    id: 'key-4',
    providerId: 'groq',
    companyId: 'xmrt',
    key: xorEncrypt('gsk-test-key-xmrt-pqr321'),
    status: 'untested',
    createdAt: '2025-01-20',
  },
];

// ─── Component: StatusBadge ────────────────────────────────────────────────

function StatusBadge({ status }: { status: KeyStatus }) {
  const config = {
    connected: { color: 'bg-success/15 text-success border-success/30', dot: 'bg-success', label: 'Connected' },
    invalid: { color: 'bg-danger/15 text-danger border-danger/30', dot: 'bg-danger', label: 'Invalid' },
    untested: { color: 'bg-bg-hover text-text-secondary border-border-default', dot: 'bg-text-tertiary', label: 'Untested' },
  };
  const c = config[status];

  return (
    <Badge variant="outline" className={`text-[10px] ${c.color}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot} mr-1.5`} />
      {c.label}
    </Badge>
  );
}

// ─── Component: ProviderBadge ──────────────────────────────────────────────

function ProviderBadge({ providerId }: { providerId: ProviderId }) {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return null;
  const Icon = provider.icon;

  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" style={{ color: provider.color }} />
      <span className="text-[12px] font-medium text-text-primary">{provider.name}</span>
    </div>
  );
}

// ─── Component: CompanyDot ─────────────────────────────────────────────────

function CompanyDot({ companyId }: { companyId: CompanyId }) {
  const company = COMPANIES.find((c) => c.id === companyId);
  if (!company) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: company.color }} />
      <span className="text-[12px] text-text-secondary">{company.name}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function ApiKeyVault() {
  const [keys, setKeys] = useState<ApiKeyEntry[]>(INITIAL_KEYS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyEntry | null>(null);
  const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);

  // Form state
  const [formProvider, setFormProvider] = useState<ProviderId>('anthropic');
  const [formCompany, setFormCompany] = useState<CompanyId>('harbor');
  const [formKey, setFormKey] = useState('');

  const resetForm = () => {
    setFormProvider('anthropic');
    setFormCompany('harbor');
    setFormKey('');
    setEditingKey(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (entry: ApiKeyEntry) => {
    setEditingKey(entry);
    setFormProvider(entry.providerId);
    setFormCompany(entry.companyId);
    setFormKey(xorDecrypt(entry.key));
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formKey.trim()) return;

    const encrypted = xorEncrypt(formKey.trim());

    if (editingKey) {
      setKeys((prev) =>
        prev.map((k) =>
          k.id === editingKey.id
            ? { ...k, providerId: formProvider, companyId: formCompany, key: encrypted, status: 'untested' as KeyStatus }
            : k
        )
      );
    } else {
      const newEntry: ApiKeyEntry = {
        id: `key-${Date.now()}`,
        providerId: formProvider,
        companyId: formCompany,
        key: encrypted,
        status: 'untested',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setKeys((prev) => [...prev, newEntry]);
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleTest = (entry: ApiKeyEntry) => {
    setTestingKeyId(entry.id);
    setTimeout(() => {
      setKeys((prev) =>
        prev.map((k) =>
          k.id === entry.id
            ? {
                ...k,
                status: (Math.random() > 0.3 ? 'connected' : 'invalid') as KeyStatus,
                lastTested: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              }
            : k
        )
      );
      setTestingKeyId(null);
    }, 1500);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeyId((prev) => (prev === id ? null : id));
  };

  const getRevealedKey = (entry: ApiKeyEntry): string => {
    if (revealedKeyId === entry.id) {
      return xorDecrypt(entry.key);
    }
    return maskKey(xorDecrypt(entry.key));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-harbor-blue" />
            <h2 className="text-[18px] font-bold text-text-primary">API Key Vault</h2>
          </div>
          <p className="text-[12px] text-text-secondary mt-1">
            Secure API key management with XOR encryption
          </p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="bg-harbor-blue hover:bg-harbor-blue/90 text-white">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Key
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Keys', value: keys.length, color: '#0A84FF' },
          { label: 'Connected', value: keys.filter((k) => k.status === 'connected').length, color: '#22C55E' },
          { label: 'Invalid', value: keys.filter((k) => k.status === 'invalid').length, color: '#EF4444' },
          { label: 'Untested', value: keys.filter((k) => k.status === 'untested').length, color: '#8B95A5' },
        ].map((stat) => (
          <div key={stat.label} className="p-3 rounded-lg bg-bg-elevated border border-border-default">
            <div className="text-[20px] font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Keys Table */}
      <div className="rounded-lg border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="text-[11px] text-text-tertiary font-semibold uppercase tracking-wider">Provider</TableHead>
              <TableHead className="text-[11px] text-text-tertiary font-semibold uppercase tracking-wider">Company</TableHead>
              <TableHead className="text-[11px] text-text-tertiary font-semibold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[11px] text-text-tertiary font-semibold uppercase tracking-wider">Key</TableHead>
              <TableHead className="text-[11px] text-text-tertiary font-semibold uppercase tracking-wider w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {keys.map((entry) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-border-subtle hover:bg-bg-hover/50 transition-colors"
                >
                  <TableCell>
                    <ProviderBadge providerId={entry.providerId} />
                  </TableCell>
                  <TableCell>
                    <CompanyDot companyId={entry.companyId} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={entry.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                      <code className="text-[11px] text-text-secondary font-mono">
                        {getRevealedKey(entry)}
                      </code>
                      <button
                        onClick={() => toggleReveal(entry.id)}
                        className="p-1 rounded hover:bg-bg-hover transition-colors"
                      >
                        {revealedKeyId === entry.id ? (
                          <EyeOff className="w-3 h-3 text-text-tertiary" />
                        ) : (
                          <Eye className="w-3 h-3 text-text-tertiary" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleTest(entry)}
                        disabled={testingKeyId === entry.id}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                      >
                        {testingKeyId === entry.id ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <TestTube className="w-3 h-3 mr-1" />
                        )}
                        Test
                      </Button>
                      <Button
                        onClick={() => handleOpenEdit(entry)}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(entry.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px] text-danger hover:text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>

            {keys.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <KeyRound className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                  <p className="text-[13px] text-text-secondary">No API keys stored</p>
                  <p className="text-[11px] text-text-tertiary mt-1">Click "Add Key" to get started</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-medium text-warning">Security Notice</p>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Keys are encrypted with XOR — not production-grade. For production, use a proper secrets manager like HashiCorp Vault or AWS Secrets Manager.
          </p>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-bg-elevated border-border-default">
          <DialogHeader>
            <DialogTitle className="text-text-primary flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-harbor-blue" />
              {editingKey ? 'Edit API Key' : 'Add API Key'}
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              {editingKey ? 'Update the key details below.' : 'Store a new API key in the vault.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Provider */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-secondary">Provider</label>
              <div className="grid grid-cols-4 gap-1.5">
                {PROVIDERS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setFormProvider(p.id)}
                      className={`
                        flex flex-col items-center gap-1 p-2 rounded-md border transition-all text-center
                        ${formProvider === p.id
                          ? 'bg-bg-hover border-opacity-100'
                          : 'bg-bg-base border-border-default hover:bg-bg-hover'
                        }
                      `}
                      style={formProvider === p.id ? { borderColor: p.color } : {}}
                    >
                      <Icon className="w-4 h-4" style={{ color: p.color }} />
                      <span className="text-[9px] text-text-secondary">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-secondary">Company</label>
              <div className="flex items-center gap-2">
                {COMPANIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFormCompany(c.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[11px] font-medium transition-all
                      ${formCompany === c.id
                        ? 'bg-bg-hover'
                        : 'bg-bg-base border-border-default hover:bg-bg-hover'
                      }
                    `}
                    style={formCompany === c.id ? { borderColor: c.color, color: c.color } : {}}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-secondary">API Key</label>
              <Input
                type="password"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                placeholder="sk-..."
                className="bg-bg-input border-border-default text-[12px]"
              />
              <p className="text-[10px] text-text-tertiary">
                Key will be XOR encrypted before storage
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDialogOpen(false); resetForm(); }}
              size="sm"
              className="text-[12px]"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formKey.trim()}
              size="sm"
              className="bg-harbor-blue hover:bg-harbor-blue/90 text-white text-[12px]"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {editingKey ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
