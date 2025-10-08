import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { StripeErrorBoundary } from './StripeErrorBoundary';

interface StripeCheckoutProps {
  clientSecret: string;
  publishableKey: string;
  executionId: string;
  onComplete?: () => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  clientSecret,
  publishableKey,
  executionId,
  onComplete,
}) => {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [stripeLoadError, setStripeLoadError] = useState<string | null>(null);

  useEffect(() => {
    console.log('StripeCheckout: Props received:', {
      clientSecret: clientSecret ? `${clientSecret.substring(0, 20)}...` : 'undefined',
      publishableKey: publishableKey ? `${publishableKey.substring(0, 20)}...` : 'undefined',
      executionId,
    });

    if (publishableKey) {
      console.log('StripeCheckout: Loading Stripe with publishableKey');
      const stripePromiseResult = loadStripe(publishableKey);
      setStripePromise(stripePromiseResult);

      // Check if Stripe loads successfully
      stripePromiseResult
        .then((stripe) => {
          if (stripe) {
            console.log('StripeCheckout: Stripe loaded successfully');
          } else {
            console.error('StripeCheckout: Stripe failed to load - returned null');
            setStripeLoadError('Failed to load Stripe');
          }
        })
        .catch((error) => {
          console.error('StripeCheckout: Error loading Stripe:', error);
          setStripeLoadError(error.message || 'Failed to load Stripe');
        });
    } else {
      console.error('StripeCheckout: No publishableKey provided');
    }
  }, [publishableKey]);

  if (stripeLoadError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 text-red-600">⚠️</div>
          <p className="text-red-600 mb-2">Error loading payment form</p>
          <p className="text-sm text-tg-hint">{stripeLoadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stripePromise || !clientSecret) {
    console.log('StripeCheckout: Showing loading state', {
      hasStripePromise: !!stripePromise,
      hasClientSecret: !!clientSecret
    });
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-tg-text">Loading payment form...</p>
          <p className="text-xs text-tg-hint mt-2">
            {!clientSecret && 'Missing payment details'}
            {!stripePromise && 'Loading Stripe...'}
          </p>
        </div>
      </div>
    );
  }

  console.log('StripeCheckout: Creating options and rendering EmbeddedCheckout');

  const options = {
    clientSecret,
    onComplete: () => {
      console.log('StripeCheckout: Payment completed for execution:', executionId);
      onComplete?.();
    },
    // Note: onError is not supported by EmbeddedCheckout options
    // Error handling is done through the error boundary instead
  };

  return (
    <div className="stripe-checkout-container mx-auto w-full max-w-2xl">
      <div className="bg-tg-bg border-tg-hint/20 rounded-lg border p-6">
        <div className="mb-6 text-center">
          <h3 className="text-tg-text mb-2 text-xl font-semibold">
            Complete Payment
          </h3>
          <p className="text-tg-hint text-sm">
            Secure payment powered by Stripe
          </p>
        </div>

        <div className="stripe-embedded-checkout">
          <StripeErrorBoundary>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
              <div style={{ minHeight: '400px' }}>
                <EmbeddedCheckout />
              </div>
            </EmbeddedCheckoutProvider>
          </StripeErrorBoundary>
        </div>
      </div>
    </div>
  );
};
