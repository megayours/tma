import { useQuery } from '@tanstack/react-query';
import { safeParse, getValidationErrors } from '@/utils/validation';
import { RawContentListResponseSchema, type Content } from '../types/response';
import type { Session } from '@/auth/useAuth';

interface UseNotificationsReturn {
  count: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useNotifications = (
  session: Session | null | undefined
): UseNotificationsReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content', session?.id, 1, 10, false],
    queryFn: async () => {
      if (!session) return;

      const queryParams = new URLSearchParams({
        account: session.id,
        page: '1',
        size: '10',
        sort_by: 'created_at',
        sort_order: 'desc',
        revealed: 'false',
      });

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/content?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      // Validate and transform with Zod schema
      const result = safeParse(RawContentListResponseSchema, data);
      if (!result) {
        const errors = getValidationErrors(RawContentListResponseSchema, data);
        console.error('Notifications validation errors:', errors);
        throw new Error('Invalid notifications response format');
      }

      return {
        pagination: result.pagination,
        contents: result.data as Content[],
      };
    },
    enabled: !!session,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true, // Continue polling when tab not active
  });

  return {
    count: data?.contents?.length ?? 0,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
