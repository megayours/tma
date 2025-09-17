import { useMyRecentGenerations } from '@/hooks/useContents';
import type { Session } from '@/auth/useAuth';

interface UseMyGenerationsParallelParams {
  pagination?: {
    page?: number;
    size?: number;
  };
  days?: string;
}

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

  const stickerPacksQuery = useMyRecentGenerations(
    { ...baseParams, type: 'sticker_packs' },
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
        return stickerPacksQuery.data;
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