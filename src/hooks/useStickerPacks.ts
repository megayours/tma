import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { safeParse, getValidationErrors } from '@/utils/validation';
// We'll define our own pagination schema since the API returns total as string
import type { Pagination } from '../types/requests';
import type { Session } from '@/auth/useAuth';
import { SupportedCollectionSchema } from './useCollections';

// Custom pagination schema for sticker packs (handles string total)
const StickerPackPaginationSchema = z.object({
  page: z.number(),
  size: z.number(),
  total: z
    .union([z.string(), z.number()])
    .transform(val => (typeof val === 'string' ? parseInt(val, 10) : val)),
  totalPages: z.number(),
});

// Sticker pack type enum
const StickerPackTypeSchema = z.enum(['stickers', 'animated_stickers']);
type StickerPackType = z.infer<typeof StickerPackTypeSchema>;

// Preview item for sticker pack
const StickerPackPreviewItemSchema = z.object({
  content_id: z.string(),
  preview_url: z.string(),
  sort_order: z.number(),
});
type StickerPackPreviewItem = z.infer<typeof StickerPackPreviewItemSchema>;

// Pricing tier schema
const PricingTierSchema = z.object({
  amount_cents: z.number().nullable(),
  formatted_price: z.string().nullable(),
  stripe_price_id: z.string().nullable(),
  supply: z.number().optional(),
  sold_supply: z.number().optional(),
  max_supply: z.number().nullable().optional(),
  purchase_count: z.number().optional(),
});

// Pricing schema
const PricingSchema = z.object({
  basic: PricingTierSchema,
  gold: PricingTierSchema,
  legendary: PricingTierSchema,
});

type PricingTier = z.infer<typeof PricingTierSchema>;
type Pricing = z.infer<typeof PricingSchema>;

// User execution status
const StickerPackUserExecutionSchema = z.object({
  execution_id: z.string(),
  status: z.enum(['processing', 'completed', 'failed']),
  effect_style: z.string(),
  completed_prompts: z.number(),
  total_prompts: z.number(),
  progress_percentage: z.number(),
});
type StickerPackUserExecution = z.infer<typeof StickerPackUserExecutionSchema>;

// Main sticker pack (StickerBundles as requested)
const StickerBundlesSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    type: StickerPackTypeSchema,
    is_active: z.boolean(),
    created_by_admin_id: z.string(),
    created_at: z.number(),
    updated_at: z.number(),
    expires_at: z.number().nullable().optional(),
    item_count: z
      .union([z.string(), z.number()])
      .transform(val => (typeof val === 'string' ? parseInt(val, 10) : val)),
    min_tokens_required: z.number(),
    max_tokens_required: z.number(),
    pricing: PricingSchema,
    preview_items: z.array(StickerPackPreviewItemSchema),
    user_execution: StickerPackUserExecutionSchema.nullable().optional(),
  })
  .transform(data => ({
    ...data,
    expiresAt: data.expires_at,
  }));
export type StickerBundles = z.infer<typeof StickerBundlesSchema>;

// Response type
const StickerPacksResponseSchema = z.object({
  data: z.array(StickerBundlesSchema),
  pagination: StickerPackPaginationSchema,
});
type StickerPacksResponse = z.infer<typeof StickerPacksResponseSchema>;

// Hook parameters
interface UseStickerPacksParams {
  pagination?: Pagination;
  type?: StickerPackType;
  communityId?: string;
  preferredFormats?: string;
}

