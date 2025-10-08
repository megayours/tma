import { useRequiredFavoriteRedirect } from '@/hooks/useRequiredFavoriteRedirect';

/**
 * Component that handles redirecting users to favorites creation page
 * if they don't have any favorites after authentication.
 *
 * This component must be rendered within the SelectedNFTsProvider context.
 */
export function FavoriteRedirectHandler() {
  useRequiredFavoriteRedirect();
  return null;
}