import { z } from 'zod';
import { PromptSchema } from './prompt';
import { ContentTypeSchema } from './requests';
import { ContractSchema } from './contract';

export const PaginationResponseSchema = z.object({
  page: z.number(),
  size: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;

export const RawPromptSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  type: z.string(),
  additional_content_ids: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  last_used: z.number().optional(),
  created_at: z.number(),
  updated_at: z.number().optional(),
  published_at: z.number().optional(),
  usage_count: z.number(),
  generation_count: z.number().optional(),
  has_generated: z.boolean().optional(),
  owner_id: z.string().optional(),
  owner_name: z.string().optional(),
  latest_content_url: z.string().nullable().optional(),
  contracts: z.array(ContractSchema).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  gifs: z.array(z.string()).optional(),
  versions: z.any().optional(),
  lastestContentUrl: z.string().optional(),
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
  name: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  attributes: z.any().optional(),
  owner: z.string().optional(),
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
  session: z.any().optional(),
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

// Export the Content type from content.ts
export type { Content } from './content';
