import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';

const STORAGE_KEY_ROUTE = 'last_content_menu_route';
const CONTENT_MENU_ROUTES = ['/stickers', '/community', '/profile'] as const;
type ContentMenuRoute = (typeof CONTENT_MENU_ROUTES)[number];

interface NavigationHistoryContextType {
  lastContentMenuRoute: ContentMenuRoute;
  navigationDepth: number;
  isAtEntryPoint: boolean;
  onBackClick: () => void;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

function getStoredRoute(): ContentMenuRoute {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ROUTE);
    if (stored && CONTENT_MENU_ROUTES.includes(stored as ContentMenuRoute)) {
      return stored as ContentMenuRoute;
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }
  return '/stickers'; // Default fallback
}

function setStoredRoute(route: ContentMenuRoute): void {
  try {
    localStorage.setItem(STORAGE_KEY_ROUTE, route);
  } catch (e) {
    console.warn('Failed to write to localStorage:', e);
  }
}

function isContentMenuRoute(pathname: string): pathname is ContentMenuRoute {
  return CONTENT_MENU_ROUTES.some(route => pathname.startsWith(route));
}

export function NavigationHistoryProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;

  // Ultra-simple: start at 0, increment on every navigation
  const [depth, setDepth] = useState(0);
  const prevPathnameRef = useRef(pathname);

  // Increment depth on pathname change
  useEffect(() => {
    const prevPath = prevPathnameRef.current;

    // Skip if pathname hasn't changed
    if (pathname === prevPath) return;

    // Every navigation increments depth
    setDepth(d => d + 1);
    prevPathnameRef.current = pathname;

    // Track content menu routes for fallback
    if (isContentMenuRoute(pathname)) {
      const route = CONTENT_MENU_ROUTES.find(r => pathname.startsWith(r))!;
      setStoredRoute(route);
    }

    console.log(`[Nav] ${prevPath} → ${pathname}, depth: ${depth} → ${depth + 1}`);
  }, [pathname, depth]);

  // Back button handler: decrement depth
  const handleBackClick = useCallback(() => {
    setDepth(d => {
      const newDepth = Math.max(0, d - 1);
      console.log(`[Nav] Back clicked, depth: ${d} → ${newDepth}`);
      return newDepth;
    });
  }, []);

  const lastContentMenuRoute = getStoredRoute();
  const isAtEntryPoint = depth === 0;

  return (
    <NavigationHistoryContext.Provider
      value={{
        lastContentMenuRoute,
        navigationDepth: depth,
        isAtEntryPoint,
        onBackClick: handleBackClick,
      }}
    >
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext);
  if (!context) {
    throw new Error('useNavigationHistory must be used within NavigationHistoryProvider');
  }
  return context;
}
