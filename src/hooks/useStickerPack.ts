import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@/auth/useAuth';
import type { ExecutionStatus } from '@/types/executionStatus';

// Sticker Pack Execution Types
export interface RegenerateItemResponse {
  execution_id: string;
  item_id: number;
  status: string;
  message: string;
}

export interface StickerPackNFTToken {
  contract: {
    chain: string;
    address: string;
    name: string;
  };
  id: string;
}

export interface StickerPackBundle {
  id: number;
  name: string;
  description: string | null;
  type: string;
  is_active: boolean;
  created_by_admin_id: string;
  created_at: number;
  updated_at: number;
}

export interface StickerPackBundleItem {
  id: number;
  bundle_id: number;
  prompt_collection_id: number;
  sort_order: number;
  created_at: number;
  preview_url: string;
  prompt: {
    id: number;
    name: string;
  };
}

export interface StickerPackExecutionItem {
  id: number;
  execution_id: string;
  bundle_item_id: number;
  generated_content_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  sort_order: number;
  regeneration_count: number;
  previous_content_ids: string[];
  last_regenerated_at: number | null;
  created_at: number;
  updated_at: number;
  bundle_item: StickerPackBundleItem;
  generated_content?: {
    id: string;
    status: string;
    type: string;
    variant: string;
    created_at: number;
    creator_id: string;
    prompt_id: number;
  };
  generated_content_url?: string;
  can_regenerate: boolean;
}

export interface StickerPackExecution {
  id: string;
  bundle_id: number;
  user_account_id: string;
  nft_token_id: number;
  effect_style: string;
  status:
    | 'pending_payment'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';
  total_prompts: number;
  completed_prompts: number;
  error_message: string | null;
  telegram_pack_url: string | null;
  created_at: number;
  updated_at: number;
  bundle: StickerPackBundle;
  nft_token: StickerPackNFTToken;
  items: StickerPackExecutionItem[];
  progress_percentage: number;
  queueInfo?: {
    position: number;
    estimatedCompletionTime: string;
  };
}

