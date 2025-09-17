import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ContentFiltersSchema,
  type ContentFilters,
  MyRecentGenerationsRequestSchema,
  type MyRecentGenerationsRequest,
} from '../types/requests';
import { safeParse, getValidationErrors } from '@/utils/validation';
import {
  type Content,
  type ContentListResponse,
  type RawContentListResponse,
  type RawContentResponse,
  type Token,
  RawContentListResponseSchema,
  MyRecentGenerationsResponseSchema,
  type MyRecentGenerationsResponse,
} from '../types/response';
import type { Session } from '@/auth/useAuth';
import type { PromptVersion } from '@/types/prompt';
import type { Contract } from '../types/contract';

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
                name: token.contract.name,
              } as Contract,
              id: token.id,
            })),
          }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to preview content');
      }
      const data = await response.json();
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
  _promptVersion: PromptVersion | null,
  pagination?: { page: number; size: number }
) => {
  const paginationParams = pagination || { page: 1, size: 10 };

  return useQuery({
    queryKey: [
      'preview-content',
      promptId,
      paginationParams.page,
      paginationParams.size,
    ],
    queryFn: async () => {
      if (!session || !promptId) return;

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: paginationParams.page.toString(),
        size: paginationParams.size.toString(),
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${promptId}/previews?${queryParams.toString()}`,
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

export const useGenerateContentMutation = (
  session: Session | null | undefined
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      promptId,
      type,
      inputs = [],
      contentIds = [],
      overrideExisting = false,
    }: {
      promptId: string;
      type: 'image' | 'video' | 'sticker' | 'animated_sticker';
      inputs: any[];
      contentIds?: string[];
      overrideExisting?: boolean;
    }) => {
      if (!session) {
        throw new Error('Session required');
      }

      if (!inputs || inputs.length === 0) {
        throw new Error('At least one token input required');
      }

      const requestBody = {
        prompt_id: promptId,
        type,
        inputs: inputs,
        content_ids: contentIds.length > 0 ? contentIds : undefined,
        override_existing: overrideExisting,
      };

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/content/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries after successful generation
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['preview-content'] });
    },
  });
};

export const useMyRecentGenerations = (
  params: MyRecentGenerationsRequest,
  session: Session | null | undefined
) => {
  return useQuery({
    queryKey: ['my-recent-generations', params],
    queryFn: async (): Promise<MyRecentGenerationsResponse> => {
      const validatedParams = safeParse(
        MyRecentGenerationsRequestSchema,
        params
      );
      if (!validatedParams) {
        throw new Error('Invalid parameters');
      }

      try {
        // Build parameters object - convert pagination to individual params
        const apiParams = {
          type: validatedParams.type,
          page: validatedParams.pagination?.page?.toString() || '1',
          size: validatedParams.pagination?.size?.toString() || '20',
          days: validatedParams.days,
        };

        // Build query string from parameters
        const queryParams = new URLSearchParams();
        Object.entries(apiParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });

        const queryString = queryParams.toString();
        const url = `${import.meta.env.VITE_PUBLIC_API_URL}/discovery/generations/my-recent${queryString ? `?${queryString}` : ''}`;

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

        const rawData: MyRecentGenerationsResponse = await response.json();

        // Validate raw response data
        const validatedRawData = safeParse(
          MyRecentGenerationsResponseSchema,
          rawData
        );
        if (!validatedRawData) {
          const errors = getValidationErrors(
            MyRecentGenerationsResponseSchema,
            rawData
          );
          console.error('Schema validation failed:', errors);
          console.error('Raw data:', rawData);
          throw new Error(`Invalid response data: ${errors}`);
        }

        return validatedRawData;
      } catch (error) {
        console.error('ERROR', error);
        throw error;
      }
    },
    enabled: !!session,
  });
};

export const useUnrevealedGenerations = (
  session: Session | null | undefined
) => {
  const params: MyRecentGenerationsRequest = {
    type: 'all',
    pagination: {
      page: 1,
      size: 100, // Get a larger set to find unrevealed items
    },
    days: '30',
  };

  const { data } = useMyRecentGenerations(params, session);

  // Filter unrevealed generations (revealed_at is null)
  const unrevealedGenerations =
    data?.data?.filter(generation => generation.revealed_at === null) || [];

  const unrevealedCount = unrevealedGenerations.length;

  return { unrevealedGenerations, unrevealedCount };
};

export const useRevealContent = (session: Session | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      if (!session) {
        throw new Error('Session required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/content/${contentId}/reveal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate my-recent-generations queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['my-recent-generations'] });
    },
  });
};

export const useRevealAllContent = (session: Session | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentIds: string[]) => {
      if (!session) {
        throw new Error('Session required');
      }

      // Reveal all content in parallel
      const revealPromises = contentIds.map(contentId =>
        fetch(
          `${import.meta.env.VITE_PUBLIC_API_URL}/content/${contentId}/reveal`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: session.authToken,
            },
          }
        ).then(response => {
          if (!response.ok) {
            throw new Error(
              `Failed to reveal content ${contentId}: ${response.status}`
            );
          }
          return response.json();
        })
      );

      const results = await Promise.all(revealPromises);
      return { successful: results.length, total: contentIds.length };
    },
    onSuccess: () => {
      // Invalidate my-recent-generations queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['my-recent-generations'] });
    },
  });
};
