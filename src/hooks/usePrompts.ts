'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Filter, Pagination } from '@/types/requests';
import { type RawPromptsResponse, type RawPrompt } from '@/types/response';
import { apiGet } from '@/lib/api';
import type { PromptWithContent } from '@/types/content';
import type { Session } from '@/auth/useAuth';
import type { Prompt } from '@/types/prompt';

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
  enabled = true,
}: {
  type: 'images' | 'videos' | 'gifs' | 'stickers' | 'animated_stickers' | 'all';
  excludeUsed: boolean;
  pagination: Pagination;
  enabled?: boolean;
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recommended-prompts', type, excludeUsed, pagination],
    enabled,
    queryFn: async () => {
      try {
        const response = await apiGet<RawPromptsResponse>(
          `${import.meta.env.VITE_PUBLIC_API_URL}/discovery/prompts/recommended`,
          {
            type,
            exclude_used: excludeUsed,
            page: pagination.page,
            size: pagination.size,
          }
        );

        if (!response || !response.data) {
          console.error('Invalid response format:', response);
          throw new Error('Invalid response format: missing data');
        }

        const mappedPrompts: PromptWithContent[] = response.data.map(
          rawPrompt => {
            const mapped = mapRawPromptToPromptWithContent(rawPrompt);
            return mapped;
          }
        );

        const result = {
          prompts: mappedPrompts,
          pagination: response.pagination || {
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
        versions: data.versions.map((version: any) => ({
          ...version,
          id: Number(version.id),
          model: version.model,
          minTokens: version.min_tokens,
          maxTokens: version.max_tokens,
          text: version.text,
          version: version.version,
          createdAt: version.created_at,
        })),
        additionalContentIds: data.additional_content_ids,
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
  enabled = true,
  session,
}: {
  type: 'images' | 'videos' | 'gifs' | 'stickers' | 'animated_stickers' | 'all';
  excludeUsed: boolean;
  pagination: Pagination;
  enabled?: boolean;
  session: Session | null;
}) => {
  // First get the recommended prompts
  const recommendedQuery = useGetRecommendedPrompts({
    type,
    excludeUsed,
    pagination,
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
      if (!session || !recommendedQuery.data?.prompts?.length) return [];

      const detailPromises = recommendedQuery.data.prompts.map(async prompt => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${prompt.id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: session.authToken,
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
    enabled: !!session && !!recommendedQuery.data?.prompts?.length && enabled,
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
    }: {
      session: Session | null;
      type: 'images' | 'videos' | 'stickers' | 'animated_stickers';
      name: string;
    }) => {
      if (!session) return;
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify({ name: name, type: type }),
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
  type?: 'images' | 'videos' | 'stickers' | 'animated_stickers'
) => {
  return useQuery({
    queryKey: ['my-prompts', session?.authToken, pagination, type],
    queryFn: async () => {
      if (!session) return;
      const params = new URLSearchParams({
        account: session.id,
        page: pagination.page?.toString() ?? '1',
        size: pagination.size?.toString() ?? '10',
        sort_by: 'created_at',
        sort_order: 'desc',
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-prompts'] });
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

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${prompt.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify({
            name: prompt.name,
            description: prompt.description,
            versions: prompt.versions,
            prompt: prompt.prompt,
            additionalContentIds: prompt.additionalContentIds,
            contracts: prompt.contracts,
            max_tokens: prompt.maxTokens,
            min_tokens: prompt.minTokens,
            model: prompt.model,
            published: prompt.published! > 0 ? true : false,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update prompt: ${response.status}`
        );
      }

      return (await response.json()) as Prompt;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({
        queryKey: ['prompts'],
      });

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
