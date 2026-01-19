import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useGetPrompt } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';
import { Banner, Divider } from '@telegram-apps/telegram-ui';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { Fragment } from 'react/jsx-runtime';
import { MediaDisplay } from '@/components/lib/LatestContent/MediaDisplay';
import { nftParamsSchema } from '@/utils/nftUrlSchema';
import { decodeNFTsFromParams, type DecodedNFT } from '@/utils/nftUrlParams';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';

export const Route = createFileRoute('/content/$promptId/invitation/')({
  validateSearch: nftParamsSchema,
  component: InvitationPage,
});

// Helper function to get display label for prompt type
const getTypeLabel = (
  type: 'images' | 'stickers' | 'gifs' | 'animated_stickers'
): string => {
  switch (type) {
    case 'images':
      return 'image';
    case 'stickers':
      return 'sticker';
    case 'gifs':
      return 'GIF';
    case 'animated_stickers':
      return 'animated sticker';
    default:
      return type;
  }
};

// Component to display a single character slot with NFT preview
function CharacterSlot({
  nft,
  isFilled,
}: {
  nft?: DecodedNFT;
  isFilled: boolean;
}) {
  const { data: nftData, isLoading } = useGetNFTByCollectionAndTokenId(
    nft?.chain || '',
    nft?.contractAddress || '',
    nft?.tokenId || ''
  );

  if (!isFilled) {
    return (
      <div className="bg-tg-hint/10 flex items-center gap-2 rounded-full px-3 py-1.5">
        <div className="bg-tg-hint/20 text-tg-hint flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
          ?
        </div>
        <span className="text-tg-hint text-xs whitespace-nowrap">
          That's you!
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-tg-hint/10 flex items-center gap-2 rounded-full px-3 py-1.5">
        <div className="bg-tg-hint/20 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
          <div className="border-tg-accent-text h-3 w-3 animate-spin rounded-full border border-t-transparent" />
        </div>
        <span className="text-tg-hint text-xs">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-tg-accent-text/10 flex items-center gap-2 rounded-full px-3 py-1.5">
      {nftData?.image ? (
        <img
          src={nftData.image}
          alt={nftData.name || `NFT #${nft?.tokenId}`}
          className="border-tg-accent-text h-6 w-6 flex-shrink-0 rounded-full border-2 object-cover"
        />
      ) : (
        <div className="bg-tg-accent-text flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
          ✓
        </div>
      )}
      {nft?.username && (
        <span className="text-tg-accent-text text-xs font-medium whitespace-nowrap">
          @{nft.username}
        </span>
      )}
    </div>
  );
}

function InvitationPage() {
  const { promptId } = Route.useParams();
  const navigate = useNavigate();
  const { session, isAuthenticating } = useSession();
  const search = Route.useSearch();

  const { data: prompt, isLoading, error } = useGetPrompt(promptId, session);

  // Decode NFT params to see who has already selected
  const selectedNFTs = decodeNFTsFromParams(search);
  const filledSlots = selectedNFTs.filter(nft => nft !== undefined);
  const inviterUsernames = filledSlots
    .map(nft => nft?.username)
    .filter((username): username is string => !!username);

  const handleJoin = () => {
    // Navigate to select-nfts with the same URL params
    navigate({
      to: '/content/$promptId/select-nfts',
      params: { promptId },
      search,
    });
  };

  if (isAuthenticating) {
    return <SpinnerFullPage text="Authenticating..." />;
  }

  if (isLoading) {
    return <SpinnerFullPage text="Loading invitation..." />;
  }

  if (error || !prompt) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="text-tg-text mb-2 text-xl font-bold">
              Failed to load invitation
            </h2>
            <p className="text-tg-hint mb-4">
              {error?.message || 'Prompt not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const maxTokens = prompt.maxTokens || 1;
  const minTokens = prompt.minTokens || 1;
  const emptySlots = maxTokens - filledSlots.length;
  const contentType = getTypeLabel(
    prompt.type as 'images' | 'stickers' | 'gifs' | 'animated_stickers'
  );

  // Get preview images
  const getPreviewImages = () => {
    if (prompt.stickers && prompt.stickers.length > 0) return prompt.stickers;
    if (prompt.gifs && prompt.gifs.length > 0) return prompt.gifs;
    if (prompt.images && prompt.images.length > 0) return prompt.images;
    if (prompt.videos && prompt.videos.length > 0) return prompt.videos;
    if (prompt.animatedStickers && prompt.animatedStickers.length > 0)
      return prompt.animatedStickers;
    return [];
  };

  const previewImages = getPreviewImages();

  // Format inviter names
  const formatInviters = () => {
    if (inviterUsernames.length === 0) return 'Someone';
    if (inviterUsernames.length === 1) return inviterUsernames[0];
    if (inviterUsernames.length === 2)
      return `${inviterUsernames[0]} and ${inviterUsernames[1]}`;

    const lastUsername = inviterUsernames[inviterUsernames.length - 1];
    const otherUsernames = inviterUsernames.slice(0, -1).join(', ');
    return `${otherUsernames}, and ${lastUsername}`;
  };

  return (
    <div className="mx-auto max-w-4xl p-2">
      <div className="">
        {/* Invitation Header */}
        <div className="rounded-lg">
          <div className="relative rounded-lg p-6">
            <div className="flex w-full flex-col items-center">
              <div className="mb-4 text-6xl">🎉</div>
              <h1 className="mb-2 text-center text-2xl font-bold">
                You're Invited!
              </h1>
              <p className="text-tg-hint text-center text-base">
                <span className="text-tg-accent-text font-semibold">
                  {formatInviters()}
                </span>{' '}
                invited you to create a {contentType} together
              </p>
            </div>
          </div>
        </div>

        <Divider />

        <div>
          {previewImages.length > 0 && (
            <div className="mb-6">
              <Banner
                header={
                  <Link
                    to="/content/$promptId/details"
                    params={{ promptId }}
                    className="text-tg-text hover:text-tg-accent-text text-lg font-medium transition-colors"
                  >
                    {prompt.name}
                  </Link>
                }
                description={
                  <p className="text-tg-hint text-xs">
                    Example of what you'll create together
                  </p>
                }
                style={{
                  backgroundColor: 'var(--tg-secondary-bg)',
                }}
              >
                <Fragment>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {previewImages.slice(0, 3).map((imageUrl, index) => (
                      <div
                        key={index}
                        className="bg-tg-hint/10 relative aspect-square overflow-hidden rounded-lg"
                      >
                        <MediaDisplay
                          src={imageUrl}
                          alt={`${prompt.name || 'Content'} ${index + 1}`}
                          className="h-full w-full object-cover"
                          poster={prompt.thumbnails?.[index] || '/logo.png'}
                        />
                      </div>
                    ))}
                  </div>
                </Fragment>
              </Banner>
            </div>
          )}
        </div>

        <Divider />

        {/* Rules Section */}
        <div className="p-6">
          <h2 className="text-tg-text mb-4 text-xl font-bold">How it works</h2>

          <div className="space-y-4">
            {/* Content Type */}
            <div className="flex items-start gap-3">
              <div className="text-2xl">📝</div>
              <div>
                <p className="text-tg-text font-semibold">Content Type</p>
                <p className="text-tg-hint text-sm">
                  You'll create a personalized {contentType}
                </p>
              </div>
            </div>

            {/* Character slots */}
            <div className="flex items-start gap-3">
              <div className="text-2xl">👥</div>
              <div className="w-full">
                <p className="text-tg-text font-semibold">Character Slots</p>
                <p className="text-tg-hint text-sm">
                  {maxTokens === 1
                    ? 'This prompt requires 1 character'
                    : `This prompt requires ${minTokens === maxTokens ? maxTokens : `${minTokens}-${maxTokens}`} characters`}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {Array.from({ length: maxTokens }).map((_, index) => {
                    const nft = selectedNFTs[index];
                    return (
                      <CharacterSlot key={index} nft={nft} isFilled={!!nft} />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3">
              <div className="text-2xl">✨</div>
              <div>
                <p className="text-tg-text font-semibold">Current Status</p>
                <p className="text-tg-hint text-sm">
                  {filledSlots.length}{' '}
                  {filledSlots.length === 1 ? 'slot' : 'slots'} filled,{' '}
                  {emptySlots} {emptySlots === 1 ? 'slot' : 'slots'} remaining
                </p>
                {emptySlots > 0 && (
                  <p className="text-tg-accent-text mt-1 text-sm">
                    You need to select{' '}
                    {emptySlots === 1 ? 'your' : `${emptySlots}`} character
                    {emptySlots !== 1 ? 's' : ''} to continue
                  </p>
                )}
              </div>
            </div>

            {/* Your role */}
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <p className="text-tg-text font-semibold">Your Role</p>
                <p className="text-tg-hint text-sm">
                  Select your NFT character{emptySlots > 1 ? 's' : ''} to fill
                  the remaining {emptySlots === 1 ? 'slot' : 'slots'}. Once all
                  slots are filled, the {contentType} will be generated!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <TelegramDualButtons
          mainButton={{
            text: "Let's Go!",
            onClick: handleJoin,
            visible: true,
          }}
        />
      </div>
    </div>
  );
}
