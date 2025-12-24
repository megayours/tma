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
  image: z.string().nullable().optional(),
  type: z.string(),
  additional_content_ids: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  last_used: z.number().optional(),
  created_at: z.number(),
  updated_at: z.number().optional(),
  published_at: z.number().nullable().optional(),
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
  stickers: z.array(z.string()).optional(),
  animated_stickers: z.array(z.string()).optional(),
  versions: z.any().optional(),
  lastestContentUrl: z.string().optional(),
  min_tokens: z.number().optional(),
  max_tokens: z.number().optional(),
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

// Token schema - handles both formats (contract/collection, id/token_id)
export const TokenSchema = z
  .object({
    // Handle both token_id and id
    token_id: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    attributes: z.any().optional(),
    owner: z.string().optional(),
    // Handle both contract and collection formats
    contract: ContractSchema.optional(),
    collection: z
      .object({
        id: z.number(),
        name: z.string(),
        chain: z.string(),
        contract_address: z.string(),
      })
      .optional(),
  })
  .transform(data => ({
    id: data.id || data.token_id || '',
    name: data.name,
    image: data.image,
    description: data.description,
    attributes: data.attributes,
    owner: data.owner,
    contract: data.contract || {
      chain: data.collection!.chain,
      address: data.collection!.contract_address,
      name: data.collection!.name,
    },
  }));
export type Token = z.infer<typeof TokenSchema>;

// Content status enum
export const ContentStatusSchema = z.enum([
  'processing',
  'completed',
  'failed',
  'error',
]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

// Content variant enum
export const ContentVariantSchema = z.string().optional();
export type ContentVariant = z.infer<typeof ContentVariantSchema>;

// Raw content response schema (snake_case from API)
export const RawContentResponseSchema = z
  .object({
    id: z.string(),
    status: ContentStatusSchema.optional(),
    error: z.string().nullable().optional(),
    type: ContentTypeSchema,
    variant: ContentVariantSchema,
    created_at: z.number().optional(),
    creator_id: z.string().optional(),
    revealed_at: z.union([z.number(), z.string()]).nullable().optional(),
    prompt_id: z.union([z.string(), z.number()]).nullable().optional(),
    execution_id: z.string().nullable().optional(),
    prompt: z
      .object({
        id: z.union([z.string(), z.number()]),
        name: z.string(),
      })
      .nullable()
      .optional(),
    token: TokenSchema.optional(),
    tokens: z.array(TokenSchema).optional(),
    url: z.string().optional(),
    video: z.string().optional(),
    gif: z.string().optional(),
    image: z.string().optional(),
    progress_percentage: z.number().optional(),
    telegram_pack_url: z.string().nullable().optional(),
    integrations: z
      .array(
        z.object({
          integration: z.string(),
          url: z.string(),
        })
      )
      .optional(),
    session: z.any().optional(),
  })
  .transform(data => {
    const promptId = data.prompt?.id ?? data.prompt_id ?? null;
    const promptName =
      data.prompt?.name ??
      (promptId !== null && promptId !== undefined ? 'Prompt' : '');

    const prompt =
      data.prompt != null
        ? {
            id: data.prompt.id,
            name: data.prompt.name,
            ...('version' in data.prompt
              ? { version: data.prompt.version }
              : {}),
          }
        : promptId !== null && promptId !== undefined
          ? {
              id: promptId,
              name: promptName,
            }
          : null;

    return {
      id: data.id,
      status: data.status,
      error: data.error,
      type: data.type,
      variant: data.variant,
      createdAt: data.created_at,
      creatorId: data.creator_id,
      revealedAt: data.revealed_at,
      executionId: data.execution_id,
      promptId,
      prompt,
      token: data.token,
      tokens: data.tokens,
      url: data.url,
      video: data.video,
      gif: data.gif,
      image: data.image,
      progressPercentage: data.progress_percentage,
      telegramPackURL: data.telegram_pack_url,
      integrations: data.integrations,
    };
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
  revealedAt: z.string().optional(),
  executionId: z.string().nullable().optional(),
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

// Generation content schema for my-recent-generations endpoint
export const GenerationContentSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video', 'sticker', 'animated_sticker', 'gif']),
  path: z.string(),
  url: z.string(),
  preview_url: z.string().nullable(),
  watermarked_url: z.string().nullable(),
  created_at: z.number(),
  revealed_at: z.number().nullable(),
  creator_id: z.string(),
  creator_name: z.string().nullable(),
  prompt: PromptSchema.nullable(),
  tokens: z.array(TokenSchema).optional(),
});
export type GenerationContent = z.infer<typeof GenerationContentSchema>;

// My recent generations response schema
export const MyRecentGenerationsResponseSchema = z.object({
  data: z.array(GenerationContentSchema),
  pagination: PaginationResponseSchema,
});
export type MyRecentGenerationsResponse = z.infer<
  typeof MyRecentGenerationsResponseSchema
>;

// Share integration result schema
export const ShareIntegrationResultSchema = z.object({
  integration: z.string(),
  success: z.boolean(),
  url: z.string().optional(),
  error: z.string().optional(),
});
export type ShareIntegrationResult = z.infer<
  typeof ShareIntegrationResultSchema
>;

// Share response schema (array of integration results)
export const ShareResponseSchema = z.array(ShareIntegrationResultSchema);
export type ShareResponse = z.infer<typeof ShareResponseSchema>;

// Content generation status schema (for async polling)
export const ContentGenerationStatusSchema = z
  .object({
    execution_id: z.string(),
    content_id: z.string(),
    status: z.enum(['pending', 'processing', 'completed', 'error']),
    error: z.string().nullable().optional(),
    created_at: z.number(),
    completed_at: z.number().nullable().optional(),
    queue_info: z
      .object({
        position: z.number(),
        estimated_completion_time: z.number(),
      })
      .nullish(),
  })
  .transform(data => ({
    executionId: data.execution_id,
    contentId: data.content_id,
    status: data.status,
    error: data.error,
    createdAt: data.created_at,
    completedAt: data.completed_at,
    queueInfo: data.queue_info
      ? {
          position: data.queue_info.position,
          estimatedCompletionTime: data.queue_info.estimated_completion_time,
        }
      : undefined,
  }));
export type ContentGenerationStatus = z.infer<
  typeof ContentGenerationStatusSchema
>;

// Content execution schema (for listing pending executions)
export const ContentExecutionSchema = z.object({
  execution_id: z.string(),
  content_id: z.string(),
  type: z.enum(['image', 'video', 'gif', 'sticker', 'animated_sticker']),
  status: z.enum(['pending', 'processing', 'error']),
  error: z.string().nullable().optional(),
  created_at: z.number(),
});
export type ContentExecution = z.infer<typeof ContentExecutionSchema>;

export const ContentExecutionsResponseSchema = z.object({
  executions: z.array(ContentExecutionSchema),
});
export type ContentExecutionsResponse = z.infer<
  typeof ContentExecutionsResponseSchema
>;

// Export the Content type from content.ts
export type { Content } from './content';
