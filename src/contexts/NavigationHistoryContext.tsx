import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';

const STORAGE_KEY = 'last_content_menu_route';
const CONTENT_MENU_ROUTES = ['/stickers', '/community', '/profile'] as const;
type ContentMenuRoute = typeof CONTENT_MENU_ROUTES[number];

interface NavigationHistoryContextType {
  lastContentMenuRoute: ContentMenuRoute;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

function getStoredRoute(): ContentMenuRoute {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, route);
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

  useEffect(() => {
    // Track when user navigates to any content menu page
    if (isContentMenuRoute(pathname)) {
      const route = CONTENT_MENU_ROUTES.find(r => pathname.startsWith(r))!;
      setStoredRoute(route);
      console.log('[NavigationHistory] Tracked route:', route);
    }
  }, [pathname]);

  const lastContentMenuRoute = getStoredRoute();

  return (
    <NavigationHistoryContext.Provider value={{ lastContentMenuRoute }}>
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
