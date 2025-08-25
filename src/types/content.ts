import type { Prompt } from './prompt';

export interface PromptWithContent extends Prompt {
  published: boolean;
  image: string;
  type: 'images' | 'videos' | 'stickers' | 'gifs';
  latestContentUrl?: string;
  contentId?: string;
  owner?: string;
  ownerName?: string;
  hasUserGenerated?: boolean;
  publishedAt?: number;
  generationCount?: number;
}
