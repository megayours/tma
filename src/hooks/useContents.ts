import { useQuery } from '@tanstack/react-query';
import { ContentFiltersSchema, type ContentFilters } from '../types/requests';
import { safeParse } from '@/utils/validation';
import { apiGet } from '../lib/api';
import {
  type ContentListResponse,
  type RawContentListResponse,
  type RawContentResponse,
  RawContentListResponseSchema,
} from '../types/response';

// Helper function to map raw content to expected format
const mapRawContentToContent = (rawContent: RawContentResponse) => ({
  id: rawContent.id,
  status: rawContent.status,
  error: rawContent.error,
  type: rawContent.type,
  variant: rawContent.variant,
  createdAt: rawContent.created_at,
  creatorId: rawContent.creator_id,
  token: rawContent.token,
  tokens: rawContent.tokens,
  promptId: rawContent.prompt_id,
});

export const useGetContent = (params: ContentFilters) => {
  return useQuery({
    queryKey: ['content', params],
    queryFn: async (): Promise<ContentListResponse> => {
      const validatedParams = safeParse(ContentFiltersSchema, params);
      if (!validatedParams) {
        throw new Error('Invalid parameters');
      }

      try {
        // Build parameters object
        const apiParams = {
          type: validatedParams.type,
          prompt_id: validatedParams.promptId,
          prompt_version: validatedParams.promptVersion,
          account: validatedParams.account,
          chain: validatedParams.chain,
          contract_address: validatedParams.contractAddress,
          token_id: validatedParams.tokenId,
          created_after: validatedParams.createdAfter,
          sort_by: validatedParams.filters?.sortBy,
          sort_order: validatedParams.filters?.sortOrder,
          page: validatedParams.pagination?.page,
          size: validatedParams.pagination?.size,
        };

        const rawData = await apiGet<RawContentListResponse>(
          `${import.meta.env.VITE_PUBLIC_API_URL}/content`,
          apiParams
        );

        // Validate raw response data
        const validatedRawData = safeParse(
          RawContentListResponseSchema,
          rawData
        );
        if (!validatedRawData) {
          throw new Error('Invalid response data');
        }

        // Map raw data to expected format
        const mappedData: ContentListResponse = {
          data: validatedRawData.data.map(mapRawContentToContent),
          pagination: validatedRawData.pagination,
        };

        return mappedData;
      } catch (error) {
        console.error('ERROR', error);
        throw error;
      }
    },
  });
};
