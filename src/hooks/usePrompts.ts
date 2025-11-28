'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Filter, Pagination } from '@/types/requests';
import { type RawPrompt } from '@/types/response';
import type { PromptWithContent } from '@/types/content';
import type { Session } from '@/auth/useAuth';
import type {
  Prompt,
  PromptFeedback,
  PromptFeedbackSentiment,
} from '@/types/prompt';
import { PromptFeedbackSchema } from '@/types/prompt';
import { safeParse } from '@/utils/validation';

// Helper function to map raw prompt to expected format
const mapRawPromptToPrompt = (rawPrompt: RawPrompt) => ({
  id: Number(rawPrompt.id),
  name: rawPrompt.name ?? 'Untitled',
  description: rawPrompt.description ?? '',
  image: rawPrompt.image,
  type: rawPrompt.type,
  additionalContentIds: rawPrompt.additional_content_ids ?? [],
  published: rawPrompt.published ?? false,
  lastUsed: rawPrompt.last_used ?? 0,
  createdAt: rawPrompt.created_at,
  updatedAt: rawPrompt.updated_at ?? rawPrompt.created_at,
  usageCount: rawPrompt.usage_count ?? 0,
  contracts: rawPrompt.contracts ?? [],
  images: rawPrompt.images ?? [],
  videos: rawPrompt.videos ?? [],
  gifs: rawPrompt.gifs ?? [],
  versions: rawPrompt.versions,
});

const mapRawPromptToPromptWithContent = (
  rawPrompt: RawPrompt
): PromptWithContent => ({
  ...mapRawPromptToPrompt(rawPrompt),
  published: rawPrompt.published_at ?? 0,
  image: rawPrompt.image ?? '',
  type: rawPrompt.type as
    | 'images'
    | 'videos'
    | 'stickers'
    | 'gifs'
    | 'animated_stickers',
  contentId: (rawPrompt as any).content_id,
  owner: rawPrompt.owner_id,
  ownerName: rawPrompt.owner_name ?? '',
  hasUserGenerated: rawPrompt.has_generated ?? false,
  publishedAt: rawPrompt.published_at ?? 0,
  generationCount: rawPrompt.generation_count ?? 0,
  latestContentUrl: rawPrompt.latest_content_url ?? undefined,
  minTokens: rawPrompt.min_tokens,
  maxTokens: rawPrompt.max_tokens,
});

export const useGetRecommendedPrompts = ({
  type = 'all',
  excludeUsed = true,
  pagination,
  community,
  tokenCollections,
  enabled = true,
}: {
  type: 'images' | 'videos' | 'gifs' | 'stickers' | 'animated_stickers' | 'all';
  excludeUsed: boolean;
  pagination: Pagination;
  community?: { id: string } | null;
  tokenCollections?: Array<{ id?: string }>;
  enabled?: boolean;
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'recommended-prompts',
      type,
      excludeUsed,
      pagination,
      tokenCollections,
      community?.id,
    ],
    enabled: enabled && !!community?.id,
    queryFn: async () => {
      try {
        // Build query parameters manually to support multiple token_collection_ids
        const queryParams = new URLSearchParams({
          type,
          exclude_used: String(excludeUsed),
          page: String(pagination.page),
          size: String(pagination.size),
          community_id: community?.id || '',
        });

        // Add token_collection_ids if provided
        if (tokenCollections && tokenCollections.length > 0) {
          tokenCollections.forEach(collection => {
            if (collection.id) {
              queryParams.append('token_collection_ids', collection.id);
            }
          });
        }

        const queryString = queryParams.toString();
        const url = `${import.meta.env.VITE_PUBLIC_API_URL}/discovery/prompts/recommended${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawResponse = await response.json();

        if (!rawResponse || !rawResponse.data) {
          console.error('Invalid response format:', rawResponse);
          throw new Error('Invalid response format: missing data');
        }

        const mappedPrompts: PromptWithContent[] = rawResponse.data.map(
          (rawPrompt: RawPrompt) => {
            const mapped = mapRawPromptToPromptWithContent(rawPrompt);
            return mapped;
          }
        );

        const result = {
          prompts: mappedPrompts,
          pagination: rawResponse.pagination || {
            page: 1,
            size: 10,
            total: 0,
            totalPages: 0,
          },
        };

        return result;
      } catch (err) {
        console.error('Failed to fetch recommended prompts:', err);
        throw new Error(
          `Failed to load recommendations: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    },
  });

  return {
    data: {
      prompts: data?.prompts || [],
      pagination: data?.pagination || null,
    },
    isLoading,
    error,
    refetch,
  };
};

