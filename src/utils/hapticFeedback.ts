import { hapticFeedback } from '@telegram-apps/sdk-react';

export type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type HapticNotificationType = 'error' | 'success' | 'warning';

/**
 * Triggers haptic feedback impact - for button presses and interactions
 * @param style - The intensity/style of the impact
 */
export const triggerHapticImpact = (style: HapticImpactStyle = 'medium') => {
  try {
    if (hapticFeedback && hapticFeedback.impactOccurred) {
      hapticFeedback.impactOccurred(style);
    }
  } catch (error) {
    console.warn('Haptic impact feedback not available:', error);
  }
};

/**
 * Triggers haptic notification feedback - for success/error/warning events
 * @param type - The type of notification
 */
export const triggerHapticNotification = (type: HapticNotificationType) => {
  try {
    if (hapticFeedback && hapticFeedback.notificationOccurred) {
      hapticFeedback.notificationOccurred(type);
    }
  } catch (error) {
    console.warn('Haptic notification feedback not available:', error);
  }
};

/**
 * Triggers selection haptic feedback - for picker/selection changes
 */
export const triggerHapticSelection = () => {
  try {
    if (hapticFeedback && hapticFeedback.selectionChanged) {
      hapticFeedback.selectionChanged();
    }
  } catch (error) {
    console.warn('Haptic selection feedback not available:', error);
  }
};