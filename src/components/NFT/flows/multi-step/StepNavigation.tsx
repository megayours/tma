import { Button } from '@telegram-apps/telegram-ui';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isOptionalStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSkip?: () => void;
}

/**
 * Navigation buttons for stepper UI
 * Shows Previous, Next, and optional Skip buttons
 * Final step shows "Confirm" instead of "Next"
 */
export function StepNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  canGoPrevious,
  isOptionalStep,
  onPrevious,
  onNext,
  onSkip,
}: StepNavigationProps) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <Button
        mode="outline"
        size="s"
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        ← Previous
      </Button>

      {isOptionalStep && onSkip && (
        <Button mode="outline" size="s" onClick={onSkip}>
          Skip
        </Button>
      )}

      <Button mode="filled" size="s" onClick={onNext} disabled={!canGoNext}>
        {currentStep === totalSteps - 1 ? 'Confirm' : 'Next →'}
      </Button>
    </div>
  );
}
