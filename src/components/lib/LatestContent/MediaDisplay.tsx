import { useEffect, useRef, useState } from 'react';
import { useVideoQueue } from '@/hooks/useVideoQueue';

interface MediaDisplayProps {
  src: string;
  alt: string;
  className?: string;
  bg?: string;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  containerClassName?: string;
  lazyLoad?: boolean;
  videoId?: string;
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
  lazyLoad = false,
  videoId,
}: MediaDisplayProps) {
  const isVideo = isWebm(src);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(!lazyLoad || priority);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  // Use video queue for videos with videoId
  const { enqueueVideo, dequeueVideo } = useVideoQueue(
    videoId || src,
    priority ? 1 : 0
  );

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || priority) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Start autoplay when 50% visible
            if (entry.intersectionRatio >= 0.5) {
              setShouldAutoPlay(true);
            }
          } else {
            setShouldAutoPlay(false);
          }
        });
      },
      {
        threshold: [0, 0.5],
        rootMargin: '50px',
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad, priority]);

  // Enqueue video for managed loading
  useEffect(() => {
    if (!isVideo || !isInView || !videoRef.current) return;

    const video = videoRef.current;

    if (videoId) {
      enqueueVideo(video);

      return () => {
        dequeueVideo();
      };
    }
  }, [isVideo, isInView, videoId, enqueueVideo, dequeueVideo]);

  // Determine loading strategy
  const loadingAttr = loading || (priority ? 'eager' : 'lazy');
  const fetchPriority = priority ? ('high' as const) : undefined;

  // Render media element
  const mediaElement = isVideo ? (
    <video
      ref={videoRef}
      src={isInView ? src : undefined}
      className={`object-contain ${className}`}
      autoPlay={shouldAutoPlay}
      loop
      muted
      playsInline
      poster={
        !isInView
          ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
          : undefined
      }
    />
  ) : (
    <img
      src={src}
      alt={alt}
      className={`object-contain ${className}`}
      loading={loadingAttr}
      decoding="async"
      {...(fetchPriority && { fetchpriority: fetchPriority })}
    />
  );

  // If background is provided, wrap with background overlay
  if (bg) {
    return (
      <div
        ref={containerRef}
        className={`flex h-full w-full items-center justify-center ${containerClassName}`}
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
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
      className={`flex h-full w-full items-center justify-center ${containerClassName}`}
    >
      {mediaElement}
    </div>
  );
}
