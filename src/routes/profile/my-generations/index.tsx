import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  useRevealContent,
  useUnrevealedGenerations,
  useRevealAllContent,
} from '@/hooks/useContents';
import { useMyGenerationsParallel } from '@/hooks/useMyGenerationsParallel';
import { useSession } from '@/auth/SessionProvider';
import {
  Button,
  Section,
  Card as TelegramCard,
} from '@telegram-apps/telegram-ui';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Alert,
  AlertDescription,
} from '@/components/ui';

export const Route = createFileRoute('/profile/my-generations/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useSession();
  const [contentType, setContentType] = useState<
    'all' | 'sticker_packs' | 'images' | 'videos' | 'stickers' | 'animated_stickers'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [revealingIds, setRevealingIds] = useState<Set<string>>(new Set());

  const {
    getDataForType,
    isInitialLoading,
    error
  } = useMyGenerationsParallel(
    {
      pagination: {
        page: currentPage,
        size: 20,
      },
      days: '30',
    },
    session
  );

  // Get data for current selected tab
  const data = getDataForType(contentType);
  const isLoading = isInitialLoading;
  const revealMutation = useRevealContent(session);
  const { unrevealedGenerations } = useUnrevealedGenerations(session);
  const revealAllMutation = useRevealAllContent(session);

  if (isLoading) {
    return (
      <Section>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2">Loading your generations...</p>
          </div>
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Card>
          <CardContent className="py-12">
            <Alert>
              <AlertDescription className="text-center">
                <div className="mb-4 text-6xl">⚠️</div>
                <h3 className="text-tg-text mb-2 text-lg font-medium">
                  Failed to load your generations
                </h3>
                <p className="text-tg-hint">{error.message}</p>
                <Button
                  mode="bezeled"
                  size="m"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </Section>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Section>
        <Card>
          <CardContent className="py-12">
            <Alert>
              <AlertDescription className="text-center">
                <div className="mb-4 text-6xl">🎨</div>
                <h3 className="text-tg-text mb-2 text-lg font-medium">
                  No generations yet
                </h3>
                <p className="text-tg-hint">
                  Start creating content to see your generations here
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </Section>
    );
  }

  const handleTypeChange = (type: typeof contentType) => {
    setContentType(type);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRevealContent = async (contentId: string) => {
    if (revealingIds.has(contentId)) return; // Already revealing

    try {
      setRevealingIds(prev => new Set(prev).add(contentId));
      await revealMutation.mutateAsync(contentId);
    } catch (error) {
      console.error('Failed to reveal content:', error);
    } finally {
      setRevealingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    }
  };

  const handleRevealAll = async () => {
    if (unrevealedGenerations.length === 0 || revealAllMutation.isPending)
      return;

    try {
      const contentIds = unrevealedGenerations.map(generation => generation.id);
      await revealAllMutation.mutateAsync(contentIds);
    } catch (error) {
      console.error('Failed to reveal all content:', error);
    }
  };

  return (
    <Section>
      <Card>
        <CardHeader>
          <CardTitle className="text-tg-text">My Recent Generations</CardTitle>
          <p className="text-tg-hint text-sm">
            {data.data.length} generation{data.data.length !== 1 ? 's' : ''} in
            the last 30 days
          </p>
        </CardHeader>
        <CardContent>
          {/* Filter tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-1 p-1 bg-tg-secondary-bg rounded-lg">
              {[
                { key: 'all', label: 'All' },
                { key: 'sticker_packs', label: 'Sticker Packs' },
                { key: 'images', label: 'Images' },
                { key: 'videos', label: 'Videos' },
                { key: 'stickers', label: 'Stickers' },
                { key: 'animated_stickers', label: 'Animated Stickers' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key as typeof contentType)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    contentType === key
                      ? 'bg-tg-button text-tg-button-text'
                      : 'text-tg-text hover:text-tg-accent-text hover:bg-tg-secondary-bg/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reveal All button */}
          {unrevealedGenerations.length > 0 && (
            <div className="mb-4">
              <Button
                mode="filled"
                size="m"
                onClick={handleRevealAll}
                disabled={revealAllMutation.isPending}
              >
                {revealAllMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Revealing All...
                  </>
                ) : (
                  `Reveal All (${unrevealedGenerations.length})`
                )}
              </Button>
            </div>
          )}

          {/* Content grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {data.data.map(generation => (
              <TelegramCard
                key={generation.id}
                className="flex flex-col gap-2 p-2"
              >
                <div className="relative">
                  {generation.revealed_at === null ? (
                    // Unrevealed content - show clickable placeholder
                    <Button
                      mode="bezeled"
                      size="s"
                      onClick={() => handleRevealContent(generation.id)}
                      disabled={revealingIds.has(generation.id)}
                      className="flex h-48 w-full items-center justify-center"
                    >
                      <div className="text-center">
                        {revealingIds.has(generation.id) ? (
                          <>
                            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            <div className="mt-1 text-xs">Revealing...</div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl">🔒</div>
                            <div className="text-xs">Click to Reveal</div>
                          </>
                        )}
                      </div>
                    </Button>
                  ) : (
                    <div className="bg-tg-secondary-bg relative w-full h-48 rounded overflow-hidden">
                      <img
                        src={generation.url}
                        alt={generation.prompt?.name || 'Generated content'}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="success" size="sm">
                      {generation.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-tg-text truncate text-sm font-medium">
                    {generation.prompt?.name || 'Untitled'}
                  </h3>
                  <p className="text-tg-hint truncate text-xs">
                    {generation.creator_name || 'Anonymous'}
                  </p>
                  <p className="text-tg-hint text-xs">
                    {new Date(
                      generation.created_at * 1000
                    ).toLocaleDateString()}
                  </p>
                  {generation.tokens && generation.tokens.length > 0 && (
                    <p className="text-tg-hint text-xs">
                      {generation.tokens.length} token
                      {generation.tokens.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </TelegramCard>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                mode="bezeled"
                size="s"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-tg-text flex items-center px-3 text-sm">
                Page {currentPage} of {data.pagination.totalPages}
              </span>
              <Button
                mode="bezeled"
                size="s"
                disabled={currentPage === data.pagination.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Section>
  );
}
