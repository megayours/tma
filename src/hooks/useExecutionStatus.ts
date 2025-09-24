import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { safeParse } from '@/utils/validation';
import type { Session } from '@/auth/useAuth';

// Execution status response schema
const ExecutionStatusSchema = z.object({
  id: z.string(),
  bundle_id: z.number(),
  user_account_id: z.string(),
  nft_token_id: z.number().optional(),
  effect_style: z.enum(['basic', 'gold', 'legendary']),
  status: z.enum([
    'pending_payment',
    'processing',
    'completed',
    'error',
    'cancelled',
  ]),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  total_prompts: z.number(),
  completed_prompts: z.number(),
  telegram_pack_url: z.string().nullable(),
  progress_percentage: z.number(),
  error_message: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.number(),
        status: z.string(),
        generated_content_id: z.string().optional(),
        sort_order: z.number(),
      })
    )
    .optional(),
});

export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;

interface UseExecutionStatusOptions {
  session: Session | null | undefined;
  executionId: string | null;
  pollingInterval?: number; // in milliseconds, default 2000
  onStatusChange?: (status: ExecutionStatus) => void;
  onComplete?: (status: ExecutionStatus) => void;
  onError?: (status: ExecutionStatus) => void;
}

export const useExecutionStatus = ({
  session,
  executionId,
  pollingInterval = 2000,
  onStatusChange,
  onComplete,
  onError,
}: UseExecutionStatusOptions) => {
  const [status, setStatus] = useState<ExecutionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!executionId || !session?.authToken) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/sticker-pack/executions/${executionId}/status`,
        {
          headers: {
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }

      const rawData = await response.json();
      const validatedStatus = safeParse(ExecutionStatusSchema, rawData);

      if (!validatedStatus) {
        throw new Error('Invalid status response format');
      }

      setStatus(validatedStatus);
      setError(null);
      onStatusChange?.(validatedStatus);

      // Handle completion or error
      if (validatedStatus.status === 'completed') {
        onComplete?.(validatedStatus);
      } else if (validatedStatus.status === 'error') {
        onError?.(validatedStatus);
      }

      return validatedStatus;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      console.error('Failed to fetch execution status:', errorObj);
      throw errorObj;
    }
  }, [executionId, session?.authToken, onStatusChange, onComplete, onError]);

  useEffect(() => {
    if (!executionId || !session?.authToken) {
      return;
    }

    setLoading(true);

    // Initial fetch
    fetchStatus().finally(() => setLoading(false));

    // Set up polling interval
    const interval = setInterval(() => {
      fetchStatus().catch(console.error);
    }, pollingInterval);

    // Stop polling if execution is completed, errored, or cancelled
    if (
      status?.status &&
      ['completed', 'error', 'cancelled'].includes(status.status)
    ) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [
    executionId,
    session?.authToken,
    pollingInterval,
    fetchStatus,
    status?.status,
  ]);

  // Stop polling when status reaches final state
  useEffect(() => {
    if (
      status?.status &&
      ['completed', 'error', 'cancelled'].includes(status.status)
    ) {
      setLoading(false);
    }
  }, [status?.status]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
    isCompleted: status?.status === 'completed',
    isProcessing: status?.status === 'processing',
    isPendingPayment: status?.status === 'pending_payment',
    isError: status?.status === 'error',
    progressPercentage: status?.progress_percentage || 0,
  };
};
