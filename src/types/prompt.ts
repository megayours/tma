import { z } from 'zod';
import { ContractSchema, type Contract } from './contract';

export const PromptVersionSchema = z.object({
  id: z.number(),
  version: z.number(),
  createdAt: z.number(),
  minTokens: z.number(),
  maxTokens: z.number(),
  additionalContentIds: z.array(z.string()).nullable(),
});
export type PromptVersion = z.infer<typeof PromptVersionSchema>;

export const PromptSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  type: z.string(),
  additionalContentIds: z.array(z.string()),
  published: z.boolean(),
  lastUsed: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  usageCount: z.number(),
  contracts: z.array(ContractSchema),
  images: z.array(z.string()),
  videos: z.array(z.string()),
  gifs: z.array(z.string()),
  versions: z.array(PromptVersionSchema),
});
export type Prompt = z.infer<typeof PromptSchema>;

export const CompactPromptSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type CompactPrompt = z.infer<typeof CompactPromptSchema>;
