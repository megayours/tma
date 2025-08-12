'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type PromptsRequest, PromptsRequestSchema } from '@/types/requests';
import {
  type PromptsResponse,
  type RawPromptsResponse,
  type RawPrompt,
  type RawPromptVersion,
  RawPromptsResponseSchema,
} from '@/types/response';
import { safeParse, getValidationErrors } from '../utils/validation';
import { apiGet } from '@/lib/api';

// Helper function to map raw prompt version to expected format
const mapRawPromptVersionToPromptVersion = (rawVersion: RawPromptVersion) => ({
  id: rawVersion.id,
  version: rawVersion.version,
  createdAt: rawVersion.created_at,
  minTokens: rawVersion.min_tokens ?? 0,
  maxTokens: rawVersion.max_tokens ?? 0,
  additionalContentIds: rawVersion.additional_content_ids ?? null,
});

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
  versions: rawPrompt.versions.map(mapRawPromptVersionToPromptVersion),
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