export const useGetPrompt = (promptId: string, session: Session | null) => {
  const queryKey = ['prompt', promptId, session?.authToken];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!session) return;
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${promptId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Prompt not found');
        }
        throw new Error(`Failed to fetch prompt: ${response.status}`);
      }

      const data = await response.json();

      const prompt: Prompt = {
        ...data,
        id: Number(data.id),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        deletedAt: data.deleted_at,
        lastUsed: data.last_used,
        maxTokens: data.max_tokens,
        minTokens: data.min_tokens,
        ownerId: data.owner_id,
        published: data.published_at,
        usageCount: data.usage_count,
        animatedStickers: data.animated_stickers,
        stickers: data.stickers,
        videos: data.videos,
        images: data.images,
        gifs: data.gifs,
        versions: data.versions.map((version: any) => ({
          ...version,
          id: Number(version.id),
          model: version.model,
          minTokens: version.min_tokens,
          maxTokens: version.max_tokens,
          text: version.text,
          version: version.version,
          createdAt: version.created_at,
          additionalContentIds: version.additional_content_ids,
        })),
      };
      return prompt;
    },
    enabled: !!session,
  });
};

// Hook to get detailed prompt data (min/max tokens, contracts) for recommended prompts
export const useGetRecommendedPromptsWithDetails = ({
  type = 'all',
  excludeUsed = true,
  pagination,
  community,
  enabled = true,
  session,
}: {
  type: 'images' | 'videos' | 'gifs' | 'stickers' | 'animated_stickers' | 'all';
  excludeUsed: boolean;
  pagination: Pagination;
  community: { id: string };
  enabled?: boolean;
  session: Session | null;
}) => {
  // First get the recommended prompts
  const recommendedQuery = useGetRecommendedPrompts({
    type,
    excludeUsed,
    pagination,
    community,
    enabled,
  });

  // Get detailed data for each prompt
  const promptQueries = useQuery({
    queryKey: [
      'recommended-prompts-details',
      recommendedQuery.data?.prompts?.map(p => p.id),
      session?.authToken,
    ],
    queryFn: async () => {
      // if (!session || !recommendedQuery.data?.prompts?.length) return [];

      const detailPromises = recommendedQuery.data.prompts.map(async prompt => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${prompt.id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...(session && { Authorization: session.authToken }),
              },
            }
          );

          if (!response.ok) {
            console.warn(`Failed to fetch details for prompt ${prompt.id}`);
            return {
              ...prompt,
              minTokens: undefined,
              maxTokens: undefined,
              contracts: [],
            };
          }

          const data = await response.json();
          return {
            ...prompt,
            minTokens: data.min_tokens,
            maxTokens: data.max_tokens,
            contracts: data.contracts || [],
          };
        } catch (error) {
          console.warn(
            `Error fetching details for prompt ${prompt.id}:`,
            error
          );
          return {
            ...prompt,
            minTokens: undefined,
            maxTokens: undefined,
            contracts: [],
          };
        }
      });

      return Promise.all(detailPromises);
    },
    enabled: !!recommendedQuery.data?.prompts?.length && enabled,
  });

  return {
    data: {
      prompts: promptQueries.data || [],
      pagination: recommendedQuery.data?.pagination || null,
    },
    isLoading: recommendedQuery.isLoading || promptQueries.isLoading,
    error: recommendedQuery.error || promptQueries.error,
    refetch: () => {
      recommendedQuery.refetch();
      promptQueries.refetch();
    },
  };
};

export const useGetPrompts = ({
  promptFilters,
  session,
  pagination,
  filters,
}: {
  session: Session | null;
  pagination: Pagination;
  promptFilters: {
    type: 'images' | 'videos' | 'stickers' | 'animated_stickers' | 'all';
  };
  filters: Filter;
}) => {
  const queryKey = [
    'prompts',
    session?.authToken,
    promptFilters,
    filters,
    pagination,
  ];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!session) return;
      if (!pagination.page || !pagination.size) return;

      const params = new URLSearchParams();
      params.set('type', promptFilters.type || 'all');
      params.set('page', pagination.page.toString());
      params.set('size', pagination.size.toString());

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Prompt not found');
        }
        throw new Error(`Failed to fetch prompt: ${response.status}`);
      }

      const data = await response.json();
      // rename data as prompts
      data.prompts = data.data;
      return data as { prompts: Prompt[]; pagination: Pagination };
    },
    enabled: !!session && !!pagination.page && !!pagination.size,
  });
};

