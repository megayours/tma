import { useAuth } from '@/auth/useAuth';
import { Link } from '@tanstack/react-router';
import { Tabbar } from '@telegram-apps/telegram-ui';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  return (
    <>
      <div className="flex gap-2 p-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>{' '}
        <Link to="/post" className="[&.active]:font-bold">
          Post
        </Link>{' '}
        <Link to="/private" className="[&.active]:font-bold">
          Private
        </Link>
      </div>
      {isAuthenticated && (
        <div>
          <h1>Hello {user?.username}</h1>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </>
  );
}
