import type { Favorite } from '@/hooks/useFavorites';

// Helper functions for localStorage
export const getCachedFavorite = (userId: string): Favorite | null => {
  try {
    const cached = localStorage.getItem(`last-favorite-${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const setCachedFavorite = (userId: string, favorite: Favorite) => {
  try {
    localStorage.setItem(`last-favorite-${userId}`, JSON.stringify(favorite));
  } catch {
    // Ignore localStorage errors
  }
};

// Utility to clear cached favorite
export const clearCachedFavorite = (userId: string) => {
  try {
    localStorage.removeItem(`last-favorite-${userId}`);
  } catch {
    // Ignore localStorage errors
  }
};

// Utility to check if user has cached data
export const hasCachedFavorite = (userId: string): boolean => {
  try {
    return !!localStorage.getItem(`last-favorite-${userId}`);
  } catch {
    return false;
  }
};

// Utility to get cache info for debugging
export const getFavoriteCacheInfo = (userId: string) => {
  try {
    const favorite = localStorage.getItem(`last-favorite-${userId}`);

    return {
      hasFavorite: !!favorite,
      favoriteSize: favorite ? new Blob([favorite]).size : 0,
    };
  } catch {
    return {
      hasFavorite: false,
      favoriteSize: 0,
    };
  }
};
