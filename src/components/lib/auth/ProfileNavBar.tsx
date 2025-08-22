import { useMemo, useState } from 'react';
import type { Session } from '@/auth/useAuth';
import { PiPlus, PiSignOut } from 'react-icons/pi';
import { useGetFavorites } from '@/hooks/useFavorites';
import { Avatar, AvatarStack } from '@telegram-apps/telegram-ui';
import { Link } from '@tanstack/react-router';

export function ProfileNavBar({
  logout,
  session,
}: {
  logout: () => void;
  session: Session;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const memoizedSession = useMemo(
    () => session,
    [session.id, session.authToken]
  );
  const { favorites, isLoadingFavorites } = useGetFavorites(memoizedSession);
  console.log('favorites', favorites);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
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
        <div className="ring-opacity-5 absolute right-0 bottom-full z-50 mb-2 h-100 rounded-md bg-white px-2 shadow-lg ring-1 ring-black">
          <div className="relative mt-4 flex flex-col items-center justify-between gap-2">
            {favorites && favorites.length > 0 && (
              <AvatarStack>
                {favorites.map(favorite => (
                  <Avatar
                    key={favorite.token.id}
                    size={40}
                    src={`${favorite.token.image || '/nfts/ape.jpg'}`}
                    alt="Favorite"
                    className="h-16 w-16 rounded-full"
                  />
                ))}
              </AvatarStack>
            )}
            {/* Add to Favorites Link */}
            <Link
              to="/profile"
              className="text-tg-text bg-tg-secondary-bg hover:bg-tg-secondary-bg/80 block rounded-full p-2 text-left text-sm transition-colors"
            >
              <PiPlus className="h-3 w-3" />
            </Link>
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