export interface StickerPackExecutionsResponse {
  data: StickerPackExecution[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface UseStickerPackExecutionsParams {
  pagination?: {
    page?: number;
    size?: number;
  };
  status?:
    | 'pending_payment'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';
  bundle_id?: number;
}

export const useStickerPackExecutions = (
  params: UseStickerPackExecutionsParams,
  session: Session | null
) => {
  return useQuery({
    queryKey: ['sticker-pack-executions', params, session?.authToken],
    queryFn: async (): Promise<StickerPackExecutionsResponse> => {
      if (!session) {
        throw new Error('Session required');
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.pagination?.page) {
        queryParams.append('page', params.pagination.page.toString());
      }
      if (params.pagination?.size) {
        queryParams.append('size', params.pagination.size.toString());
      }
      if (params.status) {
        queryParams.append('status', params.status);
      }
      if (params.bundle_id) {
        queryParams.append('bundle_id', params.bundle_id.toString());
      }

      const queryString = queryParams.toString();
      const url = `${import.meta.env.VITE_PUBLIC_API_URL}/sticker-pack/executions${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: session.authToken,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      // Transform queue_info to queueInfo with camelCase properties for each execution
      const data: StickerPackExecutionsResponse = {
        ...rawData,
        data: rawData.data.map((execution: any) => ({
          ...execution,
          queueInfo: execution.queueInfo
            ? {
                position: execution.queueInfo.position,
                estimatedCompletionTime:
                  execution.queueInfo.estimatedCompletionTime,
              }
            : undefined,
        })),
      };

      return data;
    },
    enabled: !!session,
    // Optional: Add polling for processing executions
    refetchInterval: query => {
      // Check if any execution has "processing" status
      const hasProcessingExecution = query.state.data?.data?.some(
        (execution: StickerPackExecution) => execution.status === 'processing'
      );
      // Poll every 5 seconds if there's processing content, otherwise don't poll
      return hasProcessingExecution ? 5000 : false;
    },
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  });
};

export const useStickerPackExecutionById = (
  executionId: string | null,
  session: Session | null
) => {
  return useQuery({
    queryKey: ['sticker-pack-execution', executionId, session?.authToken],
    queryFn: async (): Promise<StickerPackExecution> => {
      if (!session || !executionId) {
        throw new Error('Session and execution ID required');
      }

      const url = `${import.meta.env.VITE_PUBLIC_API_URL}/sticker-pack/executions/${executionId}/status`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: session.authToken,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      // Transform queue_info to queueInfo with camelCase properties
      const data: StickerPackExecution = {
        ...rawData,
        queueInfo: rawData.queue_info
          ? {
              position: rawData.queue_info.position,
              estimatedCompletionTime:
                rawData.queue_info.estimated_completion_time,
              estimatedMinutes: rawData.queue_info.estimated_minutes,
              estimatedTimeMessage: rawData.queue_info.estimated_time_message,
            }
          : undefined,
      };

      return data;
    },
    enabled: !!session && !!executionId,
    // Poll every 2 seconds until execution is completed AND no items are processing
    refetchInterval: query => {
      const execution = query.state.data;
      if (!execution) return false;

      const executionNotCompleted = execution.status !== 'completed';
      const hasProcessingItems = execution.items?.some(
        item => item.status === 'pending' || item.status === 'processing'
      );

      return executionNotCompleted || hasProcessingItems ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });
};

/**
 * Hook to get the latest execution for a specific bundle_id
 * Useful for showing the most recent generation on a bundle page
 */
export const useGetExecution = (
  bundleId: number | null,
  session: Session | null,
  statusFilter?: ExecutionStatus
) => {
  return useQuery({
    queryKey: ['latest-execution', bundleId, statusFilter, session?.authToken],
    queryFn: async (): Promise<StickerPackExecution | null> => {
      if (!session || !bundleId) {
        throw new Error('Session and bundle ID required');
      }

      // Build query parameters to get the latest execution
      const queryParams = new URLSearchParams();
      queryParams.append('page', '1');
      queryParams.append('size', '1');
      queryParams.append('bundle_id', bundleId.toString());
      if (statusFilter) {
        queryParams.append('status', statusFilter);
      }

      const url = `${import.meta.env.VITE_PUBLIC_API_URL}/sticker-pack/executions?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: session.authToken,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      // Transform queue_info to queueInfo with camelCase properties for each execution
      const data: StickerPackExecutionsResponse = {
        ...rawData,
        data: rawData.data.map((execution: any) => ({
          ...execution,
          queueInfo: execution.queue_info
            ? {
                position: execution.queue_info.position,
                estimatedCompletionTime:
                  execution.queue_info.estimated_completion_time,
              }
            : undefined,
        })),
      };

      // Return the first (latest) execution or null if none found
      return data.data.length > 0 ? data.data[0] : null;
    },
    enabled: !!session && !!bundleId,
    // Poll every 2 seconds if execution is not completed or any items are pending/processing
    refetchInterval: query => {
      const execution = query.state.data;
      if (!execution) return false;

      // Check if execution status is not completed
      const executionNotCompleted = execution.status !== 'completed';

      // Check if any items are still pending or processing
      const hasProcessingItems = execution.items?.some(
        item => item.status === 'pending' || item.status === 'processing'
      );

      return executionNotCompleted || hasProcessingItems ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });
};

/**
 * Hook to regenerate a specific item in a sticker pack execution
 */
export const useRegenerateItem = (
  executionId: string | null,
  session: Session | null
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number): Promise<RegenerateItemResponse> => {
      if (!session || !executionId) {
        throw new Error('Session and execution ID required');
      }

      const url = `${import.meta.env.VITE_PUBLIC_API_URL}/sticker-pack/executions/${executionId}/items/${itemId}/regenerate`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: session.authToken,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RegenerateItemResponse = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate the execution queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['sticker-pack-execution', executionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['latest-execution'],
      });
      queryClient.invalidateQueries({
        queryKey: ['sticker-pack-executions'],
      });
      // Invalidate content queries so profile page shows updated content
      queryClient.invalidateQueries({
        queryKey: ['content'],
      });
    },
    onError: error => {
      console.error('Error regenerating item:', error);
    },
  });
};
