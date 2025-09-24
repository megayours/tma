import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { StripeCheckout } from '@/components/StripeCheckout';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPack } from '@/hooks/useStickerPacks';
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
  const { executionId, clientSecret, publishableKey, selectedTier, selectedTokens } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();
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
      clientSecret: clientSecret ? `${clientSecret.substring(0, 20)}...` : 'undefined',
      publishableKey: publishableKey ? `${publishableKey.substring(0, 20)}...` : 'undefined',
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
    // Navigate to success page
    navigate({
      to: '/sticker-packs/$stickerPackId/success',
      params: { stickerPackId },
      search: { executionId },
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
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-lg text-red-600">
          Error: {error?.message || 'Sticker pack not found'}
        </div>
        <Button onClick={handleBackToStickerPack}>
          Back to Sticker Pack
        </Button>
      </div>
    );
  }

  if (!executionId || !clientSecret || !publishableKey) {
    console.error('Checkout: Missing payment information:', {
      hasExecutionId: !!executionId,
      hasClientSecret: !!clientSecret,
      hasPublishableKey: !!publishableKey
    });

    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-lg text-red-600">
          Missing payment information
        </div>
        <div className="text-sm text-tg-hint">
          Missing: {[
            !executionId && 'execution ID',
            !clientSecret && 'client secret',
            !publishableKey && 'publishable key'
          ].filter(Boolean).join(', ')}
        </div>
        <Button onClick={handleBackToStickerPack}>
          Back to Sticker Pack
        </Button>
      </div>
    );
  }

  const tierInfo = stickerPack.pricing[selectedTier || 'basic'];

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <Button mode="outline" onClick={handleBackToStickerPack}>
            Back
          </Button>
        </div>

        {/* Order Summary */}
        <div className="bg-tg-secondary-bg rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Sticker Pack:</span>
              <span className="font-medium">{stickerPack.name}</span>
            </div>

            <div className="flex justify-between">
              <span>Tier:</span>
              <span className="font-medium capitalize">{selectedTier}</span>
            </div>

            <div className="flex justify-between">
              <span>Selected NFTs:</span>
              <span className="font-medium">{parsedTokens.length}</span>
            </div>

            {parsedTokens.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Your NFTs:</div>
                <div className="flex flex-wrap gap-2">
                  {parsedTokens.map((token) => (
                    <div
                      key={`${token.contract.address}-${token.id}`}
                      className="bg-tg-hint/20 rounded px-2 py-1 text-xs"
                    >
                      {token.contract.name} #{token.id}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-tg-hint/20 pt-3 mt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{tierInfo.formatted_price || 'Free'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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