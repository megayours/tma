import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';

const STORAGE_KEY_ROUTE = 'last_content_menu_route';
const STORAGE_KEY_DEPTH = 'navigation_depth';
const CONTENT_MENU_ROUTES = ['/stickers', '/community', '/profile'] as const;
type ContentMenuRoute = (typeof CONTENT_MENU_ROUTES)[number];

interface NavigationHistoryContextType {
  lastContentMenuRoute: ContentMenuRoute;
  navigationDepth: number;
  isAtEntryPoint: boolean;
  decrementDepth: () => void;
  resetDepth: () => void;
}

const NavigationHistoryContext = createContext<
  NavigationHistoryContextType | undefined
>(undefined);

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

export function NavigationHistoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const pathname = location.pathname;

  // Initialize depth from sessionStorage, default to 0 if on root path
  const [depth, setDepth] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_DEPTH);
      // If on root path, always start at 0
      if (pathname === '/') return 0;
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const prevPathRef = useRef(pathname);
  const isBackNavigationRef = useRef(false);

  // Persist depth to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_DEPTH, depth.toString());
    } catch (e) {
      console.warn('[NavigationHistory] Failed to persist depth:', e);
    }
  }, [depth]);

  // Track pathname changes to detect forward navigation
  useEffect(() => {
    const prevPath = prevPathRef.current;

    // Skip if this was a back navigation (already handled)
    if (isBackNavigationRef.current) {
      isBackNavigationRef.current = false;
      prevPathRef.current = pathname;
      return;
    }

    // Detect forward navigation
    if (prevPath !== pathname) {
      setDepth(d => {
        const newDepth = Math.max(0, d + 1);
        console.log('[NavigationHistory] Forward nav:', prevPath, '→', pathname, `depth: ${d} → ${newDepth}`);
        return newDepth;
      });
      prevPathRef.current = pathname;
    }

    // Track content menu routes
    if (isContentMenuRoute(pathname)) {
      const route = CONTENT_MENU_ROUTES.find(r => pathname.startsWith(r))!;
      setStoredRoute(route);
      console.log('[NavigationHistory] Tracked route:', route);
    }
  }, [pathname]);

  // Listen for browser back/forward button
  useEffect(() => {
    const handlePopState = () => {
      // Browser back button pressed
      isBackNavigationRef.current = true;
      setDepth(d => {
        const newDepth = Math.max(0, d - 1);
        console.log('[NavigationHistory] Browser back, depth:', d, '→', newDepth);
        return newDepth;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const decrementDepth = useCallback(() => {
    isBackNavigationRef.current = true;
    setDepth(d => {
      const newDepth = Math.max(0, d - 1);
      console.log('[NavigationHistory] Decrement depth:', d, '→', newDepth);
      return newDepth;
    });
  }, []);

  const resetDepth = useCallback(() => {
    setDepth(0);
    prevPathRef.current = pathname;
    console.log('[NavigationHistory] Reset depth to 0');
  }, [pathname]);

  const lastContentMenuRoute = getStoredRoute();
  const isAtEntryPoint = depth === 0;

  return (
    <NavigationHistoryContext.Provider
      value={{
        lastContentMenuRoute,
        navigationDepth: depth,
        isAtEntryPoint,
        decrementDepth,
        resetDepth,
      }}
    >
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext);
  if (!context) {
    throw new Error(
      'useNavigationHistory must be used within NavigationHistoryProvider'
    );
  }
  return context;
}
