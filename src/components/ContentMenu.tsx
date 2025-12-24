import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { hapticFeedback } from '@telegram-apps/sdk-react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useSession } from '../auth/SessionProvider';
import { UserMenuComponent } from './lib/auth/FavoriteNFT';
import { FaUser } from 'react-icons/fa';
import { useNotifications } from '../hooks/useNotifications';

export function ContentMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const { session } = useSession();

  const { count: notificationCount, isLoading } = useNotifications(session);

  // Derive selected content type from current route
  const getSelectedContentType = (): string => {
    const path = location.pathname;
    if (path.startsWith('/stickers')) return 'Packs';
    if (path.startsWith('/community')) return 'Community';
    if (path.startsWith('/profile')) return 'UserMenu';
    return 'Community';
  };

  const selectedContentType = getSelectedContentType();

  // Map content type to route
  const getRouteForContentType = (id: string): string => {
    switch (id) {
      case 'Packs':
        return '/stickers';
      case 'Community':
        return '/community';
      case 'UserMenu':
        return '/profile';
      default:
        return '/community';
    }
  };

  const handleItemClick = (id: string) => {
    // Trigger haptic feedback
    if (hapticFeedback.impactOccurred.isAvailable()) {
      hapticFeedback.impactOccurred('medium');
    }
    navigate({ to: getRouteForContentType(id) });
  };

  useEffect(() => {
    const selectedElement = itemRefs.current[selectedContentType];
    const bubble = bubbleRef.current;
    const container = containerRef.current;

    if (selectedElement && bubble && container) {
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();

      const offsetX = selectedRect.left - containerRect.left;
      const width = selectedRect.width;

      gsap.to(bubble, {
        x: offsetX,
        width: width,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [selectedContentType]);

  const bottomInset =
    typeof window !== 'undefined' &&
    window.Telegram?.WebApp?.contentSafeAreaInset?.bottom
      ? 20 + window.Telegram.WebApp.contentSafeAreaInset.bottom
      : 20;

  return (
    <div
      className="fixed right-10 left-10 z-50 px-4"
      style={{ bottom: `${bottomInset}px` }}
    >
      <div
        ref={containerRef}
        className="relative flex h-11 flex-row items-center overflow-hidden rounded-4xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-lg"
      >
        {/* Sliding bubble indicator */}
        <div
          ref={bubbleRef}
          className="bg-tg-button/80 absolute h-full rounded-4xl backdrop-blur-sm transition-colors"
          style={{ zIndex: 0 }}
        />

        <div
          ref={el => {
            itemRefs.current['Packs'] = el;
          }}
          onClick={() => handleItemClick('Packs')}
          className={`${selectedContentType === 'Packs' ? 'text-tg-button-text' : 'text-tg-text'} relative z-10 flex h-full w-full items-center justify-center p-3`}
          style={{ zIndex: 1 }}
        >
          Packs
        </div>
        <div
          ref={el => {
            itemRefs.current['Community'] = el;
          }}
          onClick={() => handleItemClick('Community')}
          className={`${selectedContentType === 'Community' ? 'text-tg-button-text' : 'text-tg-text'} relative z-10 flex h-full w-full items-center justify-center p-3`}
          style={{ zIndex: 1 }}
        >
          Community
        </div>
        <div
          ref={el => {
            itemRefs.current['UserMenu'] = el;
          }}
          onClick={() => handleItemClick('UserMenu')}
          className={`${selectedContentType === 'UserMenu' ? 'text-tg-button-text' : 'text-tg-text'} relative z-10 flex h-full w-full items-center justify-center p-3`}
          style={{ zIndex: 1 }}
        >
          <div className="relative w-10">
            {session ? <UserMenuComponent size={35} /> : <FaUser />}
            {!isLoading && notificationCount > 0 && (
              <div className="absolute -top-0.5 right-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {notificationCount > 9 ? '•' : notificationCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
