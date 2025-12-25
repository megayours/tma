import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholderClassName?: string;
}

/**
 * LazyImage component with IntersectionObserver and blur-up effect
 *
 * Features:
 * - IntersectionObserver for precise lazy loading
 * - Blur-up placeholder animation
 * - Priority loading for above-the-fold images
 * - Error handling
 *
 * @param src - Image source URL
 * @param alt - Alt text for accessibility
 * @param className - Additional CSS classes for the image
 * @param priority - If true, load image immediately (for above-fold images)
 * @param onLoad - Callback when image loads successfully
 * @param onError - Callback when image fails to load
 * @param placeholderClassName - Additional CSS classes for the placeholder
 */
export function LazyImage({
  src,
  alt,
  className = '',
  priority = false,
  onLoad,
  onError,
  placeholderClassName = '',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before visible
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {/* Placeholder with blur-up effect */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700 ${placeholderClassName}`}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
          Failed to load
        </div>
      )}

      {/* Actual image - only render when in view */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`${className} ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
