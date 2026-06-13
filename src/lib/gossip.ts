// GossipHub -- libp2p-based P2P messaging for agent communication
// Uses WebSocket relay (relay-go) as bootstrap, then switches to direct P2P

export interface GossipMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderAgent: string; // 'CBLR', 'ABBA', 'AMA', 'Hermes', 'Vex', 'Eliza', etc.
  content: string;
  messageType: 'chat' | 'event' | 'routing' | 'alert' | 'agent_action';
  timestamp: number;
  signature?: string; // Ed25519
}

export interface GossipChannel {
  id: string;
  name: string;
  type: 'company' | 'mingling' | 'system';
  companyId?: string;
  description: string;
  shieldDown: boolean;
  peerCount: number;
  topic: string; // Gossipsub topic name
}

export type AgentName = 'CBLR' | 'ABBA' | 'AMA' | 'Hermes' | 'Vex' | 'Eliza' | 'System' | string;

export type MessageHandler = (msg: GossipMessage) => void;
export type ConnectionHandler = (connected: boolean) => void;

// Known channels
export const DEFAULT_CHANNELS: GossipChannel[] = [
  {
    id: 'harbor-internal',
    name: '31 Harbor HQ',
    type: 'company',
    companyId: 'harbor',
    description: 'Private channel for 31 Harbor agents',
    shieldDown: false,
    peerCount: 3,
    topic: 'suiteai.harbor.agents',
  },
  {
    id: 'party-internal',
    name: 'Party Favor Photo HQ',
    type: 'company',
    companyId: 'party',
    description: 'Private channel for Party Favor Photo agents',
    shieldDown: false,
    peerCount: 4,
    topic: 'suiteai.party.agents',
  },
  {
    id: 'xmrt-internal',
    name: 'XMRT DAO HQ',
    type: 'company',
    companyId: 'xmrt',
    description: 'Private channel for XMRT DAO agents',
    shieldDown: false,
    peerCount: 5,
    topic: 'suiteai.xmrt.agents',
  },
  {
    id: 'the-commons',
    name: 'The Commons',
    type: 'mingling',
    description: 'Cross-company mingling -- agents from all companies when shields are down',
    shieldDown: true,
    peerCount: 0,
    topic: 'suiteai.commons.mingle',
  },
  {
    id: 'system-alerts',
    name: 'System Alerts',
    type: 'system',
    description: 'Automated system notifications and alerts',
    shieldDown: false,
    peerCount: 0,
    topic: 'suiteai.system.alerts',
  },
];

/** Generate a unique message ID */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class GossipHub {
  channels: Map<string, GossipChannel> = new Map();
  messages: Map<string, GossipMessage[]> = new Map();
  relayUrl: string;
  ws: WebSocket | null = null;
  connected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  onMessage: MessageHandler | null = null; // legacy single handler

  constructor(relayUrl = 'ws://localhost:8080') {
    this.relayUrl = relayUrl;
    // Initialize default channels
    DEFAULT_CHANNELS.forEach((ch) => {
      this.channels.set(ch.id, { ...ch });
      this.messages.set(ch.id, []);
    });
  }

  /** Register a message handler */
  addMessageHandler(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /** Register a connection state handler */
  addConnectionHandler(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /** Open WebSocket to relay and subscribe to all channel topics */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.relayUrl);

      this.ws.onopen = () => {
        this.connected = true;
        this.connectionHandlers.forEach((h) => h(true));
        // Subscribe to all channel topics
        this.channels.forEach((ch) => {
          this.ws?.send(
            JSON.stringify({ type: 'subscribe', topic: ch.topic })
          );
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'message' && payload.data) {
            const msg: GossipMessage = payload.data;
            this.handleIncomingMessage(msg);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.connectionHandlers.forEach((h) => h(false));
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.connected = false;
        this.connectionHandlers.forEach((h) => h(false));
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  /** Close WebSocket connection */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  private handleIncomingMessage(msg: GossipMessage): void {
    // Store message
    const msgs = this.messages.get(msg.channelId) || [];
    msgs.push(msg);
    this.messages.set(msg.channelId, msgs);
    // Notify handlers
    this.messageHandlers.forEach((h) => h(msg));
    if (this.onMessage) this.onMessage(msg);
  }

  /** Send a message to a channel via WebSocket */
  send(
    channelId: string,
    content: string,
    senderAgent: AgentName,
    senderName: string,
    messageType: GossipMessage['messageType'] = 'chat'
  ): void {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error(`Unknown channel: ${channelId}`);

    const msg: GossipMessage = {
      id: generateId(),
      channelId,
      senderName,
      senderAgent,
      content,
      messageType,
      timestamp: Date.now(),
    };

    // Store locally first
    const msgs = this.messages.get(channelId) || [];
    msgs.push(msg);
    this.messages.set(channelId, msgs);

    // Send via WebSocket if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'publish',
          topic: channel.topic,
          data: msg,
        })
      );
    }
  }

  /** Get messages for a channel */
  getMessages(channelId: string): GossipMessage[] {
    return [...(this.messages.get(channelId) || [])];
  }

  /** Get all channels */
  getChannels(): GossipChannel[] {
    return Array.from(this.channels.values());
  }

  /** Get channels visible to a company (own channels + mingling when shield is down) */
  getCompanyChannels(companyId: string): GossipChannel[] {
    return this.getChannels().filter(
      (ch) =>
        ch.companyId === companyId || (ch.type === 'mingling' && ch.shieldDown)
    );
  }

  /** Toggle shield for a company channel */
  toggleShield(channelId: string): boolean {
    const ch = this.channels.get(channelId);
    if (ch && ch.type === 'company') {
      ch.shieldDown = !ch.shieldDown;
      return ch.shieldDown;
    }
    return false;
  }

  /** Get connection state */
  isConnected(): boolean {
    return this.connected;
  }
}

export const gossipHub = new GossipHub();
