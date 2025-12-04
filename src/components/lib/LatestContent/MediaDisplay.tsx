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
  const isVideo = isWebm(src);

  // Determine loading strategy
  const loadingAttr = loading || (priority ? 'eager' : 'lazy');
  const fetchPriority = priority ? ('high' as const) : undefined;

  // Render media element
  const mediaElement = isVideo ? (
    <video
      src={src}
      className={`object-contain ${className}`}
      autoPlay
      loop
      muted
      playsInline
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
      className={`flex h-full w-full items-center justify-center ${containerClassName}`}
    >
      {mediaElement}
    </div>
  );
}
