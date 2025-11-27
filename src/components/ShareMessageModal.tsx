import { useState, useEffect } from 'react';
import { Button } from '@telegram-apps/telegram-ui';

interface ShareMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => Promise<void>;
  defaultMessage: string;
  isLoading?: boolean;
}

const MAX_CAPTION_LENGTH = 1024;

export function ShareMessageModal({
  isOpen,
  onClose,
  onConfirm,
  defaultMessage,
  isLoading = false,
}: ShareMessageModalProps) {
  const [message, setMessage] = useState(defaultMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage]);

  const handleConfirm = async () => {
    if (message.trim().length === 0 || message.length > MAX_CAPTION_LENGTH) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(message);
    } catch (error) {
      console.error('Failed to confirm share:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const characterCount = message.length;
  const isOverLimit = characterCount > MAX_CAPTION_LENGTH;
  const isDisabled = isSubmitting || isLoading || message.trim().length === 0 || isOverLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="bg-tg-bg border-tg-section-separator relative w-full max-w-md rounded-t-2xl border sm:rounded-2xl">
        {/* Header */}
        <div className="border-tg-section-separator border-b px-6 py-4">
          <h2 className="text-tg-text text-lg font-semibold">Share to Telegram</h2>
          <p className="text-tg-hint mt-1 text-sm">
            Add a message to share with your image
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Textarea */}
          <div className="mb-2">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter your message..."
              disabled={isSubmitting || isLoading}
              className={`bg-tg-secondary-bg text-tg-text placeholder-tg-hint border-tg-section-separator w-full resize-none rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 ${
                isOverLimit
                  ? 'focus:ring-red-500'
                  : 'focus:ring-tg-button'
              } disabled:opacity-50`}
              rows={6}
              maxLength={MAX_CAPTION_LENGTH + 100} // Allow typing over to show error
            />
          </div>

          {/* Character Counter */}
          <div className="flex justify-end">
            <span
              className={`text-sm ${
                isOverLimit
                  ? 'text-red-500 font-semibold'
                  : characterCount > MAX_CAPTION_LENGTH * 0.9
                    ? 'text-orange-500'
                    : 'text-tg-hint'
              }`}
            >
              {characterCount}/{MAX_CAPTION_LENGTH}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="border-tg-section-separator flex gap-3 border-t px-6 py-4">
          <Button
            mode="plain"
            size="l"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            mode="filled"
            size="l"
            onClick={handleConfirm}
            disabled={isDisabled}
            className="flex-1"
          >
            {isSubmitting || isLoading ? 'Sharing...' : 'Share'}
          </Button>
        </div>
      </div>
    </div>
  );
}
