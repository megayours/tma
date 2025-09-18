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
  Cell,
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
    | 'all'
    | 'sticker_packs'
    | 'images'
    | 'videos'
    | 'stickers'
    | 'animated_stickers'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [revealingIds, setRevealingIds] = useState<Set<string>>(new Set());

  const { getDataForType, isInitialLoading, error } = useMyGenerationsParallel(
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
            <div className="bg-tg-secondary-bg flex flex-wrap gap-1 rounded-lg p-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'sticker_packs', label: 'Sticker Packs' },
                { key: 'images', label: 'Images' },
                { key: 'videos', label: 'Videos' },
                { key: 'stickers', label: 'Stickers' },
                { key: 'animated_stickers', label: 'Animated Stickers' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key as typeof contentType)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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

          {/* Content rendering - different styles based on content type */}
          {contentType === 'sticker_packs' ? (
            // Sticker packs: one item per row using Cell and StickerPackItem
            <div className="flex flex-col space-y-6">
              {data.data.map(generation => (
                <div key={generation.id} className="flex flex-col space-y-2">
                  <Cell
                    subtitle={
                      generation.prompt?.description || 'Sticker pack execution'
                    }
                    description={`Status: ${generation.revealed_at ? 'Completed' : 'Processing'}`}
                    after={
                      (generation as any).stickerPackData?.telegramPackUrl && (
                        <Button
                          mode="bezeled"
                          size="s"
                          onClick={() =>
                            window.open(
                              (generation as any).stickerPackData
                                .telegramPackUrl,
                              '_blank'
                            )
                          }
                        >
                          View Pack
                        </Button>
                      )
                    }
                  >
                    {generation.prompt?.name || 'Sticker Pack'}
                  </Cell>

                  {/* Sticker Pack Images */}
                  {generation.prompt?.images &&
                    generation.prompt.images.length > 0 && (
                      <div className="bg-tg-secondary-bg rounded-lg p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-tg-text text-sm font-medium">
                            {(generation as any).stickerPackData
                              ?.isShowingGenerated
                              ? 'Generated Stickers'
                              : 'Preview Templates'}
                          </span>
                          {(generation as any).stickerPackData
                            ?.isShowingGenerated && (
                            <Badge variant="success" size="sm">
                              Personalized
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {generation.prompt.images
                            .slice(0, 8)
                            .map((imageUrl, index) => (
                              <div
                                key={index}
                                className="relative h-16 w-full overflow-hidden rounded bg-white"
                              >
                                <img
                                  src={imageUrl}
                                  alt={
                                    (generation as any).stickerPackData
                                      ?.isShowingGenerated
                                      ? `Generated Sticker ${index + 1}`
                                      : `Preview Template ${index + 1}`
                                  }
                                  className="h-full w-full object-contain"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                        </div>
                        {generation.prompt.images.length > 8 && (
                          <div className="text-tg-hint mt-2 text-center text-xs">
                            +{generation.prompt.images.length - 8} more{' '}
                            {(generation as any).stickerPackData
                              ?.isShowingGenerated
                              ? 'generated stickers'
                              : 'preview templates'}
                          </div>
                        )}
                      </div>
                    )}

                  {/* Execution Info */}
                  <div className="bg-tg-secondary-bg rounded-lg p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="success" size="sm">
                        {generation.type}
                      </Badge>
                      {generation.tokens && generation.tokens.length > 0 && (
                        <span className="text-tg-hint text-xs">
                          Using: {generation.tokens[0].name}
                        </span>
                      )}
                      {(generation as any).stickerPackData
                        ?.progressPercentage !== undefined && (
                        <span className="text-tg-hint text-xs">
                          Progress:{' '}
                          {
                            (generation as any).stickerPackData
                              .progressPercentage
                          }
                          %
                        </span>
                      )}
                    </div>
                    <div className="text-tg-hint flex items-center gap-4 text-xs">
                      <span>
                        Created:{' '}
                        {new Date(
                          generation.created_at * 1000
                        ).toLocaleDateString()}
                      </span>
                      {(generation as any).stickerPackData && (
                        <span>
                          {(generation as any).stickerPackData.completedPrompts}
                          /{(generation as any).stickerPackData.totalPrompts}{' '}
                          stickers
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Regular content: grid layout
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
                        className="flex h-full min-h-48 w-full items-center justify-center"
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
                      <div className="bg-tg-secondary-bg relative h-48 w-full overflow-hidden rounded">
                        <img
                          src={generation.url}
                          alt={generation.prompt?.name || 'Generated content'}
                          className="h-full w-full object-contain"
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
          )}

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
