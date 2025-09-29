import { useState, useCallback } from 'react';
import { hapticFeedback } from '@telegram-apps/sdk-react';
import { useTelegramTheme } from '@/auth/useTelegram';

interface UseStickerPackAnimationReturn {
  showAnimation: boolean;
  triggerAnimation: (status: 'processing' | 'completed', onComplete?: () => void) => void;
}

export const useStickerPackAnimation = (): UseStickerPackAnimationReturn => {
  const [showAnimation, setShowAnimation] = useState(false);
  const { isTelegram } = useTelegramTheme();

  const triggerAnimation = useCallback((status: 'processing' | 'completed', onComplete?: () => void) => {
    console.log(`🎆 ANIMATION: Triggering animation for ${status} status`);

    // Show animation
    setShowAnimation(true);

    // Trigger haptic feedback
    if (isTelegram) {
      try {
        if (hapticFeedback && hapticFeedback.impactOccurred && hapticFeedback.impactOccurred.isAvailable()) {
          hapticFeedback.impactOccurred('heavy');
          console.log('✅ HAPTIC: Vibration triggered successfully');
        }
      } catch (error) {
        console.warn('❌ HAPTIC: Error triggering vibration:', error);
      }
    }

    // Reset animation after 3 seconds and call completion callback
    setTimeout(() => {
      setShowAnimation(false);
      console.log('🎆 ANIMATION: Animation reset');

      // Call the completion callback if provided
      if (onComplete) {
        console.log('🎆 ANIMATION: Calling completion callback');
        onComplete();
      }
    }, 3000);
  }, [isTelegram]);

  return {
    showAnimation,
    triggerAnimation,
  };
};