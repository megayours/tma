import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { Pagination, Filter } from '@/types/requests';
import type { Token } from '../types/token';
import type { PaginationResponse } from '../types/response';
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
        const response = await apiGet<any>(
          `${import.meta.env.VITE_PUBLIC_API_URL}/images/statuses`,
          {
            prompt_id: params.promptId,
            sort_by: params.filters?.sortBy,
            sort_order: params.filters?.sortOrder,
            page: params.pagination?.page,
            size: params.pagination?.size,
          }
        );
        return {
          images: response.data.map((image: any) => ({
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
        console.log('ERROR', error);
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
        const response = await apiGet<any>(
          `${import.meta.env.VITE_PUBLIC_API_URL}/images/data/${imageId}`
        );

        if (!response) {
          throw new Error('No data received from API');
        }

        const image = {
          id: response.id,
          createdAt: response.created_at,
          creatorId: response.creator_id,
          image: response.image,
          prompt: response.prompt as CompactPrompt,
          token: response.token as Token,
          tokens: response.tokens as Token[],
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
