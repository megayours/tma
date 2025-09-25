import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { useGetFavorites } from '@/hooks/useFavorites';

/**
 * Custom hook that redirects users to favorites creation page if they don't have any favorites
 * after authentication completes. This ensures all authenticated users have at least one favorite NFT.
 *
 * Note: This hook should only be used within authenticated sections where SelectedNFTsProvider is available.
 */
export function useRequiredFavoriteRedirect() {
  const navigate = useNavigate();
  const { isAuthenticated, session, isAuthenticating } = useSession();

  const { favorites, selectedFavorite, isLoadingFavorites, isLoadingSelected } = useGetFavorites(session);

  const hasRedirected = useRef(false);

  useEffect(() => {
    // Reset redirect flag when authentication state changes
    if (!isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only proceed if:
    // 1. User is authenticated and not currently authenticating
    // 2. We haven't already redirected this session
    // 3. Favorites and selected favorite data has finished loading
    if (
      !isAuthenticated ||
      isAuthenticating ||
      hasRedirected.current ||
      isLoadingFavorites ||
      isLoadingSelected
    ) {
      return;
    }

    // Check if user needs to be redirected to create favorites
    const needsRedirect =
      (!selectedFavorite && (!favorites || favorites.length === 0));

    if (needsRedirect) {
      hasRedirected.current = true;
      console.log('Redirecting user to create favorites - no selectedFavorite or favorites found');
      navigate({ to: '/profile/favorites/new/' });
    }
  }, [
    isAuthenticated,
    isAuthenticating,
    selectedFavorite,
    favorites,
    isLoadingFavorites,
    isLoadingSelected,
    navigate,
  ]);
}