import { createFileRoute, Link } from '@tanstack/react-router';
import { useTelegramTheme } from '@/auth/useTelegram';
import { useSession } from '@/auth/SessionProvider';
import { StickerPackItem } from '@/routes/landing/StickerPackItem';
import { useStickerPacks } from '@/hooks/useStickerPacks';
import { useWebAppStartParam } from '@/hooks/useWebAppStartParam';

export const Route = createFileRoute('/landing/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Landing />;
}

export function Landing() {
  const { isDark, themeParams, isTelegram } = useTelegramTheme();
  const { isAuthenticated } = useSession();
  const { data: stickerPacks } = useStickerPacks({
    pagination: {
      page: 1,
      size: 10,
    },
    tokenCollections: useWebAppStartParam()?.collections,
  });

  return (
    <div className="bg-tg-bg flex h-screen snap-y snap-mandatory flex-col overflow-y-scroll">
      {stickerPacks?.data.map(stickerPack => (
        <Link
          key={stickerPack.id}
          to="/sticker-packs/$stickerPackId"
          params={{ stickerPackId: stickerPack.id.toString() }}
          className="flex h-[70vh] shrink-0 snap-start flex-col"
        >
          <div className="flex flex-1">
            <StickerPackItem stickerPack={stickerPack} />
          </div>
          {/* <div className="flex h-20 bg-blue-500">
            <div className="flex flex-1">
              <span className="font-bold text-white">Button</span>
            </div>
          </div> */}
        </Link>
      ))}
      <Link to="/sticker-packs">Link to Sticker Packs</Link>
      <Link to="/feed">Link to Feed</Link>
    </div>
  );
}
