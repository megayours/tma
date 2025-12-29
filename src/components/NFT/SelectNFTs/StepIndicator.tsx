interface StepIndicatorProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
  requiredSteps?: number; // For showing which are required vs optional
}

/**
 * Visual progress indicator with dots for stepper UI
 * Shows filled dots for completed steps, empty dots for remaining steps
 * Distinguishes between required and optional steps with different opacity
 */
export function StepIndicator({
  currentStep,
  totalSteps,
  requiredSteps,
}: StepIndicatorProps) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isRequired = requiredSteps ? i < requiredSteps : true;
        const isFilled = i <= currentStep;

        return (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              isFilled
                ? 'bg-tg-button'
                : isRequired
                  ? 'bg-tg-hint/30'
                  : 'bg-tg-hint/15'
            }`}
          />
        );
      })}
    </div>
  );
}
