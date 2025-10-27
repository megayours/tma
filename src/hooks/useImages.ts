import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
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

export function useGetPublicImage(imageId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['public-image', imageId],
    queryFn: async (): Promise<string> => {
      try {
        const url = `${import.meta.env.VITE_PUBLIC_API_URL}/images/public/${imageId}`;

        // Fetch the image directly without using apiGet
        const response = await fetch(url, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response is JSON (contains { image: "..." }) or raw image data
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          // Response is JSON with base64 image
          const data = await response.json();
          return data.image || data;
        } else {
          // Response is raw image data - convert to blob URL or base64
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }
      } catch (error) {
        console.error('Error fetching public image:', error);
        throw error;
      }
    },
    enabled: !!imageId,
  });

  return { imageData: data, isLoading };
}
