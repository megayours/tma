import type { Token } from '@/types/response';

interface StepIndicatorProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
  requiredSteps?: number; // For showing which are required vs optional
  selectedTokens?: Token[]; // Array of selected tokens
  onStepClick?: (step: number) => void; // Callback when a step is clicked
}

/**
 * Visual progress indicator showing selected character avatars
 * Shows character images for selected steps, empty state for unselected steps
 * Distinguishes between required and optional steps with different opacity
 * Clicking on a step navigates to that step
 */
export function StepIndicator({
  currentStep,
  totalSteps,
  requiredSteps,
  selectedTokens = [],
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isRequired = requiredSteps ? i < requiredSteps : true;
        const isFilled = i <= currentStep;
        const token = selectedTokens[i];
        const isActive = i === currentStep;

        return (
          <button
            key={i}
            onClick={() => onStepClick?.(i)}
            disabled={!onStepClick}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all overflow-hidden border-2 ${
              isActive
                ? 'border-tg-button ring-2 ring-tg-button/30'
                : isFilled
                  ? 'border-tg-button'
                  : isRequired
                    ? 'border-tg-hint/30'
                    : 'border-tg-hint/15'
            } ${!token ? 'bg-tg-secondary' : ''} ${
              onStepClick ? 'cursor-pointer hover:scale-110 active:scale-95' : ''
            }`}
          >
            {token?.image ? (
              <img
                src={token.image}
                alt={token.name || `Character ${i + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-tg-hint text-xs font-bold">
                #{i + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
