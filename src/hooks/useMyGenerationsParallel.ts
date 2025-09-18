import { useMyRecentGenerations } from '@/hooks/useContents';
import { useStickerPackExecutions, type StickerPackExecution } from '@/hooks/useStickerPack';
import type { Session } from '@/auth/useAuth';
import type { GenerationContent } from '@/types/response';

interface UseMyGenerationsParallelParams {
  pagination?: {
    page?: number;
    size?: number;
  };
  days?: string;
}

// Helper function to transform sticker pack executions to generation format
const transformStickerPackExecutions = (executions: StickerPackExecution[]): GenerationContent[] => {
  return executions.map(execution => {
    // Extract generated content URLs (actual personalized stickers)
    const generatedUrls = execution.items
      .map(item => item.generated_content_url)
      .filter((url): url is string => Boolean(url));

    // Extract preview URLs as fallback (templates)
    const previewUrls = execution.items
      .map(item => item.bundle_item.preview_url)
      .filter((url): url is string => Boolean(url));

    // Use generated stickers when available, fallback to previews
    const displayUrls = generatedUrls.length > 0 ? generatedUrls : previewUrls;
    const isShowingGenerated = generatedUrls.length > 0;

    return {
      id: execution.id,
      type: 'sticker' as const, // Sticker pack executions are sticker type
      path: '', // Not available in execution data
      url: displayUrls[0] || execution.telegram_pack_url || '', // Use first display URL or telegram pack URL
      preview_url: displayUrls[0] || null, // Use first display image
      watermarked_url: null, // Not available in execution data
      created_at: execution.created_at,
      revealed_at: execution.status === 'completed' ? execution.updated_at : null, // Consider completed as revealed
      creator_id: execution.user_account_id,
      creator_name: null, // Not available in execution data
      prompt: {
        id: execution.bundle.id,
        name: execution.bundle.name,
        // Add other prompt fields with defaults
        description: execution.bundle.description || '',
        image: displayUrls[0] || undefined, // Use first display URL as prompt image
        type: execution.bundle.type,
        published: 1,
        lastUsed: 0,
        createdAt: execution.bundle.created_at,
        updatedAt: execution.bundle.updated_at,
        usageCount: 0,
        contracts: [],
        images: displayUrls, // Store all display URLs (generated or preview)
        videos: [],
        gifs: [],
        versions: undefined,
        additionalContentIds: [],
      },
      tokens: [
        {
          id: execution.nft_token.id,
          name: execution.nft_token.contract.name,
          image: '',
          description: '',
          attributes: undefined,
          owner: undefined,
          contract: execution.nft_token.contract,
        }
      ],
      // Add custom properties for sticker pack specific data
      stickerPackData: {
        previewUrls: previewUrls,
        generatedUrls: generatedUrls,
        isShowingGenerated: isShowingGenerated,
        telegramPackUrl: execution.telegram_pack_url,
        totalPrompts: execution.total_prompts,
        completedPrompts: execution.completed_prompts,
        progressPercentage: execution.progress_percentage,
      },
    };
  });
};

export function useMyGenerationsParallel(
  params: UseMyGenerationsParallelParams,
  session: Session | null
) {
  const baseParams = {
    pagination: {
      page: params.pagination?.page || 1,
      size: params.pagination?.size || 20,
    },
    days: params.days || '30',
  };

  // Load all content types in parallel
  const allQuery = useMyRecentGenerations(
    { ...baseParams, type: 'all' },
    session
  );

  const stickerPacksQuery = useStickerPackExecutions(
    { pagination: baseParams.pagination },
    session
  );

  const imagesQuery = useMyRecentGenerations(
    { ...baseParams, type: 'images' },
    session
  );

  const videosQuery = useMyRecentGenerations(
    { ...baseParams, type: 'videos' },
    session
  );

  const stickersQuery = useMyRecentGenerations(
    { ...baseParams, type: 'stickers' },
    session
  );

  const animatedStickersQuery = useMyRecentGenerations(
    { ...baseParams, type: 'animated_stickers' },
    session
  );

  // Helper function to get data for specific content type
  const getDataForType = (contentType: 'all' | 'sticker_packs' | 'images' | 'videos' | 'stickers' | 'animated_stickers') => {
    switch (contentType) {
      case 'all':
        return allQuery.data;
      case 'sticker_packs':
        // Transform sticker pack executions to generation format
        if (stickerPacksQuery.data) {
          const transformedData = transformStickerPackExecutions(stickerPacksQuery.data.data);
          return {
            data: transformedData,
            pagination: stickerPacksQuery.data.pagination,
          };
        }
        return { data: [], pagination: { page: 1, size: 20, total: 0, totalPages: 0 } };
      case 'images':
        return imagesQuery.data;
      case 'videos':
        return videosQuery.data;
      case 'stickers':
        return stickersQuery.data;
      case 'animated_stickers':
        return animatedStickersQuery.data;
      default:
        return allQuery.data;
    }
  };

  // Helper function to check if specific content type is loading
  const getLoadingForType = (contentType: 'all' | 'sticker_packs' | 'images' | 'videos' | 'stickers' | 'animated_stickers') => {
    switch (contentType) {
      case 'all':
        return allQuery.isLoading;
      case 'sticker_packs':
        return stickerPacksQuery.isLoading;
      case 'images':
        return imagesQuery.isLoading;
      case 'videos':
        return videosQuery.isLoading;
      case 'stickers':
        return stickersQuery.isLoading;
      case 'animated_stickers':
        return animatedStickersQuery.isLoading;
      default:
        return allQuery.isLoading;
    }
  };

  return {
    // Individual query results
    queries: {
      all: allQuery,
      sticker_packs: stickerPacksQuery,
      images: imagesQuery,
      videos: videosQuery,
      stickers: stickersQuery,
      animated_stickers: animatedStickersQuery,
    },

    // Helper functions
    getDataForType,
    getLoadingForType,

    // Overall loading state (true only when initial 'all' query is loading)
    isInitialLoading: allQuery.isLoading && !allQuery.data,

    // Main error (from 'all' query)
    error: allQuery.error,

    // Check if any query is still loading
    isAnyLoading: allQuery.isLoading ||
                  stickerPacksQuery.isLoading ||
                  imagesQuery.isLoading ||
                  videosQuery.isLoading ||
                  stickersQuery.isLoading ||
                  animatedStickersQuery.isLoading,
  };
}