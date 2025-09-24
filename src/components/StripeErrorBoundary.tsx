import React from 'react';

interface StripeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface StripeErrorBoundaryProps {
  children: React.ReactNode;
}

export class StripeErrorBoundary extends React.Component<
  StripeErrorBoundaryProps,
  StripeErrorBoundaryState
> {
  constructor(props: StripeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): StripeErrorBoundaryState {
    console.error('StripeErrorBoundary: Caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('StripeErrorBoundary: Error details:', { error, errorInfo });
    console.error('StripeErrorBoundary: Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-4 text-red-600 text-2xl">⚠️</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Payment Form Error
            </h3>
            <p className="text-sm text-tg-hint mb-4">
              There was an error loading the payment form.
            </p>
            {this.state.error && (
              <details className="text-xs text-tg-hint mb-4">
                <summary className="cursor-pointer">Technical details</summary>
                <pre className="mt-2 p-2 bg-tg-secondary-bg rounded text-left">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}