export const useStickerPacks = (params: UseStickerPacksParams) => {
  const { pagination, type, communityId, preferredFormats = 'webm' } = params;

  // Extract page and size with null checking
  const page = pagination?.page || 1;
  const size = pagination?.size || 10;

  return useQuery({
    queryKey: ['sticker-packs', type, page, size, communityId],
    queryFn: async (): Promise<StickerPacksResponse> => {
      try {
        // Build query parameters
        const queryParams = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        // Add token_collection_ids if provided
        if (communityId) {
          queryParams.append('community_id', communityId);
        }

        // Add type parameter if provided
        if (type) {
          queryParams.append('type', type);
        }

        // HOTFIX: Add preferred_format parameter hardcoded as 'webm' for sticker packs
        queryParams.append('preferred_formats', preferredFormats);

        const queryString = queryParams.toString();
        const url = `${import.meta.env.VITE_PUBLIC_API_URL}/sticker-pack${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.json();

        // Validate response data
        const validatedData = safeParse(StickerPacksResponseSchema, rawData);
        if (!validatedData) {
          const errors = getValidationErrors(
            StickerPacksResponseSchema,
            rawData
          );
          console.error(
            'Response validation failed for sticker packs:',
            rawData
          );
          console.error('Validation errors:', errors);
          console.error('Expected schema:', StickerPacksResponseSchema);
          throw new Error(
            `Invalid response data format - failed to parse sticker packs response: ${errors}`
          );
        }

        return validatedData;
      } catch (error) {
        console.error('ERROR fetching sticker packs:', error);
        throw error;
      }
    },
  });
};

// Single sticker pack item schema (based on actual API response)
const StickerPackItemContentSchema = z.object({
  id: z.string(),
  status: z.enum(['processing', 'completed', 'error']),
  type: z.enum(['image', 'video', 'gif', 'sticker', 'animated_sticker']),
  variant: z.enum([
    'original',
    'watermarked',
    'preview',
    'uploaded',
    'processed',
    'animation_static',
    'animated_sticker_webm',
    'animated_sticker_gif',
  ]),
  created_at: z.number(),
  creator_id: z.string(),
  prompt_id: z.number().nullable(),
  // These fields are not present in the actual API response, making them optional
  error: z.string().optional(),
  token: z
    .object({
      contract: z.object({
        chain: z.string().max(32),
        address: z.string().max(64),
        name: z.string().max(32),
      }),
      id: z.string(),
    })
    .optional(),
  tokens: z
    .array(
      z.object({
        contract: z.object({
          chain: z.string().max(32),
          address: z.string().max(64),
          name: z.string().max(32),
        }),
        id: z.string(),
      })
    )
    .optional(),
});

const StickerPackItemSchema = z.object({
  id: z.number(),
  bundle_id: z.number(),
  prompt_collection_id: z.number(),
  sort_order: z.number(),
  created_at: z.number(),
  content: StickerPackItemContentSchema.optional(),
  preview_url: z.string(),
  prompt: z
    .object({
      id: z.number(),
      version: z.number().optional(),
      text: z.string().optional(),
      model: z.string().optional(),
      created_at: z.number().optional(),
    })
    .optional(),
});

// Single sticker pack schema (detailed)
const StickerPackDetailSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    type: StickerPackTypeSchema,
    is_active: z.boolean(),
    created_by_admin_id: z.string(),
    created_at: z.number(),
    updated_at: z.number(),
    expires_at: z.number().nullable().optional(),
    min_tokens_required: z.number(),
    max_tokens_required: z.number(),
    pricing: PricingSchema,
    items: z.array(StickerPackItemSchema),
    item_count: z.number(),
    preview_items: z.array(StickerPackPreviewItemSchema).optional(),
    user_execution: StickerPackUserExecutionSchema.nullable().optional(),
    supported_collections: z.array(SupportedCollectionSchema).optional(),
  })
  .transform(data => ({
    ...data,
    expiresAt: data.expires_at,
    supportedCollections: data.supported_collections || [],
  }));

export type StickerPackItem = z.infer<typeof StickerPackItemSchema>;
export type StickerPackDetail = z.infer<typeof StickerPackDetailSchema>;

// Hook to fetch a single sticker pack
export const useStickerPack = (
  id: number | string,
  session?: Session | null | undefined,
  preferredFormats: string = 'webm',
  community?: { id: string } | null
) => {
  return useQuery({
    queryKey: ['sticker-pack', id, community?.id],
    queryFn: async (): Promise<StickerPackDetail> => {
      try {
        // Build query parameters
        const queryParams = new URLSearchParams();

        // Add preferred_formats parameter
        queryParams.append('preferred_formats', preferredFormats);

        // Add community_id if provided
        if (community?.id) {
          queryParams.append('community_id', community.id);
        }

        const queryString = queryParams.toString();
        const url = `${import.meta.env.VITE_PUBLIC_API_URL}/sticker-pack/${id}${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.authToken && { Authorization: session.authToken }),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.json();

        // Validate response data
        const validatedData = safeParse(StickerPackDetailSchema, rawData);
        if (!validatedData) {
          const errors = getValidationErrors(StickerPackDetailSchema, rawData);
          console.error(
            'Response validation failed for sticker pack:',
            rawData
          );
          console.error('Validation errors:', errors);
          console.error('Expected schema:', StickerPackDetailSchema);
          throw new Error(
            `Invalid response data format - failed to parse sticker pack response: ${errors}`
          );
        }

        return validatedData;
      } catch (error) {
        console.error('ERROR fetching sticker pack:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Export types for external use
export type {
  StickerPackType,
  StickerPackPreviewItem,
  StickerPackUserExecution,
  PricingTier,
  Pricing,
};
