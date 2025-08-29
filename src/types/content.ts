import type { Prompt } from './prompt';
import type { Token } from './response';

export interface PromptWithContent extends Prompt {
  published: number;
  image: string;
  type: 'images' | 'videos' | 'stickers' | 'animated_stickers' | 'gifs';
  latestContentUrl?: string;
  contentId?: string;
  owner?: string;
  ownerName?: string;
  hasUserGenerated?: boolean;
  publishedAt?: number;
  generationCount?: number;
}

export interface Content {
  id: string;
  type: 'image' | 'video' | 'sticker';
  video?: string;
  gif?: string;
  image?: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: number;
  prompt: Prompt;
  token: Token;
}