export const useCreatePromptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      session,
      type,
      name,
      communityId,
    }: {
      session: Session | null;
      type: 'images' | 'videos' | 'stickers' | 'animated_stickers';
      name: string;
      communityId: string | undefined;
    }) => {
      if (!session) return;
      if (!communityId) return;
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify({
            name: name,
            type: type,
            community_id: communityId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to create prompt');
      }
      const data = await response.json();

      const prompt: Prompt = {
        id: Number(data.id),
        contracts: data.contracts,
        createdAt: data.created_at,
        name: data.name,
        description: data.description,
        image: data.image,
        type: data.type,
        published: data.published,
        lastUsed: data.last_used,
        updatedAt: data.updated_at,
        usageCount: data.usage_count,
        versions: data.versions.map((version: any) => ({
          id: Number(version.id),
          model: version.model,
          text: version.text,
          version: version.version,
          createdAt: version.created_at,
          minTokens: version.min_tokens,
          maxTokens: version.max_tokens,
        })),
      };
      return prompt;
    },
    // invalidate the prompts query
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
};

export const useGetMyPrompts = (
  session: Session,
  pagination: Pagination,
  _filtering: Filter,
  type?: 'images' | 'videos' | 'stickers' | 'animated_stickers',
  sortBy: 'created_at' | 'last_used' | 'updated_at' = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  return useQuery({
    queryKey: [
      'my-prompts',
      session?.authToken,
      pagination,
      type,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      if (!session) return;
      const params = new URLSearchParams({
        account: session.id,
        page: pagination.page?.toString() ?? '1',
        size: pagination.size?.toString() ?? '10',
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(type && { type }),
      });
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch prompts: ${response.status}`);
      }

      const data = await response.json();

      return data;
    },
    enabled: !!session,
  });
};

export const useDeletePromptMutation = (
  session: Session,
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ promptId }: { promptId: number }) => {
      if (!session) return;
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${promptId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-prompts'] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
    onSettled: () => {
      options?.onSettled?.();
    },
  });
};

export const usePromptMutation = (session: Session | null | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ prompt }: { prompt: Prompt }) => {
      if (!session) {
        throw new Error('No session available');
      }

      const requestBody = {
        name: prompt.name,
        description: prompt.description,
        versions: prompt.versions,
        prompt: prompt.prompt,
        additional_content_ids: prompt.additionalContentIds,
        contracts: prompt.contracts,
        max_tokens: prompt.maxTokens,
        min_tokens: prompt.minTokens,
        model: prompt.model,
        published: prompt.published! > 0 ? true : false,
      };

      console.log('🔄 PUT /prompts request:', {
        url: `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${prompt.id}`,
        body: requestBody,
      });

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${prompt.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ PUT /prompts failed:', {
          status: response.status,
          error: errorData,
        });

        // Extract the actual error message from the response
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `Failed to update prompt: ${response.status}`;
        throw new Error(errorMessage);
      }

      const responseData = (await response.json()) as Prompt;
      console.log('✅ PUT /prompts response:', responseData);
      return responseData;
    },
    onSuccess: (_data, variables) => {
      // Invalidate all prompts lists
      queryClient.invalidateQueries({ queryKey: ['my-prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });

      // Invalidate the specific prompt query using pattern matching
      queryClient.invalidateQueries({
        predicate: query => {
          const match =
            query.queryKey[0] === 'prompt' &&
            query.queryKey[1] === variables.prompt.id?.toString();
          return match;
        },
      });
    },
  });
};

export const usePublishPromptMutation = (session: Session) => {
  const queryClient = useQueryClient();
  let promptIdToInvalidate: number;
  return useMutation({
    mutationFn: async ({
      promptId,
      publish,
    }: {
      promptId: number;
      publish: boolean;
    }) => {
      if (!session) return;
      promptIdToInvalidate = promptId;
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${promptId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify({ published: publish }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to publish prompt');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-prompts'] });
      queryClient.invalidateQueries({
        queryKey: ['prompt', promptIdToInvalidate],
      });
    },
  });
};

export const usePromptFeedbackMutation = (
  session: Session | null | undefined,
  options?: {
    onSuccess?: (data: PromptFeedback) => void;
    onError?: (error: Error) => void;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contentId,
      sentiment,
    }: {
      contentId: string;
      sentiment: PromptFeedbackSentiment;
    }) => {
      if (!session) {
        throw new Error('Session required to submit feedback');
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify({
            content_id: contentId,
            sentiment: sentiment,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `Failed to submit feedback: ${response.status}`
        );
      }

      const rawData = await response.json();
      const validatedData = safeParse(PromptFeedbackSchema, rawData);

      if (!validatedData) {
        throw new Error('Invalid response format from feedback endpoint');
      }

      // Map snake_case to camelCase
      const feedback: PromptFeedback = {
        id: validatedData.id,
        promptVersionId: validatedData.prompt_version_id,
        accountId: validatedData.account_id,
        sentiment: validatedData.sentiment,
        contentReferenceId: validatedData.content_reference_id,
        feedbackText: validatedData.feedback_text,
        createdAt: validatedData.created_at,
      };

      return feedback;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error('Failed to submit prompt feedback:', error);
      options?.onError?.(error);
    },
  });
};
