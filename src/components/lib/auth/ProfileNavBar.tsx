import { useMemo, useState } from 'react';
import type { Session } from '@/auth/useAuth';
import { PiSignOut } from 'react-icons/pi';
import { useGetFavorites } from '@/hooks/useFavorites';

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
        className="flex items-center space-x-2 rounded-full bg-gray-100 p-2 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <img
          src={'/nfts/ape.jpg'}
          alt="Avatar"
          className="h-8 w-8 rounded-full"
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="ring-opacity-5 absolute right-0 bottom-full z-50 mb-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black">
          <div className="flex flex-row gap-2">
            {favorites &&
              favorites.map(favorite => (
                <div
                  key={favorite.token.id}
                  className="flex flex-col justify-center"
                >
                  <img
                    src={`${favorite.token.image || '/nfts/ape.jpg'}`}
                    alt="Favorite"
                    className="h-8 w-8 rounded-full"
                  />
                </div>
              ))}
            {/* Logout Button */}
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <PiSignOut />
              </button>
            </div>
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
