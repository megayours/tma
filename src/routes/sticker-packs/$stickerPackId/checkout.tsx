import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { hapticFeedback } from '@telegram-apps/sdk-react';
import { StripeCheckout } from '@/components/StripeCheckout';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useTelegramTheme } from '@/auth/useTelegram';
import type { Token } from '@/types/response';

interface CheckoutSearch {
  executionId?: string;
  clientSecret?: string;
  publishableKey?: string;
  selectedTier?: 'basic' | 'gold' | 'legendary';
  selectedTokens?: string; // JSON stringified Token[]
}

export const Route = createFileRoute('/sticker-packs/$stickerPackId/checkout')({
  validateSearch: (search): CheckoutSearch => ({
    executionId: search.executionId as string,
    clientSecret: search.clientSecret as string,
    publishableKey: search.publishableKey as string,
    selectedTier: search.selectedTier as 'basic' | 'gold' | 'legendary',
    selectedTokens: search.selectedTokens as string,
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { stickerPackId } = Route.useParams();
  const {
    executionId,
    clientSecret,
    publishableKey,
    selectedTier,
    selectedTokens,
  } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();
  const { isTelegram } = useTelegramTheme();
  const [parsedTokens, setParsedTokens] = useState<Token[]>([]);

  const {
    data: stickerPack,
    isLoading,
    error,
  } = useStickerPack(stickerPackId, session);

  // Parse selected tokens from URL param
  useEffect(() => {
    console.log('Checkout: URL search params:', {
      executionId,
      clientSecret: clientSecret
        ? `${clientSecret.substring(0, 20)}...`
        : 'undefined',
      publishableKey: publishableKey
        ? `${publishableKey.substring(0, 20)}...`
        : 'undefined',
      selectedTier,
      selectedTokensLength: selectedTokens?.length || 0,
    });

    if (selectedTokens) {
      try {
        const tokens = JSON.parse(decodeURIComponent(selectedTokens));
        console.log('Checkout: Parsed tokens:', tokens.length, 'tokens');
        setParsedTokens(tokens);
      } catch (err) {
        console.error('Checkout: Failed to parse selected tokens:', err);
      }
    }
  }, [selectedTokens, executionId, clientSecret, publishableKey, selectedTier]);

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

    // Navigate to purchases page
    navigate({
      to: '/profile/purchases',
      search: { execution_id: executionId },
    });
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
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
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

  const tierInfo = stickerPack.pricing[selectedTier || 'basic'];

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
