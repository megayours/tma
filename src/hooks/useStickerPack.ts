import { useQuery } from '@tanstack/react-query';
import type { Session } from '@/auth/useAuth';

// Sticker Pack Execution Types
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
}

export interface StickerPackExecution {
  id: string;
  bundle_id: number;
  user_account_id: string;
  nft_token_id: number;
  effect_style: string;
  status: 'pending_payment' | 'processing' | 'completed' | 'failed' | 'cancelled';
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
  status?: 'pending_payment' | 'processing' | 'completed' | 'failed' | 'cancelled';
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

      const data: StickerPackExecutionsResponse = await response.json();
      return data;
    },
    enabled: !!session,
    // Optional: Add polling for processing executions
    refetchInterval: (query) => {
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

      const data: StickerPackExecution = await response.json();
      return data;
    },
    enabled: !!session && !!executionId,
    // Poll every 5 seconds if status is processing
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'processing' ? 5000 : false;
    },
    refetchIntervalInBackground: true,
  });
};