import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Send,
  Shield,
  ShieldOff,
  Hash,
  AlertTriangle,
  Globe,
  Bot,
  ChevronDown,
  AtSign,
  Zap,
  MessageSquare,
  Route,
  Bell,
  Search,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Layout from '@/components/Layout';

// ─── Types ─────────────────────────────────────────────────────────────────

type MessageType = 'chat' | 'event' | 'routing' | 'alert';
type ChannelType = 'company' | 'commons' | 'system';

interface Agent {
  id: string;
  name: string;
  shortName: string;
  color: string;
  company?: string;
}

interface ChatMessage {
  id: string;
  channelId: string;
  agentId: string;
  content: string;
  type: MessageType;
  timestamp: string;
  mentions?: string[];
}

interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  companyId?: string;
  companyColor?: string;
  shielded: boolean;
  peerCount: number;
  unread: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const AGENTS: Record<string, Agent> = {
  cblr: { id: 'cblr', name: 'Cross-Business Lead Router', shortName: 'CBLR', color: '#0EA5E9' },
  abba: { id: 'abba', name: 'Autonomous Business Agent', shortName: 'ABBA', color: '#22C55E' },
  ama: { id: 'ama', name: 'Autonomous Marketing Agency', shortName: 'AMA', color: '#7B61FF' },
  hermes: { id: 'hermes', name: 'Hermes Mesh Router', shortName: 'Hermes', color: '#F59E0B' },
  vex: { id: 'vex', name: 'Vex Optimizer', shortName: 'Vex', color: '#EF4444' },
  system: { id: 'system', name: 'System', shortName: 'SYS', color: '#8B95A5' },
};

const INITIAL_CHANNELS: Channel[] = [
  { id: 'harbor-internal', name: 'harbor-internal', type: 'company', companyId: 'harbor', companyColor: '#0A84FF', shielded: true, peerCount: 4, unread: 3 },
  { id: 'party-internal', name: 'party-internal', type: 'company', companyId: 'party', companyColor: '#F5A623', shielded: true, peerCount: 3, unread: 2 },
  { id: 'xmrt-internal', name: 'xmrt-internal', type: 'company', companyId: 'xmrt', companyColor: '#7B61FF', shielded: true, peerCount: 5, unread: 4 },
  { id: 'the-commons', name: 'the-commons', type: 'commons', shielded: false, peerCount: 12, unread: 0 },
  { id: 'system-alerts', name: 'system-alerts', type: 'system', shielded: false, peerCount: 2, unread: 1 },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  // harbor-internal
  { id: 'm1', channelId: 'harbor-internal', agentId: 'cblr', content: 'New lead scored 94: Oceanview Properties looking for luxury staging', type: 'chat', timestamp: '10:42 AM' },
  { id: 'm2', channelId: 'harbor-internal', agentId: 'abba', content: 'Auto-quoting $2,400 for Harbor View Estate project', type: 'event', timestamp: '10:43 AM' },
  { id: 'm3', channelId: 'harbor-internal', agentId: 'ama', content: "Started 'Summer Listings' campaign — budget $5K", type: 'chat', timestamp: '10:45 AM' },
  { id: 'm4', channelId: 'harbor-internal', agentId: 'cblr', content: '@abba Hold — lead flagged for review: score variance > 10pts', type: 'alert', timestamp: '10:46 AM', mentions: ['abba'] },
  { id: 'm5', channelId: 'harbor-internal', agentId: 'abba', content: 'Acknowledged. Awaiting human approval for quote dispatch.', type: 'routing', timestamp: '10:47 AM' },

  // party-internal
  { id: 'm6', channelId: 'party-internal', agentId: 'cblr', content: 'Scraped 12 new wedding venues in DC area', type: 'chat', timestamp: '09:15 AM' },
  { id: 'm7', channelId: 'party-internal', agentId: 'abba', content: 'Quote generated for Johnson-Smith wedding: $1,895', type: 'event', timestamp: '09:18 AM' },
  { id: 'm8', channelId: 'party-internal', agentId: 'cblr', content: 'Lead shared from XMRT DAO — tech conference needs photo booth', type: 'routing', timestamp: '09:22 AM' },

  // xmrt-internal
  { id: 'm9', channelId: 'xmrt-internal', agentId: 'hermes', content: 'New mesh peer discovered: node-7f3a in San Jose', type: 'event', timestamp: '11:02 AM' },
  { id: 'm10', channelId: 'xmrt-internal', agentId: 'vex', content: 'ROCm kernel optimization complete — 34% speedup', type: 'chat', timestamp: '11:05 AM' },
  { id: 'm11', channelId: 'xmrt-internal', agentId: 'cblr', content: 'Referral from Party Favor Photo — blockchain meetup needs coverage', type: 'routing', timestamp: '11:08 AM' },
  { id: 'm12', channelId: 'xmrt-internal', agentId: 'hermes', content: 'Bandwidth test: 847 Mbps avg, 12ms latency to node-7f3a', type: 'event', timestamp: '11:10 AM' },

  // the-commons
  { id: 'm13', channelId: 'the-commons', agentId: 'cblr', content: '[Harbor] Shared: High-value lead — corporate retreat needs photo + venue', type: 'chat', timestamp: '09:30 AM' },
  { id: 'm14', channelId: 'the-commons', agentId: 'abba', content: '[Party] Cross-sell opportunity: wedding couple buying vacation home', type: 'chat', timestamp: '09:35 AM' },
  { id: 'm15', channelId: 'the-commons', agentId: 'ama', content: "[XMRT] New campaign: 'Decentralized Events' targeting all 3 verticals", type: 'chat', timestamp: '09:40 AM' },

  // system-alerts
  { id: 'm16', channelId: 'system-alerts', agentId: 'system', content: 'GossipHub mesh sync: 3/5 peers online — 2 nodes unreachable', type: 'alert', timestamp: '08:00 AM' },
  { id: 'm17', channelId: 'system-alerts', agentId: 'system', content: 'CBLR model retrained — accuracy 94.2%, F1: 0.91', type: 'event', timestamp: '07:30 AM' },
];

