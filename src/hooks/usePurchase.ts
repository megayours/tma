import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { safeParse, getValidationErrors } from '@/utils/validation';
import type { Session } from '@/auth/useAuth';
import type { Token } from '@/types/response';

// Execute response schema (from sticker-pack/{id}/execute)
const ExecuteResponseSchema = z.object({
  execution_id: z.string(),
  status: z.enum(['processing', 'completed', 'failed']),
  message: z.string(),
});

export type ExecuteResponse = z.infer<typeof ExecuteResponseSchema>;

// Purchase states
export type PurchaseState = 'idle' | 'processing' | 'success' | 'error';

interface UsePurchaseOptions {
  onSuccess?: (data: ExecuteResponse) => void;
  onError?: (error: Error) => void;
}

export const usePurchase = (
  session: Session | null | undefined,
  options?: UsePurchaseOptions
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      stickerPackId,
      tokens,
      effectStyle = 'basic',
    }: {
      stickerPackId: number;
      tokens?: Token[];
      effectStyle?: 'basic' | 'gold' | 'legendary';
    }): Promise<ExecuteResponse> => {
      if (!session?.authToken) {
        throw new Error('Authentication required for purchase');
      }

      try {
        const url = `${import.meta.env.VITE_PUBLIC_API_URL}/sticker-pack/${stickerPackId}/execute`;

        const requestBody = {
          effect_style: effectStyle, // Accepted values: basic, gold, legendary
          ...(tokens &&
            tokens.length > 0 && {
              tokens: tokens.map(token => ({
                chain: token.contract.chain,
                contract_address: token.contract.address,
                token_id: token.id,
              })),
            }),
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              errorData.error ||
              `Purchase failed with status: ${response.status}`
          );
        }

        const rawData = await response.json();

        // Validate response data
        const validatedResponse = safeParse(ExecuteResponseSchema, rawData);
        if (!validatedResponse) {
          const errors = getValidationErrors(ExecuteResponseSchema, rawData);
          console.error('Response validation failed for purchase:', rawData);
          console.error('Validation errors:', errors);
          throw new Error(`Invalid response data format: ${errors}`);
        }

        return validatedResponse;
      } catch (error) {
        console.error('ERROR processing purchase:', error);
        throw error;
      }
    },
    onSuccess: data => {
      // Invalidate sticker packs queries to refresh purchase status
      queryClient.invalidateQueries({ queryKey: ['sticker-packs'] });
      queryClient.invalidateQueries({ queryKey: ['sticker-pack'] });

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error('Purchase failed:', error);
      options?.onError?.(error);
    },
  });

  const purchaseStickerPack = (
    stickerPackId: number,
    tokens?: Token[],
    effectStyle: 'basic' | 'gold' | 'legendary' = 'basic'
  ) => {
    return mutation.mutate({ stickerPackId, tokens, effectStyle });
  };

  return {
    // Purchase function
    purchaseStickerPack,

    // Mutation state
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,

    // Purchase state
    state: mutation.isPending
      ? 'processing'
      : mutation.isSuccess
        ? 'success'
        : mutation.isError
          ? 'error'
          : ('idle' as PurchaseState),

    // Reset function
    reset: mutation.reset,
  };
};
