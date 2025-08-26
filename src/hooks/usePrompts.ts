'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import type { Session } from '@/auth/useAuth';
import type { Prompt, Version } from '@/types/prompt';

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

      const mappedPrompts: PromptWithContent[] = response.data.map(
        mapRawPromptToPromptWithContent
      );

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

export const useGetPrompt = (promptId: string, session: Session | null) => {
  return useQuery({
    queryKey: ['prompt', promptId, session?.authToken],
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
          id: version.id,
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
        id: data.id,
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
          id: version.id,
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
