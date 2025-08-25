import { createFileRoute } from '@tanstack/react-router';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const Route = createFileRoute('/demo3/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h1>Hello "/demo3/"!</h1>
      <DotLottieReact
        className="h-100 w-100"
        dotLottieRefCallback={dotLottie => {
          if (dotLottie) {
            dotLottie.addEventListener('complete', () => {
              console.log('Animation completed!');
            });
          }
        }}
        src="/lotties/confetti.lottie"
        autoplay
      />
    </div>
  );
}
