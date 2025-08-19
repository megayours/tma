'use client';

import { useQuery } from '@tanstack/react-query';
import {
  type Pagination,
  type PromptsRequest,
  PromptsRequestSchema,
} from '@/types/requests';
import {
  type PromptsResponse,
  type RawPromptsResponse,
  type RawPrompt,
  RawPromptsResponseSchema,
} from '@/types/response';
import { safeParse, getValidationErrors } from '../utils/validation';
import { apiGet } from '@/lib/api';
import type { PromptWithContent } from '@/types/content';

// Helper function to map raw prompt to expected format
const mapRawPromptToPrompt = (rawPrompt: RawPrompt) => ({
  id: rawPrompt.id,
  name: rawPrompt.name,
  description: rawPrompt.description,
  image: rawPrompt.image,
  type: rawPrompt.type,
  additionalContentIds: rawPrompt.additional_content_ids ?? [],
  published: rawPrompt.published,
  lastUsed: rawPrompt.last_used,
  createdAt: rawPrompt.created_at,
  updatedAt: rawPrompt.updated_at,
  usageCount: rawPrompt.usage_count,
  contracts: rawPrompt.contracts,
  images: rawPrompt.images,
  videos: rawPrompt.videos,
  gifs: rawPrompt.gifs,
  versions: rawPrompt.versions,
});

export const useGetPrompts = (
  params: PromptsRequest = { promptType: 'images' }
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['prompts', params],
    queryFn: async (): Promise<PromptsResponse> => {
      // Validate input parameters
      const validatedParams = safeParse(PromptsRequestSchema, params);
      if (!validatedParams) {
        throw new Error(
          `Invalid request parameters: ${getValidationErrors(PromptsRequestSchema, params)}`
        );
      }

      console.log('VALIDATED PARAMS', validatedParams);
      console.log('API URL', import.meta.env.VITE_PUBLIC_API_URL);
      try {
        // Build parameters object
        const params = {
          account: validatedParams.accountId,
          chain: validatedParams.chain,
          prompt_name: validatedParams.promptName,
          contract_address: validatedParams.contractAddress,
          token_collection_name: validatedParams.tokenCollectionName,
          type: validatedParams.promptType,
          usage_since: validatedParams.usageSince,
          sort_by: validatedParams.filters?.sortBy,
          sort_order: validatedParams.filters?.sortOrder,
          page: validatedParams.pagination?.page,
          size: validatedParams.pagination?.size,
        };

        const rawData = await apiGet<RawPromptsResponse>(
          `${import.meta.env.VITE_PUBLIC_API_URL}/prompts`,
          params
        );

        // Validate raw response data
        const validatedRawData = safeParse(RawPromptsResponseSchema, rawData);
        if (!validatedRawData) {
          throw new Error(
            `Invalid response data: ${getValidationErrors(RawPromptsResponseSchema, rawData)}`
          );
        }

        // Map raw data to expected format
        const mappedData: PromptsResponse = {
          data: validatedRawData.data.map(mapRawPromptToPrompt),
          pagination: validatedRawData.pagination,
        };

        console.log('RESPONSE', mappedData, validatedParams);
        return mappedData;
      } catch (error) {
        console.error('ERROR', error);
        throw error; // Re-throw the error so TanStack Query can handle it properly
      }
    },
  });

  return {
    prompts: {
      data: data?.data || [],
      pagination: data?.pagination || null,
    },
    isLoading,
    error,
  };
};

const mapRawPromptToPromptWithContent = (
  rawPrompt: RawPrompt
): PromptWithContent => ({
  ...mapRawPromptToPrompt(rawPrompt),
  published: (rawPrompt as any).published ?? false,
  image: rawPrompt.image ?? '',
  type: rawPrompt.type as 'images' | 'videos' | 'stickers' | 'gifs',
  latestContentUrl: (rawPrompt as any).latest_content_url,
  contentId: (rawPrompt as any).content_id,
  owner: (rawPrompt as any).owner,
  ownerName: (rawPrompt as any).owner_name,
  hasUserGenerated: (rawPrompt as any).has_user_generated ?? false,
  publishedAt: (rawPrompt as any).published_at ?? 0,
  generationCount: (rawPrompt as any).generation_count ?? 0,
});

export const useGetRecommendedPrompts = ({
  type = 'all',
  excludeUsed = true,
  pagination,
}: {
  type: 'images' | 'videos' | 'gifs' | 'stickers' | 'all';
  excludeUsed: boolean;
  pagination: Pagination;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recommended-prompts', type, excludeUsed, pagination],
    queryFn: async () => {
      const response = await apiGet<RawPromptsResponse>(
        `${import.meta.env.VITE_PUBLIC_API_URL}/discovery/prompts/recommended`,
        {
          type,
          exclude_used: excludeUsed,
          page: pagination.page,
          size: pagination.size,
        }
      );

      console.log('RESPONSwwwE', response);

      const mappedPrompts: PromptWithContent[] = response.data.map(
        mapRawPromptToPromptWithContent
      );

      console.log('RESPONSE', mappedPrompts);
      return {
        prompts: mappedPrompts,
        pagination: response.pagination,
      };
    },
  });

  return {
    data: {
      prompts: data?.prompts || [],
      pagination: data?.pagination || null,
    },
    isLoading,
    error,
  };
};
