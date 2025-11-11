import { createFileRoute } from '@tanstack/react-router';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useSession } from '@/auth/SessionProvider';
import { Button, Section } from '@telegram-apps/telegram-ui';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Alert,
  AlertDescription,
  SpinnerFullPage,
} from '@/components/ui';

export const Route = createFileRoute('/_main/profile/favorites/')({
  component: RouteComponent,
});

function RouteComponent() {
  // get current favorites from the backend
  const { session } = useSession();
  const { favorites, isLoadingFavorites } = useGetFavorites(session);

  if (isLoadingFavorites) {
    return <SpinnerFullPage text="Loading favorites..." />;
  }

  if (favorites && favorites.length === 0) {
    return (
      <Section>
        <Card>
          <CardContent className="py-12">
            <Alert>
              <AlertDescription className="text-center">
                <div className="mb-4 text-6xl">⭐</div>
                <h3 className="text-tg-text mb-2 text-lg font-medium">
                  No favorites yet
                </h3>
                <p className="text-tg-hint">
                  Start adding items to your favorites to see them here
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <Card>
        <CardHeader>
          <CardTitle className="text-tg-text">My Favorites</CardTitle>
          <p className="text-tg-hint text-sm">
            {favorites?.length || 0} item{favorites?.length !== 1 ? 's' : ''} in
            your collection
          </p>
        </CardHeader>
        <CardContent>
          {favorites && favorites.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {favorites.map(favorite => (
                <div
                  key={favorite.token.id}
                  className="flex flex-col items-center justify-center gap-2"
                >
                  <div className="relative">
                    <img
                      src={favorite.token.image || '/nfts/ape.jpg'}
                      alt={favorite.token.name}
                      className="h-24 w-24 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="success" size="sm">
                        <span className="text-xs">❤️</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <h3 className="text-tg-text truncate text-sm font-medium">
                      {favorite.token.name}
                    </h3>
                  </div>
                </div>
              ))}
              <div className="col-span-full">
                <Button mode="bezeled" size="l" stretched>
                  Add NFT to favorites
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Section>
  );
}
