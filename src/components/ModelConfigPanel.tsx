import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Cpu,
  Monitor,
  Video,
  ImageIcon,
  Music,
  Check,
  ChevronDown,
  TestTube,
  Download,
  Link2,
  Sparkles,
  Code2,
  Terminal,
  BrainCircuit,
  Pencil,
  Wrench,
  Save,
  Loader2,
  Globe,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ─── Types ─────────────────────────────────────────────────────────────────

interface CloudProvider {
  id: string;
  name: string;
  color: string;
  models: CloudModel[];
}

interface CloudModel {
  id: string;
  name: string;
  contextWindow: string;
  costPer1k: string;
}

interface Harness {
  id: string;
  name: string;
  description: string;
  icon: typeof Code2;
  color: string;
  provider: string;
}

interface VideoModel {
  id: string;
  name: string;
  tagline: string;
}

interface ImageModel {
  id: string;
  name: string;
  tagline: string;
}

interface AudioModel {
  id: string;
  name: string;
  tagline: string;
}

type CompanyId = 'harbor' | 'party' | 'xmrt';

// ─── Constants ─────────────────────────────────────────────────────────────

const COMPANIES: { id: CompanyId; name: string; color: string }[] = [
  { id: 'harbor', name: '31 Harbor', color: '#0A84FF' },
  { id: 'party', name: 'Party Favor Photo', color: '#F5A623' },
  { id: 'xmrt', name: 'XMRT DAO', color: '#7B61FF' },
];

const CLOUD_PROVIDERS: CloudProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    color: '#D4A574',
    models: [
      { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', contextWindow: '200K', costPer1k: '$3 / $15' },
      { id: 'claude-opus-4', name: 'Claude Opus 4', contextWindow: '200K', costPer1k: '$15 / $75' },
      { id: 'claude-haiku-4', name: 'Claude Haiku 4', contextWindow: '200K', costPer1k: '$0.25 / $1.25' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    color: '#10A37F',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: '128K', costPer1k: '$5 / $15' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: '128K', costPer1k: '$0.15 / $0.60' },
      { id: 'o3-mini', name: 'o3 Mini', contextWindow: '200K', costPer1k: '$1.10 / $4.40' },
    ],
  },
  {
    id: 'qwen',
    name: 'Qwen',
    color: '#6B5CE7',
    models: [
      { id: 'qwen-max', name: 'Qwen Max', contextWindow: '128K', costPer1k: '$2.80 / $8.40' },
      { id: 'qwen-plus', name: 'Qwen Plus', contextWindow: '128K', costPer1k: '$1.00 / $3.00' },
      { id: 'qwen-turbo', name: 'Qwen Turbo', contextWindow: '128K', costPer1k: '$0.20 / $0.60' },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    color: '#4285F4',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', contextWindow: '1M', costPer1k: '$3.50 / $10.50' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', contextWindow: '1M', costPer1k: '$0.50 / $1.50' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    color: '#F55036',
    models: [
      { id: 'llama-3-groq', name: 'Llama 3 (Groq)', contextWindow: '128K', costPer1k: '$0.30 / $0.60' },
      { id: 'mixtral-groq', name: 'Mixtral (Groq)', contextWindow: '128K', costPer1k: '$0.27 / $0.54' },
    ],
  },
  {
    id: 'ollama-cloud',
    name: 'Ollama',
    color: '#F9A03E',
    models: [
      { id: 'llama-3-local', name: 'Llama 3 (Local)', contextWindow: '128K', costPer1k: 'Free' },
      { id: 'mistral-local', name: 'Mistral (Local)', contextWindow: '128K', costPer1k: 'Free' },
    ],
  },
];

