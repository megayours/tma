import { useMemo, useState } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { PiPlus, PiX } from 'react-icons/pi';
import { useGetFavorites, useRemoveFromFavorites } from '@/hooks/useFavorites';
import { Avatar, Button, Divider } from '@telegram-apps/telegram-ui';
import { Link, useNavigate } from '@tanstack/react-router';

export function ProfileNavBar({ logout: _logout }: { logout: () => void }) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { session } = useSession();
  const { favorites, isLoadingFavorites } = useGetFavorites(session!);
  const { removeFromFavorites, isRemoving, removingTokenId } =
    useRemoveFromFavorites(session!);
  console.log('favorites', favorites);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative flex h-full items-center justify-center">
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 rounded-full bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {favorites && favorites.length > 0 && favorites[0] && (
          <img
            src={favorites[0].token.image || ''}
            alt="Avatar"
            className="border-tg-link h-8 w-8 rounded-full border-2"
          />
        )}
        {isLoadingFavorites && <div className="h-8 w-8 rounded-full" />}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="bg-tg-section-header-text/80 absolute right-0 bottom-full z-50 mb-2 rounded-lg p-5">
          <div className="flex flex-col items-center gap-2">
            {favorites && favorites.length > 0 && (
              <div className="flex flex-col gap-2">
                {favorites.map(favorite => (
                  <div
                    key={favorite.token.id}
                    className="relative flex flex-row items-center justify-center gap-2"
                  >
                    <Avatar
                      size={72} // it just works
                      src={`${favorite.token.image || '/nfts/ape.jpg'}`}
                      alt="Favorite"
                      className={`h-72 w-72 rounded-full transition-all duration-200 ${
                        isRemoving && removingTokenId === favorite.token.id
                          ? 'opacity-50 grayscale'
                          : ''
                      }`}
                    />
                    {/* Remove button - always visible for touch */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (
                          !isRemoving ||
                          removingTokenId !== favorite.token.id
                        ) {
                          removeFromFavorites(favorite.token);
                        }
                      }}
                      disabled={
                        isRemoving && removingTokenId === favorite.token.id
                      }
                      className={`absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md transition-all duration-200 ${
                        isRemoving && removingTokenId === favorite.token.id
                          ? 'cursor-not-allowed bg-gray-400'
                          : 'bg-red-500/80 active:scale-95 active:bg-red-600'
                      }`}
                      title={
                        isRemoving && removingTokenId === favorite.token.id
                          ? 'Removing...'
                          : 'Remove from favorites'
                      }
                    >
                      {isRemoving && removingTokenId === favorite.token.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                      ) : (
                        <PiX className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Add to Favorites Link */}
            <Button
              onClick={() => {
                navigate({
                  to: '/profile/favorites/new',
                });
                setIsDropdownOpen(false);
              }}
              className="text-tg-text bg-tg-secondary-bg hover:bg-tg-secondary-bg/80 block rounded-full p-2 text-left text-sm transition-colors"
              size="l"
              mode="filled"
              stretched={true}
            >
              +
            </Button>
            <Divider />
            <div className="text-tg-button-text">
              <Link to={'/profile'} onClick={() => setIsDropdownOpen(false)}>
                Profile
              </Link>
            </div>
            {/* Logout Button
            NO LOGOUT BUTTON FOR NOW. BUT IT WORKS.
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                className="block w-full p-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <PiSignOut />
              </button>
            </div> */}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
