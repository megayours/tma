import { z } from 'zod';
import { ContractSchema } from './contract';

export const PromptVersionSchema = z.object({
  id: z.number(),
  version: z.number(),
  createdAt: z.number(),
  minTokens: z.number(),
  maxTokens: z.number(),
  additionalContentIds: z.array(z.string()).nullable(),
  text: z.string().optional(),
  model: z.string().optional(),
});
export type PromptVersion = z.infer<typeof PromptVersionSchema>;

export const PromptSchema = z.object({
  id: z.number().nullable(),
  name: z.string(),
  description: z.string().optional(),
  prompt: z.string().optional(),
  image: z.string().optional(),
  type: z.string().optional(),
  additionalContentIds: z.array(z.string()).optional(),
  published: z.number().optional(),
  lastUsed: z.number().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
  deletedAt: z.number().optional(),
  usageCount: z.number().optional(),
  contracts: z.array(ContractSchema).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  gifs: z.array(z.string()).optional(),
  stickers: z.array(z.string()).optional(),
  animatedStickers: z.array(z.string()).optional(),
  versions: z.array(PromptVersionSchema).optional(),
  version: z.number().optional(),
  minTokens: z.number().optional(),
  maxTokens: z.number().optional(),
  model: z.string().optional(),
  ownerId: z.string().optional(),
  latestContentUrl: z.string().optional(),
});
export type Prompt = z.infer<typeof PromptSchema>;

export const CompactPromptSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type CompactPrompt = z.infer<typeof CompactPromptSchema>;

export const VersionSchema = z.object({
  createdAt: z.number(),
  minTokens: z.number(),
  maxTokens: z.number(),
  id: z.number(),
  model: z.string(),
  text: z.string(),
  version: z.number(),
});
export type Version = z.infer<typeof VersionSchema>;
