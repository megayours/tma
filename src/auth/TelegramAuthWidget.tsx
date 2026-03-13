import { useEffect, useMemo, useRef, useState } from 'react';
import * as TelegramSdkReact from '@telegram-apps/sdk-react';

declare global {
  interface Window {
    onTelegramAuthWidget?: (data: TelegramLoginResult) => void;
  }
}

const TELEGRAM_WIDGET_SRC = 'https://oauth.telegram.org/js/telegram-login.js?3';

export function TelegramAuthWidget() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [widgetMounted, setWidgetMounted] = useState(false);

  const rawClientId = import.meta.env.VITE_PUBLIC_BOT_CLIENT_ID;
  const clientId = useMemo(() => {
    if (!rawClientId) return null;

    const parsed = Number(rawClientId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [rawClientId]);

  useEffect(() => {
    console.log('[TelegramAuthWidget] sdk-react', TelegramSdkReact);
    console.log('[TelegramAuthWidget] env', {
      rawClientId,
      parsedClientId: clientId,
    });

    if (!clientId) {
      console.log(
        '[TelegramAuthWidget] disabled: missing or invalid VITE_PUBLIC_BOT_CLIENT_ID'
      );
      setLoadError('Telegram login is not configured');
      return;
    }

    if (!containerRef.current) {
      return;
    }

    window.onTelegramAuthWidget = data => {
      if (data.error) {
        console.error('Telegram login error:', data.error);
        return;
      }

      console.log('Telegram login result:', data);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = TELEGRAM_WIDGET_SRC;
    script.setAttribute('data-client-id', String(clientId));
    script.setAttribute('data-onauth', 'onTelegramAuthWidget(data)');
    script.setAttribute('data-request-access', 'write');
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(script);
    setWidgetMounted(true);

    console.log('[TelegramAuthWidget] mounted widget script', {
      src: TELEGRAM_WIDGET_SRC,
      clientId,
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      setWidgetMounted(false);
      delete window.onTelegramAuthWidget;
    };
  }, [clientId, rawClientId]);

  if (loadError) {
    return (
      <p className="text-tg-hint mt-2 text-xs" role="status">
        {loadError}
      </p>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="flex min-h-12 w-full items-center justify-center rounded-lg bg-white/70 px-3 py-2"
      />
      <button
        type="button"
        className="tg-auth-button mt-3 w-full rounded-lg border border-[#229ED9] px-4 py-2 text-sm font-semibold text-[#229ED9]"
      >
        Sign In with Telegram
      </button>
      <p className="text-tg-hint mt-2 text-center text-xs">
        Widget script mounted: {widgetMounted ? 'yes' : 'no'}
      </p>
    </div>
  );
}
