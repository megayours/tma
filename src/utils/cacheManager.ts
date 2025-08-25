import { clearCachedFavorite } from './favoriteCache';
import {
  clearCachedImage,
  getImageCacheInfo,
  getCachedImageData,
} from './imageCache';

// Combined cache manager for favorites and images
export const clearAllUserCache = (userId: string) => {
  clearCachedFavorite(userId);
  clearCachedImage(userId);
};

// Get comprehensive cache info for a user
export const getUserCacheInfo = (userId: string) => {
  const imageCacheInfo = getImageCacheInfo(userId);
  const imageData = getCachedImageData(userId);

  return {
    image: imageCacheInfo,
    imageData,
    totalSize: imageCacheInfo.imageSize,
    hasCachedData: imageCacheInfo.hasImage,
    lastUpdated: imageData?.timestamp ? new Date(imageData.timestamp) : null,
  };
};

// Check if user has any cached data
export const hasUserCache = (userId: string): boolean => {
  const imageCacheInfo = getImageCacheInfo(userId);
  return imageCacheInfo.hasImage;
};
