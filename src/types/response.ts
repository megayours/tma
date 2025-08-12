import { z } from 'zod';
import { PromptSchema, type Prompt } from './prompt';
import { ContentTypeSchema } from './requests';
import { ContractSchema } from './contract';

export const PaginationResponseSchema = z.object({
  page: z.number(),
  size: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;

// Raw API response schema (snake_case) for prompts
export const RawPromptVersionSchema = z.object({
  id: z.number(),
  version: z.number(),
  created_at: z.number(),
  min_tokens: z.number().optional(),
  max_tokens: z.number().optional(),
  additional_content_ids: z.array(z.string()).nullable().optional(),
});
export type RawPromptVersion = z.infer<typeof RawPromptVersionSchema>;

export const RawPromptSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  type: z.string(),
  additional_content_ids: z.array(z.string()).optional(),
  published: z.boolean(),
  last_used: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
  usage_count: z.number(),
  contracts: z.array(ContractSchema),
  images: z.array(z.string()),
  videos: z.array(z.string()),
  gifs: z.array(z.string()),
  versions: z.array(RawPromptVersionSchema),
});
export type RawPrompt = z.infer<typeof RawPromptSchema>;

export const RawPromptsResponseSchema = z.object({
  data: z.array(RawPromptSchema),
  pagination: PaginationResponseSchema,
});
export type RawPromptsResponse = z.infer<typeof RawPromptsResponseSchema>;

export const PromptsResponseSchema = z.object({
  data: z.array(PromptSchema),
  pagination: PaginationResponseSchema,
});
export type PromptsResponse = z.infer<typeof PromptsResponseSchema>;

// Token schema
export const TokenSchema = z.object({
  contract: ContractSchema,
  id: z.string(),
});
export type Token = z.infer<typeof TokenSchema>;

// Content status enum
export const ContentStatusSchema = z.enum([
  'processing',
  'completed',
  'failed',
]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

// Content variant enum
export const ContentVariantSchema = z.string().optional();
export type ContentVariant = z.infer<typeof ContentVariantSchema>;

// Raw content response schema (snake_case)
export const RawContentResponseSchema = z.object({
  id: z.string(),
  status: ContentStatusSchema.optional(),
  error: z.string().nullable().optional(),
  type: ContentTypeSchema,
  variant: ContentVariantSchema,
  created_at: z.number().optional(),
  creator_id: z.string().optional(),
  token: TokenSchema.optional(),
  tokens: z.array(TokenSchema).optional(),
  prompt_id: z.union([z.string(), z.number()]).nullable().optional(),
});
export type RawContentResponse = z.infer<typeof RawContentResponseSchema>;

// Main content response schema
export const ContentResponseSchema = z.object({
  id: z.string(),
  status: ContentStatusSchema.optional(),
  error: z.string().nullable().optional(),
  type: ContentTypeSchema,
  variant: ContentVariantSchema,
  createdAt: z.number().optional(),
  creatorId: z.string().optional(),
  token: TokenSchema.optional(),
  tokens: z.array(TokenSchema).optional(),
  promptId: z.union([z.string(), z.number()]).nullable().optional(),
});
export type ContentResponse = z.infer<typeof ContentResponseSchema>;

// Raw content list response schema
export const RawContentListResponseSchema = z.object({
  data: z.array(RawContentResponseSchema),
  pagination: PaginationResponseSchema,
});
export type RawContentListResponse = z.infer<
  typeof RawContentListResponseSchema
>;

// Content list response schema
export const ContentListResponseSchema = z.object({
  data: z.array(ContentResponseSchema),
  pagination: PaginationResponseSchema,
});
export type ContentListResponse = z.infer<typeof ContentListResponseSchema>;