const HARNESS_OPTIONS: Harness[] = [
  { id: 'claude-code', name: 'Claude Code', description: 'Agentic coding with Claude — edit files, run tests, git ops', icon: Code2, color: '#D4A574', provider: 'Anthropic' },
  { id: 'opencode', name: 'OpenCode', description: 'Open-source AI coding assistant with multi-model support', icon: Terminal, color: '#10A37F', provider: 'OpenAI' },
  { id: 'qwen-code', name: 'Qwen Code', description: 'Alibaba code-specialized model — strong at CN languages', icon: BrainCircuit, color: '#6B5CE7', provider: 'Qwen' },
  { id: 'hermes-code', name: 'Hermes', description: 'Nous Research — general-purpose instruct following', icon: Sparkles, color: '#F55036', provider: 'Groq' },
  { id: 'pi', name: 'Pi', description: 'Inflection AI — conversational, empathetic coding help', icon: Pencil, color: '#4285F4', provider: 'Google' },
  { id: 'aider', name: 'Aider', description: 'AI pair programming in terminal — multi-file edits', icon: Wrench, color: '#F5A623', provider: 'Ollama' },
];

const VIDEO_MODELS: VideoModel[] = [
  { id: 'sora', name: 'Sora', tagline: 'OpenAI — photorealistic video generation' },
  { id: 'veo-2', name: 'Veo 2', tagline: 'Google — cinematic video with physics' },
  { id: 'kling', name: 'Kling', tagline: 'Kuaishou — 2 min clips, strong motion' },
  { id: 'luma', name: 'Luma', tagline: 'Dream Machine — fast video from images' },
  { id: 'runway', name: 'Runway', tagline: 'Gen-3 Alpha — professional video AI' },
  { id: 'pika', name: 'Pika', tagline: 'Pika 2.0 — creative video generation' },
];

const IMAGE_MODELS: ImageModel[] = [
  { id: 'flux-pro', name: 'Flux Pro', tagline: 'Black Forest — best-in-class quality' },
  { id: 'flux-dev', name: 'Flux Dev', tagline: 'Black Forest — open, customizable' },
  { id: 'dall-e-3', name: 'DALL-E 3', tagline: 'OpenAI — follows prompts precisely' },
  { id: 'sd3', name: 'SD3', tagline: 'Stability AI — open weights' },
  { id: 'ideogram', name: 'Ideogram', tagline: 'Best-in-class text-in-image' },
  { id: 'recraft', name: 'Recraft', tagline: 'Vector + raster generation' },
];

const AUDIO_MODELS: AudioModel[] = [
  { id: 'suno', name: 'Suno', tagline: 'AI music generation — vocals + instruments' },
  { id: 'elevenlabs', name: 'ElevenLabs', tagline: 'Best-in-class voice cloning + TTS' },
  { id: 'udio', name: 'Udio', tagline: 'AI music — high-fidelity audio' },
  { id: 'gpt-4o-voice', name: 'GPT-4o Voice', tagline: 'OpenAI — native speech I/O' },
  { id: 'gemini-audio', name: 'Gemini Audio', tagline: 'Google — multilingual speech' },
];

const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

// ─── Component: ProviderCard ───────────────────────────────────────────────

function ProviderCard({
  provider,
  isSelected,
  onClick,
}: {
  provider: CloudProvider;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 text-center
        ${isSelected
          ? 'bg-bg-hover border-opacity-100 shadow-lg'
          : 'bg-bg-elevated border-border-default hover:bg-bg-hover hover:border-border-focus'
        }
      `}
      style={isSelected ? { borderColor: provider.color } : {}}
    >
      {/* Top border color indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-lg transition-opacity"
        style={{ backgroundColor: provider.color, opacity: isSelected ? 1 : 0.3 }}
      />

      {isSelected && (
        <div className="absolute top-2 right-2">
          <Check className="w-3.5 h-3.5" style={{ color: provider.color }} />
        </div>
      )}

      {/* Provider icon placeholder — colored circle */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${provider.color}15` }}
      >
        <Cloud className="w-5 h-5" style={{ color: provider.color }} />
      </div>

      <span className="text-[12px] font-semibold text-text-primary">{provider.name}</span>
    </button>
  );
}

