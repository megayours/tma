import type { CompactPrompt } from './prompt';
import type { Token } from './response';

export interface ImageStatus {
  id: string;
  creatorId: string;
  promptId: string;
  createdAt: string;
  status: string;
  token: Token;
  type: string;
  variant: string;
}

export interface Image {
  id: string;
  createdAt: string;
  creatorId: string;
  image: string;
  prompt: CompactPrompt;
  token: Token;
  tokens: Token[];
}
