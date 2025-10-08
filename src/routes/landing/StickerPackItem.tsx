import { useState, useEffect } from 'react';
import type { StickerBundles } from '../../hooks/useStickerPacks';

export function StickerPackItem({
  stickerPack,
}: {
  stickerPack: StickerBundles;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (stickerPack.preview_items.length <= 1) return;

    const interval = setInterval(
      () => {
        // Start fade out
        setIsVisible(false);

        // After fade out completes, change image and fade in
        setTimeout(() => {
          setCurrentIndex(
            prevIndex => (prevIndex + 1) % stickerPack.preview_items.length
          );
          setIsVisible(true);
        }, 500); // Match the CSS transition duration
      },
      Math.random() * 3000 + 2000
    );

    return () => clearInterval(interval);
  }, [stickerPack.preview_items.length]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-20 shrink-0 px-10 pt-10 text-2xl font-bold">
        {stickerPack.name}
      </div>
      <div className="relative flex-1 overflow-hidden">
        <img
          src={stickerPack.preview_items[currentIndex]?.preview_url}
          alt={`${stickerPack.name} preview ${currentIndex + 1}`}
          className={`absolute inset-0 h-full w-full object-contain p-4 transition-opacity duration-500 ease-in-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </div>
  );
}
