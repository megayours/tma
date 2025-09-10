import { useAuthContext } from '@/auth/AuthProvider';
import { ProfileNavBar } from './ProfileNavBar';
import { CreatePostButton } from '@/components/ui/CreatePostButton';

import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { Button } from '@telegram-apps/telegram-ui';

export function NavBar() {
  const { logout, isAuthenticated, isAuthenticating, session } =
    useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (targetPath: string) => {
    console.log('NavBar button clicked!');
    console.log('Target path:', targetPath);
    console.log('Current pathname:', location.pathname);
    console.log('Paths match:', location.pathname === targetPath);
    
    if (location.pathname === targetPath) {
      console.log('Scrolling to top...');
      
      // Try to scroll the correct container in order of specificity
      const scrollOptions = { top: 0, behavior: 'smooth' as ScrollBehavior };
      
      // 1. Try feed scroller first (most specific)
      const scroller = document.querySelector('.scroller');
      if (scroller) {
        console.log('Scrolling .scroller element');
        scroller.scrollTo(scrollOptions);
        return;
      }
      
      // 2. Try main element (general app container)
      const main = document.querySelector('main');
      if (main) {
        console.log('Scrolling main element');
        main.scrollTo(scrollOptions);
        return;
      }
      
      // 3. Fallback to window (for pages without custom scroll)
      console.log('Scrolling window (fallback)');
      window.scrollTo(scrollOptions);
    } else {
      console.log('Navigating to:', targetPath);
      navigate({ to: targetPath });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-tg-bg text-tg-text mb-6 flex h-full w-full items-center justify-around p-4">
        <a
          href={`https://yours-fun-api.testnet.megayours.com/v1/auth/discord/authorize?state=${encodeURIComponent('/')}&redirect_base_url=${encodeURIComponent(window.location.origin)}`}
          className="h-full w-full"
        >
          <Button
            size="l"
            mode="filled"
            stretched={true}
            loading={isAuthenticating}
          >
            Login with Discord
          </Button>
        </a>
      </div>
    );
  }

  return (
    <>
      {/* <Section
        title="Navigation"
        description="Navigate to different pages"
      ></Section> */}
      <ProtectedRoute>
        <div className="bg-tg-bg text-tg-text flex h-full w-full items-center justify-around px-4 py-4 pb-6">
          <button
            onClick={() => handleNavClick('/')}
            className={`tg-link px-2 py-1 hover:opacity-80 ${location.pathname === '/' ? 'font-bold' : ''}`}
          >
            Feed
          </button>
          <button
            onClick={() => handleNavClick('/about')}
            className={`tg-link px-2 py-1 hover:opacity-80 ${location.pathname === '/about' ? 'font-bold' : ''}`}
          >
            About
          </button>
          <CreatePostButton />
          <button
            onClick={() => handleNavClick('/private')}
            className={`tg-link px-2 py-1 hover:opacity-80 ${location.pathname === '/private' ? 'font-bold' : ''}`}
          >
            Private
          </button>
          {isAuthenticated && session && <ProfileNavBar logout={logout} />}
        </div>
      </ProtectedRoute>
    </>
  );
}
