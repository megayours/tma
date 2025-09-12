import { useQuery } from '@tanstack/react-query';
import type { Pagination, Filter } from '@/types/requests';
import type { Token, PaginationResponse } from '../types/response';
import type { Image, ImageStatus } from '../types/image';
import type { CompactPrompt } from '../types/prompt';

export interface LatestImagesParams {
  promptId: string;
  pagination?: Pagination;
  filters?: Filter;
}

export function useGetLatestImages(params: LatestImagesParams) {
  const { data, isLoading } = useQuery({
    queryKey: ['latest-images', params],
    queryFn: async (): Promise<{
      images: ImageStatus[];
      pagination: PaginationResponse;
    }> => {
      try {
        const queryParams = new URLSearchParams({
          prompt_id: params.promptId,
          ...(params.filters?.sortBy && { sort_by: params.filters.sortBy }),
          ...(params.filters?.sortOrder && { sort_order: params.filters.sortOrder }),
          ...(params.pagination?.page && { page: params.pagination.page.toString() }),
          ...(params.pagination?.size && { size: params.pagination.size.toString() }),
        });

        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API_URL}/images/statuses?${queryParams}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
          images: data.data.map((image: any) => ({
            id: image.id,
            creatorId: image.creator_id,
            promptId: image.prompt_id,
            createdAt: image.created_at,
            status: image.status,
            token: image.token as Token,
            type: image.type,
            variant: image.variant,
          })),
          pagination: params.pagination as PaginationResponse,
        };
      } catch (error) {
        throw error;
      }
    },
    enabled: !!params.promptId,
  });

  return { images: data, isLoading };
}

export function useGetImage(imageId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['image', imageId],
    queryFn: async (): Promise<Image> => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API_URL}/images/data/${imageId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data) {
          throw new Error('No data received from API');
        }

        const image = {
          id: data.id,
          createdAt: data.created_at,
          creatorId: data.creator_id,
          image: data.image,
          prompt: data.prompt as CompactPrompt,
          token: data.token as Token,
          tokens: data.tokens as Token[],
        };
        return image;
      } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
      }
    },
    enabled: !!imageId,
  });

  return { image: data, isLoading };
}
