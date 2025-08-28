import { z } from 'zod';

export const PromptTypeSchema = z
  .enum(['images', 'videos', 'stickers', 'gifs'])
  .optional();
export type PromptType = z.infer<typeof PromptTypeSchema>;

export const ContentTypeSchema = z.enum(['image', 'video', 'sticker']);
export type ContentType = z.infer<typeof ContentTypeSchema>;

export const ContentSortBySchema = z.enum(['created_at']);
export type ContentSortBy = z.infer<typeof ContentSortBySchema>;

export const ContentSortOrderSchema = z.enum(['asc', 'desc']);
export type ContentSortOrder = z.infer<typeof ContentSortOrderSchema>;

export const FilterSchema = z.object({
  sortBy: z.enum(['last_used', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
export type Filter = z.infer<typeof FilterSchema>;

export const PaginationSchema = z.object({
  page: z.number().optional(),
  size: z.number().optional(),
  total: z.number().optional(),
  totalPages: z.number().optional(),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const PromptsRequestSchema = z.object({
  accountId: z.number().optional(),
  chain: z
    .enum(['ethereum', 'polygon', 'base', 'arbitrum', 'optimism', 'abstract'])
    .optional(),
  promptName: z.string().optional(),
  contractAddress: z.string().optional(),
  tokenCollectionName: z.string().optional(),
  promptType: PromptTypeSchema,
  filters: FilterSchema.optional(),
  pagination: PaginationSchema.optional(),
  usageSince: z.number().optional(),
});
export type PromptsRequest = z.infer<typeof PromptsRequestSchema>;

export const ContentFiltersSchema = z.object({
  type: ContentTypeSchema.optional(),
  promptId: z.string().optional(),
  promptVersion: z.string().optional(),
  account: z.string().optional(),
  chain: z.string().optional(),
  contractAddress: z.string().optional(),
  tokenId: z.string().optional(),
  createdAfter: z.string().optional(),
  filters: FilterSchema.optional(),
  pagination: PaginationSchema.optional(),
  session: z.any().optional(),
});
export type ContentFilters = z.infer<typeof ContentFiltersSchema>;

export const ContentRequestSchema = z.object({
  filters: FilterSchema.optional(),
  pagination: PaginationSchema.optional(),
});
export type ContentRequest = z.infer<typeof ContentRequestSchema>;
