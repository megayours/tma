import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { hapticFeedback } from '@telegram-apps/sdk-react';
import { StripeCheckout } from '@/components/StripeCheckout';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useTelegramTheme } from '@/auth/useTelegram';
import { SpinnerFullPage } from '@/components/ui';

interface CheckoutSearch {
  executionId?: string;
  clientSecret?: string;
  publishableKey?: string;
  nft?: string; // Encoded NFT string (chain:contract:tokenId)
  tier?: 'basic' | 'gold' | 'legendary';
}

export const Route = createFileRoute('/sticker-packs/$stickerPackId/checkout')({
  validateSearch: (search): CheckoutSearch => ({
    executionId: search.executionId as string,
    clientSecret: search.clientSecret as string,
    publishableKey: search.publishableKey as string,
    nft: search.nft as string,
    tier: search.tier as 'basic' | 'gold' | 'legendary',
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { stickerPackId } = Route.useParams();
  const {
    executionId,
    clientSecret,
    publishableKey,
    nft,
    tier,
  } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();
  const { isTelegram } = useTelegramTheme();

  const {
    data: stickerPack,
    isLoading,
    error,
  } = useStickerPack(stickerPackId, session);

  // Log checkout params
  useEffect(() => {
    console.log('Checkout: URL search params:', {
      executionId,
      clientSecret: clientSecret
        ? `${clientSecret.substring(0, 20)}...`
        : 'undefined',
      publishableKey: publishableKey
        ? `${publishableKey.substring(0, 20)}...`
        : 'undefined',
      nft,
      tier,
    });
  }, [executionId, clientSecret, publishableKey, nft, tier]);

  const handlePaymentComplete = () => {
    console.log('Checkout: Payment completed, redirecting to success page');

    // Trigger payment success haptic feedback
    if (isTelegram) {
      try {
        if (hapticFeedback && hapticFeedback.notificationOccurred) {
          hapticFeedback.notificationOccurred('success');
        }
      } catch (error) {
        console.warn('Checkout: Haptic feedback not available:', error);
      }
    }

    // Navigate to success/confetti page after payment
    if (executionId) {
      navigate({
        to: '/sticker-packs/$stickerPackId/success',
        params: { stickerPackId },
        search: {
          executionId,
        },
      });
    }
  };

  // Note: onError removed as it's not supported by Stripe EmbeddedCheckout
  // Error handling is now done through the StripeErrorBoundary component

  const handleBackToStickerPack = () => {
    navigate({
      to: '/sticker-packs/$stickerPackId',
      params: { stickerPackId },
    });
  };

  if (isLoading) {
    return <SpinnerFullPage text="Loading..." />;
  }

  if (error || !stickerPack) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="text-lg text-red-600">
          Error: {error?.message || 'Sticker pack not found'}
        </div>
        <Button onClick={handleBackToStickerPack}>Back to Sticker Pack</Button>
      </div>
    );
  }

  if (!executionId || !clientSecret || !publishableKey) {
    console.error('Checkout: Missing payment information:', {
      hasExecutionId: !!executionId,
      hasClientSecret: !!clientSecret,
      hasPublishableKey: !!publishableKey,
    });

    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="text-lg text-red-600">Missing payment information</div>
        <div className="text-tg-hint text-sm">
          Missing:{' '}
          {[
            !executionId && 'execution ID',
            !clientSecret && 'client secret',
            !publishableKey && 'publishable key',
          ]
            .filter(Boolean)
            .join(', ')}
        </div>
        <Button onClick={handleBackToStickerPack}>Back to Sticker Pack</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* Stripe Checkout */}
      <StripeCheckout
        clientSecret={clientSecret}
        publishableKey={publishableKey}
        executionId={executionId}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
}
