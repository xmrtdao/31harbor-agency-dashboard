// Registry of all AI providers, models, and agent harnesses
// Used by ModelSelector component

export interface ProviderModel {
  id: string;
  name: string;
  context: number;
  cost: string;
}

export interface CloudLLMProvider {
  id: string;
  name: string;
  logo: string;
  color: string;
  models: ProviderModel[];
  requiresKey: boolean;
  keyLabel: string;
}

export interface AgentHarness {
  id: string;
  name: string;
  description: string;
  provider: string;
}

export const CLOUD_LLM_PROVIDERS: CloudLLMProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: 'A',
    color: '#D4A574',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude 3.5 Sonnet', context: 200000, cost: '$3/M' },
      { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus', context: 200000, cost: '$15/M' },
      { id: 'claude-haiku-4-20250514', name: 'Claude 4 Haiku', context: 200000, cost: '$0.25/M' },
    ],
    requiresKey: true,
    keyLabel: 'Anthropic API Key',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: 'O',
    color: '#10A37F',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', context: 128000, cost: '$5/M' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', context: 128000, cost: '$0.15/M' },
      { id: 'o3-mini', name: 'o3-mini', context: 200000, cost: '$1.10/M' },
      { id: 'o1', name: 'o1', context: 200000, cost: '$15/M' },
    ],
    requiresKey: true,
    keyLabel: 'OpenAI API Key',
  },
  {
    id: 'alibaba',
    name: 'Alibaba Qwen',
    logo: 'Q',
    color: '#FF6A00',
    models: [
      { id: 'qwen-max', name: 'Qwen 2.5 Max', context: 131072, cost: '$2.4/M' },
      { id: 'qwen-plus', name: 'Qwen 2.5 Plus', context: 131072, cost: '$0.8/M' },
      { id: 'qwen-coder', name: 'Qwen 2.5 Coder', context: 131072, cost: '$0.4/M' },
    ],
    requiresKey: true,
    keyLabel: 'DashScope API Key',
  },
  {
    id: 'google',
    name: 'Google',
    logo: 'G',
    color: '#4285F4',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', context: 1048576, cost: '$1.25/M' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', context: 1048576, cost: '$0.15/M' },
    ],
    requiresKey: true,
    keyLabel: 'Google AI Studio API Key',
  },
  {
    id: 'groq',
    name: 'Groq',
    logo: 'Gq',
    color: '#F55036',
    models: [
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', context: 128000, cost: '$0.59/M' },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', context: 32768, cost: '$0.27/M' },
      { id: 'deepseek-r1-distill', name: 'DeepSeek R1 Distill', context: 128000, cost: '$0.55/M' },
    ],
    requiresKey: true,
    keyLabel: 'Groq API Key',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    logo: 'Ol',
    color: '#FFAB00',
    models: [
      { id: 'llama3.1:8b', name: 'Llama 3.1 8B', context: 128000, cost: 'Free (local)' },
      { id: 'llama3.1:70b', name: 'Llama 3.1 70B', context: 128000, cost: 'Free (local)' },
      { id: 'qwen2.5:72b', name: 'Qwen 2.5 72B', context: 131072, cost: 'Free (local)' },
      { id: 'deepseek-r1:32b', name: 'DeepSeek R1 32B', context: 128000, cost: 'Free (local)' },
      { id: 'mistral:7b', name: 'Mistral 7B', context: 32768, cost: 'Free (local)' },
    ],
    requiresKey: false,
    keyLabel: 'Ollama URL (optional)',
  },
];

export const AGENT_HARNESSES: AgentHarness[] = [
  { id: 'claude-code', name: 'Claude Code', description: 'Anthropic agent harness with tool use', provider: 'anthropic' },
  { id: 'opencode', name: 'OpenCode', description: 'Open-source agent with planning & execution', provider: 'openai' },
  { id: 'qwen-code', name: 'Qwen Code', description: 'Alibaba coding agent with 128K context', provider: 'alibaba' },
  { id: 'hermes', name: 'Hermes', description: 'Nous Research general-purpose agent', provider: 'ollama' },
  { id: 'pi', name: 'Pi (Inflection)', description: 'Conversational AI agent', provider: 'inflection' },
  { id: 'aider', name: 'Aider', description: 'Git-integrated pair programming', provider: 'openai' },
];

/** Get models for a provider by provider ID */
export function getModelsForProvider(providerId: string): ProviderModel[] {
  const provider = CLOUD_LLM_PROVIDERS.find((p) => p.id === providerId);
  return provider?.models ?? [];
}

/** Get harnesses for a provider by provider ID */
export function getHarnessesForProvider(providerId: string): AgentHarness[] {
  return AGENT_HARNESSES.filter((h) => h.provider === providerId);
}

/** Get a provider by its ID */
export function getProvider(providerId: string): CloudLLMProvider | undefined {
  return CLOUD_LLM_PROVIDERS.find((p) => p.id === providerId);
}

/** Get all model IDs across all providers */
export function getAllModelIds(): string[] {
  return CLOUD_LLM_PROVIDERS.flatMap((p) => p.models.map((m) => m.id));
}

/** Get provider for a given model ID */
export function getProviderForModel(modelId: string): CloudLLMProvider | undefined {
  return CLOUD_LLM_PROVIDERS.find((p) => p.models.some((m) => m.id === modelId));
}

/** Check if a provider requires an API key */
export function requiresApiKey(providerId: string): boolean {
  return getProvider(providerId)?.requiresKey ?? true;
}
