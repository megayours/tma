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
  type: 'image' | 'video' | 'sticker' | 'animated_sticker';
  video?: string;
  gif?: string;
  image?: string;
  url?: string;
  status: 'processing' | 'completed' | 'failed';
  error?: string | null;
  creatorId: string;
  revealedAt: string | number | null;
  createdAt: number;
  promptId?: string | number | null;
  token?: Token;
  tokens?: Token[];
  variant?: string;
  progressPercentage?: number;
}
