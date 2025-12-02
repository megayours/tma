import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { safeParse, getValidationErrors } from '@/utils/validation';
import {
  type Content,
  type Token,
  RawContentListResponseSchema,
  RawContentResponseSchema,
  ShareResponseSchema,
  type ShareResponse,
} from '../types/response';
import type { Session } from '@/auth/useAuth';
import type { Contract } from '../types/contract';

export const useGetContents = (
  session: Session | null | undefined,
  account: string,
  revealed?: boolean,
  pagination?: { page: number; size: number },
  order?: { sort_by: 'created_at'; sort_order: 'asc' | 'desc' },
  type?: 'image' | 'video' | 'sticker' | 'animated_sticker'
) => {
  const paginationParams = pagination || { page: 1, size: 10 };
  const orderParams = order || { sort_by: 'created_at', sort_order: 'desc' };
  return useQuery({
    queryKey: [
      'content',
      session?.id,
      account,
      paginationParams.page,
      paginationParams.size,
      revealed,
      type,
    ],
    queryFn: async () => {
      if (!session) return;

      const queryParams = new URLSearchParams({
        account: account,
        page: paginationParams?.page.toString(),
        size: paginationParams?.size.toString(),
        sort_by: orderParams?.sort_by,
        sort_order: orderParams?.sort_order,
        ...(revealed != null && { revealed: revealed.toString() }),
        ...(type && { type }),
      });
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/content?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session?.authToken,
          },
        }
      );
      if (!response.ok) {
        throw Error('Failed to GET contents');
      }
      const data = await response.json();

      // Validate and transform with Zod schema
      const result = safeParse(RawContentListResponseSchema, data);
      if (!result) {
        const errors = getValidationErrors(RawContentListResponseSchema, data);
        console.error('Content validation errors:', errors);
        throw new Error('Invalid content response format');
      }

      return {
        pagination: result.pagination,
        contents: result.data as Content[],
      };
    },
    enabled: !!session,
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

      // Validate and transform with Zod schema
      const result = safeParse(RawContentListResponseSchema, data);
      if (!result) {
        const errors = getValidationErrors(RawContentListResponseSchema, data);
        console.error('Preview content validation errors:', errors);
        throw new Error('Invalid preview content response format');
      }

      return {
        pagination: result.pagination,
        content: result.data as Content[],
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
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
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
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['my-recent-generations'] });
    },
  });
};

export const useRevealAllContent = (session: Session | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!session) {
        throw new Error('Session required');
      }

      // Reveal all content in parallel
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/content/reveal-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to reveal_all content: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['my-recent-generations'] });
    },
  });
};

export const useUploadContent = (session: Session | null | undefined) => {
  return useMutation({
    mutationFn: async (content: string) => {
      if (!session) {
        throw new Error('Session required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/content/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to upload content: ${response.status}`
        );
      }

      const data = await response.json();
      console.log('Content uploaded successfully:', data);
      return data as { id: string; type: string; url: string };
    },
  });
};

// Track content status with polling using /content/{id}
export const useContentExecution = (
  executionId: string,
  session: Session | null | undefined,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery<Content>({
    queryKey: ['content-execution', executionId],
    queryFn: async () => {
      if (!session) {
        throw new Error('Session required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/content/${executionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch content status: ${response.status}`);
      }

      const data = await response.json();

      // Validate and transform with Zod schema
      const result = safeParse(RawContentResponseSchema, data);
      if (!result) {
        const errors = getValidationErrors(RawContentResponseSchema, data);
        console.error('Content execution validation errors:', errors);
        throw new Error('Invalid content execution response format');
      }

      return result as Content;
    },
    enabled: !!session && !!executionId && options?.enabled !== false,
    refetchInterval: query => {
      // Poll every 2 seconds if status is processing
      const isProcessing = query.state.data?.status === 'processing';
      return isProcessing ? 2000 : false;
    },
    refetchIntervalInBackground: true, // Continue polling when tab is not active
  });
};

// Share content to external integrations (e.g., Giphy)
export const useShareContent = (session: Session | null | undefined) => {
  return useMutation({
    mutationFn: async (contentId: string) => {
      if (!session) {
        throw new Error('Session required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/content/${contentId}/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to share content: ${response.status}`
        );
      }

      const data = await response.json();

      // Validate and transform with Zod schema
      const result = safeParse(ShareResponseSchema, data);
      if (!result) {
        const errors = getValidationErrors(ShareResponseSchema, data);
        console.error('Share response validation errors:', errors);
        throw new Error('Invalid share response format');
      }

      return result as ShareResponse;
    },
  });
};
