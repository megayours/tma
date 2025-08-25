// Type for cached image data
export type CachedImageData = {
  imageUrl: string;
  base64Data: string;
  timestamp: number;
};

// Helper function to preload image
const preloadImage = (src: string) => {
  if (!src) return;
  const img = new Image();
  img.src = src;
};

// Convert image to base64 for faster loading
export const cacheImageAsBase64 = async (
  imageUrl: string
): Promise<string | null> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// Cache base64 image data as a single object
export const setCachedBase64Image = (
  userId: string,
  imageUrl: string,
  base64Data: string
) => {
  try {
    const imageData: CachedImageData = {
      imageUrl,
      base64Data,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      `last-favorite-image-data-${userId}`,
      JSON.stringify(imageData)
    );
  } catch {
    // Ignore localStorage errors
  }
};

// Get cached base64 image data
export const getCachedBase64Image = (
  userId: string,
  imageUrl: string
): string | null => {
  try {
    const cachedData = localStorage.getItem(
      `last-favorite-image-data-${userId}`
    );
    if (!cachedData) return null;

    const imageData: CachedImageData = JSON.parse(cachedData);

    // Only return cached image if the URL matches (to avoid stale images)
    if (imageData.imageUrl === imageUrl && imageData.base64Data) {
      return imageData.base64Data;
    }
    return null;
  } catch {
    return null;
  }
};

// Get cached image data with timestamp
export const getCachedImageData = (userId: string): CachedImageData | null => {
  try {
    const cachedData = localStorage.getItem(
      `last-favorite-image-data-${userId}`
    );
    return cachedData ? (JSON.parse(cachedData) as CachedImageData) : null;
  } catch {
    return null;
  }
};

// Check if cached image is still fresh (within specified age limit)
const isCachedImageFresh = (
  userId: string,
  maxAgeMs: number = 24 * 60 * 60 * 1000
): boolean => {
  try {
    const imageData = getCachedImageData(userId);
    if (!imageData) return false;

    const age = Date.now() - imageData.timestamp;
    return age < maxAgeMs;
  } catch {
    return false;
  }
};

// Utility to check if cached image is fresh
export const isImageCacheFresh = (
  userId: string,
  maxAgeHours: number = 24
): boolean => {
  return isCachedImageFresh(userId, maxAgeHours * 60 * 60 * 1000);
};

// Utility to clear cached image
export const clearCachedImage = (userId: string) => {
  try {
    localStorage.removeItem(`last-favorite-image-data-${userId}`);
  } catch {
    // Ignore localStorage errors
  }
};

// Utility to get cache info for debugging
export const getImageCacheInfo = (userId: string) => {
  try {
    const imageData = localStorage.getItem(
      `last-favorite-image-data-${userId}`
    );

    const parsedImageData = imageData
      ? (JSON.parse(imageData) as CachedImageData)
      : null;

    return {
      hasImage: !!imageData,
      imageSize: imageData ? new Blob([imageData]).size : 0,
      imageTimestamp: parsedImageData?.timestamp || null,
      imageAge: parsedImageData?.timestamp
        ? Date.now() - parsedImageData.timestamp
        : null,
    };
  } catch {
    return {
      hasImage: false,
      imageSize: 0,
      imageTimestamp: null,
      imageAge: null,
    };
  }
};

// Preload image for faster display
export const preloadCachedImage = (imageUrl: string) => {
  if (imageUrl) {
    preloadImage(imageUrl);
  }
};
