// Ollama API Client
// Base URL configurable (default: http://localhost:11434)

export interface OllamaModel {
  name: string;
  size: number;
  parameter_size: string;
  digest: string;
  modified_at: string;
  loaded: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  stream?: boolean;
  tools?: any[];
}

export interface ChatResponse {
  message: ChatMessage;
  done: boolean;
}

export interface GenerateOptions {
  system?: string;
  images?: string[]; // base64 encoded
  temperature?: number;
}

export interface GenerateResponse {
  response: string;
  done: boolean;
}

export interface EmbeddingsResponse {
  embedding: number[];
}

export interface PsResponse {
  models: OllamaModel[];
}

export class OllamaClient {
  baseUrl: string;

  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /** GET /api/tags — List all downloaded models */
  async listModels(): Promise<OllamaModel[]> {
    const res = await fetch(`${this.baseUrl}/api/tags`);
    if (!res.ok) throw new Error(`Ollama listModels failed: ${res.status}`);
    const data = await res.json();
    return (data.models || []).map((m: any) => ({
      name: m.name,
      size: m.size,
      parameter_size: m.details?.parameter_size || 'unknown',
      digest: m.digest,
      modified_at: m.modified_at,
      loaded: m.loaded || false,
    }));
  }

  /** POST /api/chat — Chat completion */
  async chat(model: string, messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: options?.stream ?? false,
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
        ...(options?.tools && { tools: options.tools }),
      }),
    });
    if (!res.ok) throw new Error(`Ollama chat failed: ${res.status}`);
    return await res.json();
  }

  /** POST /api/generate — Text generation (incl. multimodal with images) */
  async generate(model: string, prompt: string, options?: GenerateOptions): Promise<GenerateResponse> {
    const body: Record<string, any> = { model, prompt };
    if (options?.system) body.system = options.system;
    if (options?.images) body.images = options.images;
    if (options?.temperature !== undefined) body.temperature = options.temperature;

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Ollama generate failed: ${res.status}`);
    return await res.json();
  }

  /** POST /api/pull — Download/pull a model */
  async pullModel(name: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, stream: false }),
    });
    if (!res.ok) throw new Error(`Ollama pullModel failed: ${res.status}`);
  }

  /** DELETE /api/delete — Remove a model */
  async deleteModel(name: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Ollama deleteModel failed: ${res.status}`);
  }

  /** POST /api/show — Get model info (license, modelfile, parameters, template) */
  async getModelInfo(name: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Ollama getModelInfo failed: ${res.status}`);
    return await res.json();
  }

  /** POST /api/embeddings — Generate embeddings for a prompt */
  async embeddings(model: string, prompt: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt }),
    });
    if (!res.ok) throw new Error(`Ollama embeddings failed: ${res.status}`);
    const data: EmbeddingsResponse = await res.json();
    return data.embedding;
  }

  /** GET /api/ps — List currently running (loaded) models */
  async ps(): Promise<PsResponse> {
    const res = await fetch(`${this.baseUrl}/api/ps`);
    if (!res.ok) throw new Error(`Ollama ps failed: ${res.status}`);
    return await res.json();
  }
}

// Singleton
export const ollama = new OllamaClient();

/** Helper: check if Ollama is running */
export async function isOllamaRunning(baseUrl = 'http://localhost:11434'): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
