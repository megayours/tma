import { useState, useRef, useEffect } from 'react';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useSession } from '@/auth/SessionProvider';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { useGetDefaultAvatar } from '../../../hooks/useCommunities';

export function UserMenuComponent({ size = 40 }: { size?: number }) {
  const { session } = useSession();
  const { selectedCommunity } = useSelectCommunity();
  const { selectedFavorite } = useGetFavorites(session!);

  // Always call hooks before any early returns
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { data: token } = useGetDefaultAvatar(selectedCommunity?.id);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  return (
    <div className="relative">
      <div
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="border-tg-link flex cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 transition-all active:scale-95"
        style={{ width: size, height: size }}
      >
        {selectedFavorite ? (
          <img
            src={selectedFavorite.token.image || '/nfts/not-available.png'}
            alt={
              selectedFavorite.token.name || `NFT #${selectedFavorite.token.id}`
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={token?.image || '/lib/image_not_set.png'}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="bg-tg-section-bg border-tg-section-separator absolute top-full left-0 z-50 mt-2 min-w-[200px] rounded-lg border shadow-lg"
        >
          <div className="py-1">
            <button
              onClick={() => {
                // Add your menu action here
                console.log('Menu item 1 clicked');
                setIsMenuOpen(false);
              }}
              className="text-tg-text hover:bg-tg-section-separator w-full px-4 py-2 text-left transition-colors"
            >
              Menu Item 1
            </button>
            <button
              onClick={() => {
                // Add your menu action here
                console.log('Menu item 2 clicked');
                setIsMenuOpen(false);
              }}
              className="text-tg-text hover:bg-tg-section-separator w-full px-4 py-2 text-left transition-colors"
            >
              Menu Item 2
            </button>
            <button
              onClick={() => {
                // Add your menu action here
                console.log('Menu item 3 clicked');
                setIsMenuOpen(false);
              }}
              className="text-tg-text hover:bg-tg-section-separator w-full px-4 py-2 text-left transition-colors"
            >
              Menu Item 3
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
