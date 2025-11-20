import { useEffect, useState } from 'react';

interface ProcessingTimeCountdownProps {
  queueInfo?: {
    position: number;
    estimatedMinutes: number;
    estimatedTimeMessage: string;
  };
  showCountdown?: boolean;
}

export function ProcessingTimeCountdown({
  queueInfo,
  showCountdown = false,
}: ProcessingTimeCountdownProps) {
  // Countdown timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Initialize countdown from estimatedMinutes (only if showCountdown is true)
  useEffect(() => {
    if (
      showCountdown &&
      queueInfo?.estimatedMinutes &&
      timeRemaining === null
    ) {
      setTimeRemaining(queueInfo.estimatedMinutes * 60);
    }
  }, [showCountdown, queueInfo?.estimatedMinutes, timeRemaining]);

  // Countdown timer (only if showCountdown is true)
  useEffect(() => {
    if (!showCountdown || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown, timeRemaining]);

  // Don't render if no queue info
  if (!queueInfo) {
    return null;
  }

  // Show countdown timer
  if (showCountdown && timeRemaining !== null && timeRemaining > 0) {
    return (
      <span className="tabular-nums whitespace-nowrap">
        {Math.floor(timeRemaining / 60)}:
        {(timeRemaining % 60).toString().padStart(2, '0')}
      </span>
    );
  }

  // Show static time estimate
  return (
    <span className="whitespace-nowrap">
      ~{queueInfo.estimatedMinutes} minute
      {queueInfo.estimatedMinutes !== 1 ? 's' : ''} left
    </span>
  );
}