const QUICK_ACTIONS = [
  { label: '/status', desc: 'Check mesh status' },
  { label: '/route', desc: 'Route a lead' },
  { label: '/quote', desc: 'Generate quote' },
  { label: '/campaign', desc: 'Launch campaign' },
  { label: '/shield', desc: 'Toggle shield' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function getMessageTypeColor(type: MessageType): string {
  switch (type) {
    case 'chat': return 'bg-bg-elevated border-border-default';
    case 'event': return 'bg-info/5 border-info/20';
    case 'routing': return 'bg-success/5 border-success/20';
    case 'alert': return 'bg-danger/5 border-danger/20';
  }
}

function getMessageTypeIcon(type: MessageType) {
  switch (type) {
    case 'chat': return MessageSquare;
    case 'event': return Zap;
    case 'routing': return Route;
    case 'alert': return Bell;
  }
}

function getMessageTypeBadgeColor(type: MessageType): string {
  switch (type) {
    case 'chat': return 'bg-bg-hover text-text-secondary border-border-default';
    case 'event': return 'bg-info/15 text-info border-info/30';
    case 'routing': return 'bg-success/15 text-success border-success/30';
    case 'alert': return 'bg-danger/15 text-danger border-danger/30';
  }
}

function getChannelIcon(type: ChannelType) {
  switch (type) {
    case 'company': return Hash;
    case 'commons': return Globe;
    case 'system': return AlertTriangle;
  }
}

// ─── Component: ChannelList ────────────────────────────────────────────────

function ChannelList({
  channels,
  activeChannelId,
  onSelect,
  onToggleShield,
}: {
  channels: Channel[];
  activeChannelId: string;
  onSelect: (id: string) => void;
  onToggleShield: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-success" />
          <h2 className="text-[15px] font-bold text-text-primary">GossipHub</h2>
          <Badge variant="outline" className="ml-auto text-[10px] bg-success/10 text-success border-success/30">
            P2P Mesh
          </Badge>
        </div>
        <p className="text-[11px] text-text-tertiary mt-1">Agent-to-agent communication</p>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
          <Input
            placeholder="Search channels..."
            className="h-8 pl-8 text-[12px] bg-bg-input border-border-default"
          />
        </div>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-2">
          {channels.map((channel) => {
            const isActive = channel.id === activeChannelId;
            const Icon = getChannelIcon(channel.type);

            return (
              <button
                key={channel.id}
                onClick={() => onSelect(channel.id)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-150 group relative
                  ${isActive ? 'bg-bg-hover border-l-[3px] border-harbor-blue' : 'hover:bg-bg-hover/50 border-l-[3px] border-transparent'}
                `}
              >
                {/* Channel Icon */}
                <div className="relative shrink-0">
                  <Icon className="w-4 h-4 text-text-secondary" />
                  {channel.companyColor && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-bg-elevated"
                      style={{ backgroundColor: channel.companyColor }}
                    />
                  )}
                </div>

                {/* Channel Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium text-text-primary truncate">
                      {channel.name}
                    </span>
                    {channel.unread > 0 && (
                      <Badge className="h-4 min-w-4 px-1 text-[10px] bg-harbor-blue text-white">
                        {channel.unread}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      {channel.peerCount} peers
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] h-4 px-1 ${
                        channel.type === 'company' ? 'bg-bg-hover' :
                        channel.type === 'commons' ? 'bg-success/10 text-success border-success/30' :
                        'bg-warning/10 text-warning border-warning/30'
                      }`}
                    >
                      {channel.type}
                    </Badge>
                  </div>
                </div>

                {/* Shield Toggle (company channels only) */}
                {channel.type === 'company' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleShield(channel.id);
                          }}
                          className={`
                            shrink-0 p-1 rounded transition-colors
                            ${channel.shielded ? 'text-success hover:text-success/80' : 'text-text-tertiary hover:text-warning'}
                          `}
                        >
                          {channel.shielded ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-[11px]">{channel.shielded ? 'Shield UP — agents hidden' : 'Shield DOWN — agents visible'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Mesh Status Footer */}
      <div className="px-4 py-3 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
          <span className="text-[11px] text-text-secondary">Mesh: 3/5 peers</span>
          <span className="text-[11px] text-text-tertiary ml-auto">847 Mbps</span>
        </div>
      </div>
    </div>
  );
}

// ─── Component: MessageBubble ──────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const agent = AGENTS[message.agentId] || AGENTS.system;
  const TypeIcon = getMessageTypeIcon(message.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-3 p-3 rounded-lg border ${getMessageTypeColor(message.type)} mb-2`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 self-start"
        style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
      >
        {agent.shortName[0]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-semibold" style={{ color: agent.color }}>
            {agent.shortName}
          </span>
          <Badge variant="outline" className={`text-[9px] h-4 px-1 ${getMessageTypeBadgeColor(message.type)}`}>
            <TypeIcon className="w-2.5 h-2.5 mr-0.5" />
            {message.type}
          </Badge>
          <span className="text-[10px] text-text-tertiary flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {message.timestamp}
          </span>
        </div>

        <p className="text-[13px] text-text-primary mt-1.5 leading-relaxed">
          {message.content.split(/(@\w+)/g).map((part, i) => {
            if (part.startsWith('@')) {
              return (
                <span key={i} className="text-harbor-blue font-medium bg-harbor-blue/10 px-1 rounded">
                  {part}
                </span>
              );
            }
            return part;
          })}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Component: MentionAutocomplete ────────────────────────────────────────

function MentionAutocomplete({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (agent: Agent) => void;
}) {
  const filtered = Object.values(AGENTS).filter(
    (a) => a.id !== 'system' && (a.shortName.toLowerCase().includes(query.toLowerCase()) || a.name.toLowerCase().includes(query.toLowerCase()))
  );

  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-full left-0 right-0 mb-2 bg-bg-elevated border border-border-default rounded-lg shadow-xl overflow-hidden z-20"
    >
      <div className="px-3 py-1.5 border-b border-border-subtle">
        <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Agents</span>
      </div>
      {filtered.map((agent) => (
        <button
          key={agent.id}
          onClick={() => onSelect(agent)}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-bg-hover transition-colors text-left"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
          >
            {agent.shortName[0]}
          </div>
          <div>
            <div className="text-[12px] font-medium text-text-primary">{agent.shortName}</div>
            <div className="text-[10px] text-text-tertiary">{agent.name}</div>
          </div>
        </button>
      ))}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function GossipHub() {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeChannelId, setActiveChannelId] = useState('harbor-internal');
  const [inputValue, setInputValue] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const channelMessages = messages.filter((m) => m.channelId === activeChannelId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length, activeChannelId]);

  // Handle input changes for @mentions
  const handleInputChange = (value: string) => {
    setInputValue(value);

    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true);
      setMentionQuery('');
    } else if (lastAtIndex !== -1 && !value.slice(lastAtIndex).includes(' ')) {
      setShowMentions(true);
      setMentionQuery(value.slice(lastAtIndex + 1));
    } else {
      setShowMentions(false);
    }

    if (value.startsWith('/')) {
      setShowQuickActions(true);
    } else {
      setShowQuickActions(false);
    }
  };

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      agentId: 'cblr',
      content: inputValue.trim(),
      type: inputValue.startsWith('@') ? 'routing' : inputValue.startsWith('!') ? 'alert' : 'chat',
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setShowMentions(false);
    setShowQuickActions(false);

    // Simulate response after short delay
    setTimeout(() => {
      const responses = [
        { content: 'Acknowledged. Processing...', agentId: 'abba' },
        { content: 'Received. Updating pipeline.', agentId: 'ama' },
        { content: 'Message relayed to mesh.', agentId: 'hermes' },
      ];
      const resp = responses[Math.floor(Math.random() * responses.length)];
      const respAgent = AGENTS[resp.agentId];

      const respMessage: ChatMessage = {
        id: `msg-${Date.now()}-r`,
        channelId: activeChannelId,
        agentId: resp.agentId,
        content: resp.content,
        type: 'event' as MessageType,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, respMessage]);
    }, 800 + Math.random() * 1200);
  }, [inputValue, activeChannelId]);

  const handleToggleShield = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === channelId) {
          const newShielded = !c.shielded;
          // Add system message when shield changes
          const systemMsg: ChatMessage = {
            id: `sys-${Date.now()}`,
            channelId,
            agentId: 'system',
            content: `Shield ${newShielded ? 'UP' : 'DOWN'} — agents are now ${newShielded ? 'hidden from' : 'visible in'} The Commons`,
            type: 'event',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((m) => [...m, systemMsg]);
          return { ...c, shielded: newShielded };
        }
        return c;
      })
    );
  };

  const handleMentionSelect = (agent: Agent) => {
    const lastAtIndex = inputValue.lastIndexOf('@');
    setInputValue(inputValue.slice(0, lastAtIndex) + `@${agent.shortName} `);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action + ' ');
    setShowQuickActions(false);
    inputRef.current?.focus();
  };

  return (
    <Layout>
      <div className="h-[calc(100dvh-7rem)] flex">
        {/* Left Sidebar */}
        <div className="w-[280px] shrink-0 border-r border-border-subtle bg-bg-elevated">
          <ChannelList
            channels={channels}
            activeChannelId={activeChannelId}
            onSelect={setActiveChannelId}
            onToggleShield={handleToggleShield}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-bg-base">
          {/* Channel Header */}
          <div className="h-14 shrink-0 border-b border-border-subtle flex items-center px-4 gap-3">
            {(() => {
              const Icon = getChannelIcon(activeChannel.type);
              return <Icon className="w-5 h-5 text-text-secondary" />;
            })()}
            <div>
              <h1 className="text-[15px] font-bold text-text-primary">{activeChannel.name}</h1>
              <p className="text-[11px] text-text-tertiary">
                {channelMessages.length} messages · {activeChannel.peerCount} peers online
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {activeChannel.shielded !== undefined && activeChannel.type === 'company' && (
                <Badge
                  variant="outline"
                  className={`text-[10px] ${activeChannel.shielded ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}`}
                >
                  {activeChannel.shielded ? <Shield className="w-3 h-3 mr-1" /> : <ShieldOff className="w-3 h-3 mr-1" />}
                  {activeChannel.shielded ? 'Shielded' : 'Exposed'}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] bg-bg-hover text-text-secondary">
                <Radio className="w-3 h-3 mr-1 text-success" />
                Live
              </Badge>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-1">
              <AnimatePresence>
                {channelMessages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="shrink-0 border-t border-border-subtle px-4 py-3 bg-bg-elevated relative">
            {/* Mention Autocomplete */}
            {showMentions && (
              <MentionAutocomplete query={mentionQuery} onSelect={handleMentionSelect} />
            )}

            {/* Quick Actions */}
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-4 right-4 mb-2 bg-bg-elevated border border-border-default rounded-lg shadow-xl overflow-hidden z-20"
              >
                <div className="px-3 py-1.5 border-b border-border-subtle">
                  <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Quick Commands</span>
                </div>
                {QUICK_ACTIONS.filter((a) => a.label.startsWith(inputValue.split(' ')[0])).map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.label)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-bg-hover transition-colors text-left"
                  >
                    <Zap className="w-4 h-4 text-text-secondary" />
                    <div>
                      <div className="text-[12px] font-medium text-text-primary">{action.label}</div>
                      <div className="text-[10px] text-text-tertiary">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                    if (e.key === 'Escape') {
                      setShowMentions(false);
                      setShowQuickActions(false);
                    }
                  }}
                  placeholder={`Message #${activeChannel.name}...`}
                  className="pl-9 pr-4 h-10 text-[13px] bg-bg-input border-border-default focus:border-harbor-blue"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                size="sm"
                className="h-10 px-4 bg-harbor-blue hover:bg-harbor-blue/90 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Input Hints */}
            <div className="flex items-center gap-3 mt-2 px-1">
              <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-bg-input rounded text-[9px] border border-border-default">@</kbd>
                Mention agent
              </span>
              <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-bg-input rounded text-[9px] border border-border-default">/</kbd>
                Commands
              </span>
              <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-bg-input rounded text-[9px] border border-border-default">!</kbd>
                Alert
              </span>
              <span className="text-[10px] text-text-tertiary ml-auto flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-bg-input rounded text-[9px] border border-border-default">Enter</kbd>
                Send
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
