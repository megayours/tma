import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface ConfettiAnimationProps {
  show: boolean;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ show }) => {
  if (!show) return null;

  return (
    <DotLottieReact
      className="pointer-events-none fixed bottom-0 left-1/2 z-50 h-2/3 w-[150vw] -translate-x-1/2"
      src="/lotties/confetti-full.lottie"
      loop={false}
      autoplay
    />
  );
};