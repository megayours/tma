import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useGetMeme } from '@/hooks/useMemes';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { SpinnerFullPage } from '@/components/ui';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { shareTelegramMessage } from '@/utils/telegramShare';
import { buildShareUrl } from '@/utils/shareUrl';

const successSearchSchema = z.object({
  memeId: z.string(),
});

export const Route = createFileRoute('/memes/$templateId/success/')({
  validateSearch: successSearchSchema,
  component: MemeSuccessPage,
});

function MemeSuccessPage() {
  const { templateId } = Route.useParams();
  const { memeId } = Route.useSearch();
  const navigate = useNavigate();
  const { selectedCommunity } = useSelectCommunity();

  const { data: meme, isLoading } = useGetMeme(memeId);

  const handleDownload = async () => {
    if (!meme?.url) return;

    try {
      const response = await fetch(meme.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meme-${meme.template.name}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download meme');
    }
  };

  const handleShare = () => {
    const shareUrl = buildShareUrl(
      import.meta.env.VITE_PUBLIC_BOT_URL || '',
      `/memes/${templateId}/details`,
      selectedCommunity?.id
    );
    shareTelegramMessage(shareUrl, 'Check out this meme template!');
  };

  const handleCreateAnother = () => {
    navigate({ to: '/memes' });
  };

  if (isLoading) {
    return <SpinnerFullPage text="Loading meme..." />;
  }

  if (!meme) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Meme not found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Success Message */}
          <div className="mb-6 text-center">
            <div className="mb-2 text-4xl">🎉</div>
            <h1 className="text-tg-text mb-2 text-2xl font-bold">
              Meme Created!
            </h1>
            <p className="text-tg-hint text-sm">{meme.template.name}</p>
          </div>

          {/* Meme Display */}
          <div className="mb-6 overflow-hidden rounded-xl">
            <img
              src={meme.url || meme.thumbnail_url || ''}
              alt="Generated meme"
              className="w-full object-contain"
            />
          </div>

          {/* Characters Info */}
          {meme.tokens && meme.tokens.length > 0 && (
            <div className="bg-tg-section-bg mb-6 rounded-lg p-4">
              <h3 className="text-tg-text mb-3 font-semibold">
                Characters Used
              </h3>
              <div className="space-y-2">
                {meme.tokens.map((token, index) => (
                  <div
                    key={index}
                    className="border-tg-section-separator flex items-center gap-3 border-b pb-2 last:border-0"
                  >
                    {token.image && (
                      <img
                        src={token.image}
                        alt={token.name || 'NFT'}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="text-tg-text text-sm font-medium">
                        {token.contract.name} #{token.id}
                      </p>
                      {token.name && (
                        <p className="text-tg-hint text-xs">{token.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="bg-tg-button text-tg-button-text w-full rounded-lg px-6 py-3 font-semibold transition-all hover:brightness-110 active:scale-95"
            >
              Share Meme
            </button>
            <button
              onClick={handleDownload}
              className="bg-tg-section-bg text-tg-text w-full rounded-lg px-6 py-3 font-semibold transition-all hover:brightness-110 active:scale-95"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <TelegramDualButtons
        mainButton={{
          text: 'Create Another',
          onClick: handleCreateAnother,
          visible: true,
        }}
      />
    </div>
  );
}
