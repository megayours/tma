import { useEffect, useMemo, useState } from 'react';

interface ProcessingTimeCountdownProps {
  queueInfo?: {
    position: number;
    estimatedCompletionTime: string;
  };
  showCountdown?: boolean;
}

export function ProcessingTimeCountdown({
  queueInfo,
  showCountdown = false,
}: ProcessingTimeCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const adjustedInitialTime = useMemo(() => {
    if (!queueInfo?.estimatedCompletionTime) {
      return null;
    }

    const completionTime = new Date(
      queueInfo.estimatedCompletionTime
    ).getTime();

    if (Number.isNaN(completionTime)) {
      return null;
    }

    const diffMs = completionTime * 1000 - Date.now();
    const paddedMs = diffMs * 1.1; // add 10% padding
    return Math.max(Math.ceil(paddedMs / 1000), 0);
  }, [queueInfo?.estimatedCompletionTime]);

  // Initialize countdown from estimatedCompletionTime (only if showCountdown is true)
  useEffect(() => {
    if (!showCountdown || adjustedInitialTime === null) {
      setTimeRemaining(null);
      return;
    }

    setTimeRemaining(adjustedInitialTime);
  }, [showCountdown, adjustedInitialTime]);

  // Countdown timer (only if showCountdown is true)
  useEffect(() => {
    if (!showCountdown || timeRemaining === null || timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown, timeRemaining]);

  if (!queueInfo) {
    return null;
  }

  if (showCountdown && timeRemaining !== null && timeRemaining > 0) {
    return (
      <span className="whitespace-nowrap tabular-nums">
        {Math.floor(timeRemaining / 60)}:
        {(timeRemaining % 60).toString().padStart(2, '0')}
      </span>
    );
  }

  const fallbackMinutes =
    adjustedInitialTime !== null
      ? Math.max(1, Math.ceil(adjustedInitialTime / 60))
      : null;

  if (fallbackMinutes !== null) {
    return (
      <span className="whitespace-nowrap">
        ~{fallbackMinutes} minute
        {fallbackMinutes !== 1 ? 's' : ''} left
      </span>
    );
  }

  return (
    <span className="whitespace-nowrap">
      {queueInfo.position
        ? `In queue (position ${queueInfo.position})`
        : 'In queue'}
    </span>
  );
}
