// MuAPI -- Multimodal AI API (395 models)
// REST API with webhooks for async generations

export type VideoModel = 'sora' | 'veo-2' | 'kling-v2.5' | 'luma-ray-2' | 'runway-gen4' | 'pika-2.1';
export type ImageModel = 'flux-pro' | 'flux-dev' | 'dall-e-3' | 'stable-diffusion-3' | 'ideogram-v3' | 'recraft-v3';
export type AudioModel = 'suno-v4' | 'elevenlabs-v3' | 'udio-v1' | 'gpt-4o-voice' | 'gemini-audio';
export type Model3D = 'meshy-v4' | 'tripo-3d' | 'csm-3d' | 'rodin-3d';

export type ModelType = 'video' | 'image' | 'audio' | '3d';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface MuAPIGenerationRequest {
  model_type: ModelType;
  model: string;
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  duration?: number;
  style?: string;
  webhook_url?: string;
}

export interface MuAPIGenerationResponse {
  id: string;
  status: JobStatus;
  output_url?: string;
  preview_url?: string;
  error?: string;
}

export interface MuAPIError {
  error: string;
  code: string;
}

export class MuAPIClient {
  apiKey: string;
  baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.muapi.io/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /** POST /generate -- Start a generation job */
  async generate(req: MuAPIGenerationRequest): Promise<MuAPIGenerationResponse> {
    const res = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const err: MuAPIError = await res.json().catch(() => ({ error: 'Unknown error', code: 'unknown' }));
      throw new Error(`MuAPI generate failed [${res.status}]: ${err.error} (${err.code})`);
    }
    return await res.json();
  }

  /** GET /status/:id -- Poll job status */
  async getStatus(jobId: string): Promise<MuAPIGenerationResponse> {
    const res = await fetch(`${this.baseUrl}/status/${jobId}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`MuAPI getStatus failed: ${res.status}`);
    return await res.json();
  }

  /** GET /models -- List available models, optionally filtered by type */
  async listModels(type?: ModelType): Promise<any[]> {
    const url = type
      ? `${this.baseUrl}/models?type=${encodeURIComponent(type)}`
      : `${this.baseUrl}/models`;
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) throw new Error(`MuAPI listModels failed: ${res.status}`);
    const data = await res.json();
    return data.models || [];
  }

  /** POST /upscale -- Upscale an image */
  async upscale(imageUrl: string, scale: number = 2): Promise<string> {
    const res = await fetch(`${this.baseUrl}/upscale`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ image_url: imageUrl, scale }),
    });
    if (!res.ok) throw new Error(`MuAPI upscale failed: ${res.status}`);
    const data = await res.json();
    return data.output_url;
  }

  /** Poll until a job completes or fails (convenience method) */
  async pollUntilComplete(
    jobId: string,
    options: { intervalMs?: number; maxAttempts?: number } = {}
  ): Promise<MuAPIGenerationResponse> {
    const { intervalMs = 3000, maxAttempts = 60 } = options;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getStatus(jobId);
      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error(`MuAPI pollUntilComplete timed out after ${maxAttempts} attempts`);
  }
}

// Model display info
export const VIDEO_MODELS: { id: VideoModel; name: string; description: string; maxDuration: number }[] = [
  { id: 'sora', name: 'Sora', description: 'OpenAI -- photorealistic video', maxDuration: 60 },
  { id: 'veo-2', name: 'Veo 2', description: 'Google -- cinematic quality', maxDuration: 8 },
  { id: 'kling-v2.5', name: 'Kling v2.5', description: 'Kuaishou -- motion mastery', maxDuration: 10 },
  { id: 'luma-ray-2', name: 'Luma Ray 2', description: 'Luma -- fast generation', maxDuration: 5 },
  { id: 'runway-gen4', name: 'Runway Gen-4', description: 'Runway -- creative control', maxDuration: 10 },
  { id: 'pika-2.1', name: 'Pika 2.1', description: 'Pika -- character consistency', maxDuration: 5 },
];

export const IMAGE_MODELS: { id: ImageModel; name: string; description: string }[] = [
  { id: 'flux-pro', name: 'Flux Pro', description: 'Black Forest Labs -- highest quality' },
  { id: 'flux-dev', name: 'Flux Dev', description: 'Black Forest Labs -- balanced' },
  { id: 'dall-e-3', name: 'DALL-E 3', description: 'OpenAI -- prompt adherence' },
  { id: 'stable-diffusion-3', name: 'SD 3', description: 'Stability AI -- open weights' },
  { id: 'ideogram-v3', name: 'Ideogram v3', description: 'Ideogram -- text in images' },
  { id: 'recraft-v3', name: 'Recraft v3', description: 'Recraft -- vector graphics' },
];

export const AUDIO_MODELS: { id: AudioModel; name: string; description: string }[] = [
  { id: 'suno-v4', name: 'Suno v4', description: 'Suno -- music generation' },
  { id: 'elevenlabs-v3', name: 'ElevenLabs v3', description: 'ElevenLabs -- voice synthesis' },
  { id: 'udio-v1', name: 'Udio v1', description: 'Udio -- music & vocals' },
  { id: 'gpt-4o-voice', name: 'GPT-4o Voice', description: 'OpenAI -- conversational' },
  { id: 'gemini-audio', name: 'Gemini Audio', description: 'Google -- multilingual' },
];

export const MODEL_3D: { id: Model3D; name: string; description: string }[] = [
  { id: 'meshy-v4', name: 'Meshy v4', description: 'Meshy -- textured meshes' },
  { id: 'tripo-3d', name: 'Tripo 3D', description: 'Tripo -- fast 3D generation' },
  { id: 'csm-3d', name: 'CSM 3D', description: 'Common Sense Machines -- image-to-3D' },
  { id: 'rodin-3d', name: 'Rodin 3D', description: 'Rodin -- high-fidelity models' },
];

export { MuAPIClient as muapi };
