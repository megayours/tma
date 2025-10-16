import { Timeline } from '@telegram-apps/telegram-ui';

export interface StepProgressIndicatorProps {
  currentStep: number; // 0-4 (Details, Select NFTs, Select Tier, Review, Processing)
  skipTierSelection?: boolean; // If true, hides the tier step
}

const allSteps = [
  { header: 'Details' },
  { header: 'Select NFTs' },
  { header: 'Choose Tier' },
  { header: 'Review' },
  { header: 'Processing' },
];

export function StepProgressIndicator({
  currentStep,
  skipTierSelection = false,
}: StepProgressIndicatorProps) {
  // Filter out tier step if skipped
  const steps = skipTierSelection
    ? allSteps.filter((_, index) => index !== 2) // Remove "Choose Tier" step
    : allSteps;

  // Adjust currentStep index if tier selection is skipped
  const adjustedStep = skipTierSelection && currentStep > 2 ? currentStep - 1 : currentStep;

  return (
    <div className="mb-6 w-full">
      <Timeline horizontal active={adjustedStep}>
        {steps.map((step, index) => (
          <Timeline.Item key={index} header={step.header} />
        ))}
      </Timeline>
    </div>
  );
}
