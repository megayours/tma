// Type for cached image data
export type CachedImageData = {
  imageUrl: string;
  base64Data: string;
  timestamp: number;
};

// Type for LRU cache entry
type CacheEntry = {
  url: string;
  data: string;
  timestamp: number;
  lastAccessed: number;
  size: number;
};

// LRU Cache configuration
const CACHE_CONFIG = {
  maxEntries: 100, // Maximum number of cached images
  maxSizeBytes: 10 * 1024 * 1024, // 10MB max cache size
  maxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  cacheKeyPrefix: 'img-cache-',
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
    const response = await fetch(imageUrl, { mode: 'cors', cache: 'no-store' });
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

// ============================================
// LRU Cache Implementation for Multiple Images
// ============================================

/**
 * Get cache key for an image URL
 */
const getCacheKey = (url: string): string => {
  // Use a hash of the URL to keep keys short
  return CACHE_CONFIG.cacheKeyPrefix + btoa(url).substring(0, 40);
};

/**
 * Get all cached image keys
 */
const getAllCacheKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_CONFIG.cacheKeyPrefix)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Get total cache size in bytes
 */
const getCacheSize = (): number => {
  let totalSize = 0;
  const keys = getAllCacheKeys();
  keys.forEach(key => {
    const entry = localStorage.getItem(key);
    if (entry) {
      totalSize += entry.length;
    }
  });
  return totalSize;
};

/**
 * Evict least recently used cache entries
 */
const evictLRU = (requiredSpace: number = 0) => {
  const keys = getAllCacheKeys();
  const entries: Array<{ key: string; entry: CacheEntry }> = [];

  // Parse all entries
  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const entry = JSON.parse(data) as CacheEntry;
        entries.push({ key, entry });
      }
    } catch {
      // Remove corrupted entries
      localStorage.removeItem(key);
    }
  });

  // Sort by last accessed time (oldest first)
  entries.sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);

  // Remove stale entries first (older than maxAge)
  const now = Date.now();
  const staleEntries = entries.filter(
    ({ entry }) => now - entry.timestamp > CACHE_CONFIG.maxAgeMs
  );
  staleEntries.forEach(({ key }) => localStorage.removeItem(key));

  // If still over limit, remove oldest entries
  const remainingEntries = entries.filter(
    ({ entry }) => now - entry.timestamp <= CACHE_CONFIG.maxAgeMs
  );

  let currentSize = getCacheSize();
  let index = 0;

  // Evict until we're under limits
  while (
    (remainingEntries.length > CACHE_CONFIG.maxEntries ||
      currentSize + requiredSpace > CACHE_CONFIG.maxSizeBytes) &&
    index < remainingEntries.length
  ) {
    const { key, entry } = remainingEntries[index];
    localStorage.removeItem(key);
    currentSize -= entry.size;
    index++;
  }
};

/**
 * Cache an image in the LRU cache
 */
export const cacheImage = async (imageUrl: string): Promise<boolean> => {
  try {
    const base64Data = await cacheImageAsBase64(imageUrl);
    if (!base64Data) return false;

    const entry: CacheEntry = {
      url: imageUrl,
      data: base64Data,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      size: base64Data.length,
    };

    const key = getCacheKey(imageUrl);
    const entryString = JSON.stringify(entry);

    // Check if we need to evict entries
    if (
      getAllCacheKeys().length >= CACHE_CONFIG.maxEntries ||
      getCacheSize() + entryString.length > CACHE_CONFIG.maxSizeBytes
    ) {
      evictLRU(entryString.length);
    }

    localStorage.setItem(key, entryString);
    return true;
  } catch (error) {
    console.warn('Failed to cache image:', error);
    return false;
  }
};

/**
 * Get a cached image from the LRU cache
 */
export const getCachedImage = (imageUrl: string): string | null => {
  try {
    const key = getCacheKey(imageUrl);
    const data = localStorage.getItem(key);
    if (!data) return null;

    const entry = JSON.parse(data) as CacheEntry;

    // Check if entry is stale
    if (Date.now() - entry.timestamp > CACHE_CONFIG.maxAgeMs) {
      localStorage.removeItem(key);
      return null;
    }

    // Update last accessed time
    entry.lastAccessed = Date.now();
    localStorage.setItem(key, JSON.stringify(entry));

    return entry.data;
  } catch {
    return null;
  }
};

/**
 * Preload and cache an image
 */
export const preloadAndCacheImage = async (
  imageUrl: string
): Promise<void> => {
  // Check if already cached
  const cached = getCachedImage(imageUrl);
  if (cached) return;

  // Preload the image
  preloadImage(imageUrl);

  // Cache it for future use
  await cacheImage(imageUrl);
};

/**
 * Clear all cached images
 */
export const clearAllCachedImages = () => {
  const keys = getAllCacheKeys();
  keys.forEach(key => localStorage.removeItem(key));
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const keys = getAllCacheKeys();
  const totalSize = getCacheSize();

  return {
    totalEntries: keys.length,
    totalSizeBytes: totalSize,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    maxEntries: CACHE_CONFIG.maxEntries,
    maxSizeMB: CACHE_CONFIG.maxSizeBytes / (1024 * 1024),
    utilizationPercent: (
      (keys.length / CACHE_CONFIG.maxEntries) *
      100
    ).toFixed(1),
  };
};