// ─── Component: ModelDropdown ──────────────────────────────────────────────

function ModelDropdown({
  models,
  selectedId,
  onSelect,
}: {
  models: CloudModel[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = models.find((m) => m.id === selectedId) || models[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-md bg-bg-input border border-border-default hover:border-border-focus transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-text-secondary" />
          <span className="text-[12px] text-text-primary">{selected?.name || 'Select model'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] bg-bg-hover text-text-secondary">
            {selected?.contextWindow} ctx
          </Badge>
          <Badge variant="outline" className="text-[9px] bg-bg-hover text-text-secondary">
            {selected?.costPer1k}
          </Badge>
          <ChevronDown className={`w-3.5 h-3.5 text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-border-default rounded-md shadow-xl z-20 overflow-hidden"
        >
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => { onSelect(model.id); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-bg-hover transition-colors text-left ${
                model.id === selectedId ? 'bg-bg-hover' : ''
              }`}
            >
              <span className="text-[12px] text-text-primary">{model.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-tertiary">{model.contextWindow}</span>
                <span className="text-[10px] text-text-tertiary">{model.costPer1k}</span>
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── Component: HarnessCard ────────────────────────────────────────────────

function HarnessCard({
  harness,
  isSelected,
  onClick,
}: {
  harness: Harness;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = harness.icon;

  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 text-left
        ${isSelected
          ? 'bg-bg-hover shadow-lg'
          : 'bg-bg-elevated border-border-default hover:bg-bg-hover hover:border-border-focus'
        }
      `}
      style={isSelected ? { borderColor: harness.color } : {}}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${harness.color}15` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: harness.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-text-primary">{harness.name}</span>
          {isSelected && <Check className="w-3.5 h-3.5 text-success" />}
        </div>
        <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{harness.description}</p>
        <Badge variant="outline" className="mt-1.5 text-[9px]" style={{ borderColor: `${harness.color}40`, color: harness.color }}>
          {harness.provider}
        </Badge>
      </div>
    </button>
  );
}

// ─── Component: MediaModelCard ─────────────────────────────────────────────

function MediaModelCard({
  id,
  name,
  tagline,
  isSelected,
  onClick,
  color,
}: {
  id: string;
  name: string;
  tagline: string;
  isSelected: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-start gap-1.5 p-3 rounded-lg border transition-all duration-200 text-left
        ${isSelected
          ? 'bg-bg-hover shadow-md'
          : 'bg-bg-elevated border-border-default hover:bg-bg-hover hover:border-border-focus'
        }
      `}
      style={isSelected ? { borderColor: color } : {}}
    >
      <div className="flex items-center gap-2 w-full">
        <span className="text-[12px] font-semibold text-text-primary">{name}</span>
        {isSelected && <Check className="w-3.5 h-3.5 text-success ml-auto" />}
      </div>
      <p className="text-[10px] text-text-tertiary leading-relaxed">{tagline}</p>
    </button>
  );
}

// ─── Component: LocalOllamaSection ─────────────────────────────────────────

function LocalOllamaSection() {
  const [url, setUrl] = useState(DEFAULT_OLLAMA_URL);
  const [connected, setConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3-local');

  const localModels = [
    { id: 'llama-3-local', name: 'Llama 3.1 8B', size: '4.7 GB' },
    { id: 'mistral-local', name: 'Mistral 7B', size: '4.1 GB' },
    { id: 'codellama', name: 'CodeLlama 7B', size: '3.8 GB' },
    { id: 'phi-4', name: 'Phi-4 14B', size: '7.6 GB' },
  ];

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setConnected(true);
      setTesting(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated border border-border-default">
        <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-success' : 'bg-danger'} animate-pulse-dot`} />
        <span className="text-[13px] font-medium text-text-primary">
          {connected ? 'Connected to Ollama' : 'Disconnected'}
        </span>
        <Badge variant="outline" className={`ml-auto text-[10px] ${connected ? 'bg-success/10 text-success border-success/30' : 'bg-danger/10 text-danger border-danger/30'}`}>
          {connected ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* URL Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-9 text-[12px] bg-bg-input border-border-default"
            placeholder={DEFAULT_OLLAMA_URL}
          />
        </div>
        <Button
          onClick={handleTest}
          disabled={testing}
          variant="outline"
          size="sm"
          className="h-9 text-[12px]"
        >
          {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <TestTube className="w-3.5 h-3.5 mr-1.5" />}
          Test
        </Button>
      </div>

      {/* Model Selector */}
      <div className="space-y-2">
        <label className="text-[12px] font-medium text-text-secondary">Local Model</label>
        <div className="relative">
          <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md bg-bg-input border border-border-default text-[12px] text-text-primary focus:border-harbor-blue focus:outline-none appearance-none"
          >
            {localModels.map((m) => (
              <option key={m.id} value={m.id}>{m.name} — {m.size}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-[11px]">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Pull Model
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-[11px]">
          <KeyRound className="w-3.5 h-3.5 mr-1.5" />
          Configure
        </Button>
      </div>
    </div>
  );
}

// ─── Company Panel ─────────────────────────────────────────────────────────

function CompanyPanel({ companyId }: { companyId: CompanyId }) {
  const company = COMPANIES.find((c) => c.id === companyId)!;

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Record<string, string>>({});
  const [selectedHarness, setSelectedHarness] = useState<string>('claude-code');
  const [selectedVideo, setSelectedVideo] = useState<string>('luma');
  const [selectedImage, setSelectedImage] = useState<string>('flux-pro');
  const [selectedAudio, setSelectedAudio] = useState<string>('elevenlabs');
  const [muApiKey, setMuApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    if (!selectedModel[providerId]) {
      const provider = CLOUD_PROVIDERS.find((p) => p.id === providerId);
      if (provider) {
        setSelectedModel((prev) => ({ ...prev, [providerId]: provider.models[0].id }));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* ── Cloud LLM Section ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Cloud className="w-4 h-4" style={{ color: company.color }} />
          <h3 className="text-[14px] font-bold text-text-primary">Cloud LLM Provider</h3>
          <Badge variant="outline" className="ml-auto text-[9px] bg-bg-hover text-text-secondary">
            6 providers
          </Badge>
        </div>

        {/* Provider Grid */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          {CLOUD_PROVIDERS.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isSelected={selectedProvider === provider.id}
              onClick={() => handleProviderSelect(provider.id)}
            />
          ))}
        </div>

        {/* Model Dropdown */}
        <AnimatePresence>
          {selectedProvider && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-lg bg-bg-elevated border border-border-default">
                <label className="text-[11px] font-medium text-text-secondary mb-2 block">
                  Select model from {CLOUD_PROVIDERS.find((p) => p.id === selectedProvider)?.name}
                </label>
                <ModelDropdown
                  models={CLOUD_PROVIDERS.find((p) => p.id === selectedProvider)?.models || []}
                  selectedId={selectedModel[selectedProvider] || ''}
                  onSelect={(id) => setSelectedModel((prev) => ({ ...prev, [selectedProvider]: id }))}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Agent Harness Section ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="w-4 h-4" style={{ color: company.color }} />
          <h3 className="text-[14px] font-bold text-text-primary">Agent Harness</h3>
          <Badge variant="outline" className="ml-auto text-[9px] bg-bg-hover text-text-secondary">
            Coding agent
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {HARNESS_OPTIONS.map((harness) => (
            <HarnessCard
              key={harness.id}
              harness={harness}
              isSelected={selectedHarness === harness.id}
              onClick={() => setSelectedHarness(harness.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Local LLM Section ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4" style={{ color: company.color }} />
          <h3 className="text-[14px] font-bold text-text-primary">Local LLM (Ollama)</h3>
          <Badge variant="outline" className="ml-auto text-[9px] bg-bg-hover text-text-secondary">
            On-premise
          </Badge>
        </div>

        <div className="p-4 rounded-lg bg-bg-base border border-border-default">
          <LocalOllamaSection />
        </div>
      </section>

      {/* ── Multimodal (MuAPI) Section ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="w-4 h-4" style={{ color: company.color }} />
          <h3 className="text-[14px] font-bold text-text-primary">Multimodal (MuAPI)</h3>
          <Badge variant="outline" className="ml-auto text-[9px] bg-bg-hover text-text-secondary">
            Video · Image · Audio
          </Badge>
        </div>

        <div className="space-y-4 p-4 rounded-lg bg-bg-base border border-border-default">
          {/* API Key */}
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-text-tertiary" />
            <Input
              type="password"
              value={muApiKey}
              onChange={(e) => setMuApiKey(e.target.value)}
              placeholder="MuAPI key"
              className="flex-1 text-[12px] bg-bg-input border-border-default"
            />
          </div>

          {/* Video Models */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-3.5 h-3.5 text-text-secondary" />
              <label className="text-[11px] font-medium text-text-secondary">Video Model</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {VIDEO_MODELS.map((m) => (
                <MediaModelCard
                  key={m.id}
                  id={m.id}
                  name={m.name}
                  tagline={m.tagline}
                  isSelected={selectedVideo === m.id}
                  onClick={() => setSelectedVideo(m.id)}
                  color="#7B61FF"
                />
              ))}
            </div>
          </div>

          {/* Image Models */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-3.5 h-3.5 text-text-secondary" />
              <label className="text-[11px] font-medium text-text-secondary">Image Model</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {IMAGE_MODELS.map((m) => (
                <MediaModelCard
                  key={m.id}
                  id={m.id}
                  name={m.name}
                  tagline={m.tagline}
                  isSelected={selectedImage === m.id}
                  onClick={() => setSelectedImage(m.id)}
                  color="#0A84FF"
                />
              ))}
            </div>
          </div>

          {/* Audio Models */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-3.5 h-3.5 text-text-secondary" />
              <label className="text-[11px] font-medium text-text-secondary">Audio Model</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {AUDIO_MODELS.map((m) => (
                <MediaModelCard
                  key={m.id}
                  id={m.id}
                  name={m.name}
                  tagline={m.tagline}
                  isSelected={selectedAudio === m.id}
                  onClick={() => setSelectedAudio(m.id)}
                  color="#F5A623"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Save Button ── */}
      <div className="flex justify-end pt-4 border-t border-border-subtle">
        <Button
          onClick={handleSave}
          className="px-6"
          style={{ backgroundColor: company.color }}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function ModelConfigPanel() {
  const [activeCompany, setActiveCompany] = useState<CompanyId>('harbor');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-[18px] font-bold text-text-primary">AI Model Configuration</h2>
        <p className="text-[12px] text-text-secondary mt-1">
          Configure LLM providers, coding harnesses, and multimodal models per company
        </p>
      </div>

      {/* Company Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-elevated border border-border-default w-fit">
        {COMPANIES.map((company) => (
          <button
            key={company.id}
            onClick={() => setActiveCompany(company.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-all duration-200
              ${activeCompany === company.id
                ? 'text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }
            `}
            style={activeCompany === company.id ? { backgroundColor: company.color } : {}}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeCompany === company.id ? '#fff' : company.color }}
            />
            {company.name}
          </button>
        ))}
      </div>

      {/* Company Content */}
      <AnimatePresence mode="wait">
        <CompanyPanel key={activeCompany} companyId={activeCompany} />
      </AnimatePresence>
    </div>
  );
}
