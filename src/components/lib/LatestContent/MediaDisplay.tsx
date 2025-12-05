import { useEffect, useRef, useState } from 'react';

interface MediaDisplayProps {
  src: string;
  alt: string;
  className?: string;
  bg?: string;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  containerClassName?: string;
}

// Utility function to detect webm files, handling URLs with query parameters
const isWebm = (url: string): boolean => {
  try {
    // Try parsing as URL to extract pathname
    const urlObj = new URL(url);
    return urlObj.pathname.toLowerCase().includes('.webm');
  } catch {
    // If URL parsing fails, fall back to simple check
    return url.toLowerCase().includes('.webm');
  }
};

export function MediaDisplay({
  src,
  alt,
  className = '',
  bg,
  priority = false,
  loading,
  containerClassName = '',
}: MediaDisplayProps) {
  const [isInView, setIsInView] = useState(priority); // Only load if priority OR in viewport
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVideo = isWebm(src);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Determine loading strategy
  const loadingAttr = loading || (priority ? 'eager' : 'lazy');
  const fetchPriority = priority ? ('high' as const) : undefined;

  // Placeholder while loading
  const placeholder = (
    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
  );

  // Render media element ONLY when in view
  const mediaElement = isInView ? (
    isVideo ? (
      <video
        src={src}
        className={`object-contain ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={handleLoad}
      />
    ) : (
      <img
        src={src}
        alt={alt}
        className={`object-contain ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading={loadingAttr}
        decoding="async"
        onLoad={handleLoad}
        {...(fetchPriority && { fetchpriority: fetchPriority })}
      />
    )
  ) : null;

  // If background is provided, wrap with background overlay
  if (bg) {
    return (
      <div
        ref={containerRef}
        className={`relative flex h-full w-full items-center justify-center ${containerClassName}`}
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {!isLoaded && placeholder}
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/50 p-5 shadow-2xl">
          {mediaElement}
        </div>
      </div>
    );
  }

  // Otherwise, render media directly
  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full items-center justify-center ${containerClassName}`}
    >
      {!isLoaded && placeholder}
      {mediaElement}
    </div>
  );
}
