import { createFileRoute, useRouter } from '@tanstack/react-router';
import { isTMA } from '@telegram-apps/bridge';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { base64UrlDecode } from '@/utils/base64';
import { useEffect, useRef } from 'react';
import { Feed } from './_main/community/Feed';
import { ContentMenu } from '@/components/ContentMenu';

const DEEPLINK_CONSUMED_KEY = 'deeplink_consumed';

// Check if deep link has already been consumed this session
function isDeepLinkConsumed(): boolean {
  try {
    return sessionStorage.getItem(DEEPLINK_CONSUMED_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

// Mark deep link as consumed
function markDeepLinkConsumed(): void {
  try {
    sessionStorage.setItem(DEEPLINK_CONSUMED_KEY, 'true');
  } catch (e) {
    console.warn('Failed to mark deep link as consumed:', e);
  }
}

export const Route = createFileRoute('/')({
  component: Index,
});

function TelegramDeepLinkHandler() {
  const router = useRouter();
  const hasRedirected = useRef(false);
  const launchParams = useLaunchParams(true);
  const startParam = launchParams?.tgWebAppStartParam;

  useEffect(() => {
    if (hasRedirected.current) return;

    const deepLinkAlreadyConsumed = isDeepLinkConsumed();

    console.log('[Index Route] Checking deep link...', {
      hasStartParam: !!startParam,
      deepLinkAlreadyConsumed,
    });

    // Check if we have a deep link that hasn't been consumed
    if (startParam && !deepLinkAlreadyConsumed) {
      try {
        const decodedPath = base64UrlDecode(startParam);
        console.log('[Index Route] Deep link detected, redirecting to:', decodedPath);
        markDeepLinkConsumed();
        hasRedirected.current = true;
        router.navigate({ to: decodedPath });
        return;
      } catch (error) {
        console.error('[Index Route] Failed to decode start param:', error);
      }
    }
  }, [startParam, router]);

  // If we have an unconsumed deep link, show nothing while redirecting
  if (startParam && !isDeepLinkConsumed()) {
    return null;
  }

  // Otherwise, show the community feed with navbar
  return (
    <div className="text-tg-text">
      <Feed />
      <ContentMenu />
    </div>
  );
}

// function LandingPage() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
//       <div className="w-full max-w-md">
//         <h1 className="text-3xl font-bold text-center mb-8">Welcome</h1>

//         <Section className="mb-4">
//           <Link to="/stickers" className="block">
//             <Cell
//               subtitle="Browse and create sticker packs"
//               className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//             >
//               Sticker Packs
//             </Cell>
//           </Link>

//           <Link to="/community" className="block">
//             <Cell
//               subtitle="Explore community creations"
//               className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//             >
//               Community
//             </Cell>
//           </Link>

//           <Link to="/profile" className="block">
//             <Cell
//               subtitle="View your profile and artworks"
//               className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//             >
//               Profile
//             </Cell>
//           </Link>
//         </Section>
//       </div>
//     </div>
//   );
// }

function Index() {
  const isTelegramEnv = isTMA();

  if (isTelegramEnv) {
    return <TelegramDeepLinkHandler />;
  }

  return (
    <div className="text-tg-text">
      <Feed />
      <ContentMenu />
    </div>
  );
}
