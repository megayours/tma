import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ContentFiltersSchema, type ContentFilters } from '../types/requests';
import { safeParse } from '@/utils/validation';
import {
  type Content,
  type ContentListResponse,
  type RawContentListResponse,
  type RawContentResponse,
  type Token,
  RawContentListResponseSchema,
} from '../types/response';
import type { Session } from '@/auth/useAuth';
import type { PromptVersion } from '@/types/prompt';

// Helper function to map raw content to expected format
const mapRawContentToContent = (rawContent: RawContentResponse) => ({
  id: rawContent.id,
  status: rawContent.status,
  error: rawContent.error,
  type: rawContent.type,
  variant: rawContent.variant,
  createdAt: rawContent.created_at,
  creatorId: rawContent.creator_id,
  token: rawContent.token,
  tokens: rawContent.tokens,
  promptId: rawContent.prompt_id,
  session: rawContent.session,
});

export const useGetContent = (
  params: ContentFilters,
  session: Session | null | undefined
) => {
  return useQuery({
    queryKey: ['content', params],
    queryFn: async (): Promise<ContentListResponse> => {
      const validatedParams = safeParse(ContentFiltersSchema, params);
      if (!validatedParams) {
        throw new Error('Invalid parameters');
      }

      try {
        // Build parameters object
        const apiParams = {
          type: validatedParams.type,
          prompt_id: validatedParams.promptId,
          prompt_version: validatedParams.promptVersion,
          account: validatedParams.account,
          chain: validatedParams.chain,
          contract_address: validatedParams.contractAddress,
          token_id: validatedParams.tokenId,
          created_after: validatedParams.createdAfter,
          sort_by: validatedParams.filters?.sortBy,
          sort_order: validatedParams.filters?.sortOrder,
          page: validatedParams.pagination?.page,
          size: validatedParams.pagination?.size,
        };

        // Build query string from parameters
        const queryParams = new URLSearchParams();
        Object.entries(apiParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });

        const queryString = queryParams.toString();
        const url = `${import.meta.env.VITE_PUBLIC_API_URL}/content${queryString ? `?${queryString}` : ''}`;

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

        const rawData: RawContentListResponse = await response.json();

        // Validate raw response data
        const validatedRawData = safeParse(
          RawContentListResponseSchema,
          rawData
        );
        if (!validatedRawData) {
          throw new Error('Invalid response data');
        }

        // Map raw data to expected format
        const mappedData: ContentListResponse = {
          data: validatedRawData.data.map(mapRawContentToContent),
          pagination: validatedRawData.pagination,
        };

        return mappedData;
      } catch (error) {
        console.error('ERROR', error);
        throw error;
      }
    },
  });
};

export const usePreviewContentMutation = (
  session: Session | null | undefined
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      promptId,
      contentIds,
      tokens,
    }: {
      promptId: number;
      contentIds: number[];
      tokens: Token[];
    }) => {
      if (!session) return;
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${promptId}/preview/async`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify({
            prompt_id: promptId,
            content_ids: tokens.length === 0 ? contentIds : undefined,
            tokens: tokens.map(token => ({
              contract: {
                chain: token.contract.chain,
                address: token.contract.address,
              },
              id: token.id,
            })),
          }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to preview content');
      }
      const data = await response.json();
      console.log('Async preview content response', data);
      return { contentId: data.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preview-content'] });
    },
  });
};

export const useGetPreviewContent = (
  session: Session | null | undefined,
  promptId: number | null,
  _promptVersion: PromptVersion | null
) => {
  return useQuery({
    queryKey: ['preview-content', promptId],
    queryFn: async () => {
      if (!session || !promptId) return;
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${promptId}/previews?`,
        // prompt_version=${promptVersion?.id.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session?.authToken,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to get preview content');
      }
      const data = await response.json();
      return {
        pagination: data.pagination,
        content: data.data as Content[],
      };
    },
    enabled: !!session && !!promptId,
    refetchInterval: query => {
      // Check if any content has "processing" status
      const hasProcessingContent = query.state.data?.content?.some(
        (item: Content) => item.status === 'processing'
      );
      // Poll every 2 seconds if there's processing content, otherwise don't poll
      return hasProcessingContent ? 2000 : false;
    },
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  });
};
