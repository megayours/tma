import { createFileRoute } from '@tanstack/react-router';
import '@telegram-apps/telegram-ui/dist/styles.css';
import { Card } from '@telegram-apps/telegram-ui';

import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';

gsap.registerPlugin(useGSAP, ScrollToPlugin);

export const Route = createFileRoute('/demo2/backup')({
  component: RouteComponent,
});

function RouteComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timelines = useRef<gsap.core.Timeline[]>([]);
  const initialHeight = '300px';

  const animateCard = (index: number) => {
    // Prevent clicks during animation
    if (isAnimating) return;

    const cards = gsap.utils.toArray('.card');
    const card = cards[index] as HTMLElement;
    const imageDiv = card.querySelector('.image-container') as HTMLElement;
    const img = imageDiv?.querySelector('img') as HTMLImageElement;

    if (!card || !imageDiv) return;

    // Calculate container width when needed (ensures ref is ready)
    const containerWidth =
      containerRef.current?.offsetWidth || card.offsetWidth || 400;

    // Calculate the expanded height based on image aspect ratio
    let expandedHeight = '600px'; // fallback
    if (img && img.naturalWidth && img.naturalHeight) {
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      expandedHeight = `${containerWidth * aspectRatio}px`;
      console.log('Height calculation:', {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        aspectRatio,
        containerWidth,
        expandedHeight,
      });
    } else if (img) {
      // If image dimensions aren't available, wait for load
      img.onload = () => {
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        expandedHeight = `${containerWidth * aspectRatio}px`;
        console.log('Height calculation after load:', expandedHeight);
      };
    }

    // Set animation lock
    setIsAnimating(true);

    // Kill any existing timeline for this card
    timelines.current[index]?.kill();

    if (activeCard === index) {
      // Reverse animation - show all cards and shrink the active one
      const timeline = gsap.timeline();

      // Show all other cards at the same time
      const otherCards = cards.filter((_, otherIndex) => otherIndex !== index);
      timeline.to(otherCards as HTMLElement[], {
        opacity: 1,
        y: 0,
        height: initialHeight,
        duration: 0.5,
        stagger: 0, // All cards animate at the same time
        ease: 'power1.in',
      });

      // Shrink the active card's image
      timeline.to(imageDiv, {
        height: initialHeight,
        width: '100%',
        duration: 0.5,
        ease: 'power1.in',
      });

      // Release lock when animation completes
      timeline.call(() => setIsAnimating(false));

      timelines.current[index] = timeline;

      // at the end of the animation, scroll to the active card using GSAP
      timeline.call(() => {
        const activeCardElement = cards[index] as HTMLElement;
        if (activeCardElement && containerRef.current) {
          gsap.to(window, {
            scrollTo: {
              y: activeCardElement,
              offsetY: -containerRef.current.clientHeight / 2,
            },
            duration: 0.2,
            ease: 'power2.out',
          });
        }
      });

      setActiveCard(null);
    } else {
      // Forward animation - hide other cards and expand the active one
      const timeline = gsap.timeline();

      // Expand the active card's image container
      console.log(
        'Animating imageDiv:',
        imageDiv,
        'to height:',
        expandedHeight
      );

      timeline.to(imageDiv, {
        height: expandedHeight,
        width: '100%',
        duration: 1,
        ease: 'power1.in',
        onUpdate: () => {
          console.log('Current height:', imageDiv.style.height);
        },
      });

      // Hide other cards
      const otherCards = cards.filter((_, otherIndex) => otherIndex !== index);
      timeline.to(otherCards as HTMLElement[], {
        opacity: 0,
        duration: 1,
        height: 0,
        stagger: 0, // All cards animate at the same time
        ease: 'power1.in',
      });

      // Release lock when animation completes
      timeline.call(() => setIsAnimating(false));

      timelines.current[index] = timeline;
      setActiveCard(index);
    }
  };

  const cards = [
    {
      id: 1,
      src: 'https://yours-fun-api.testnet.megayours.com/v1/gifs/public/7c84c8b91f2fd007eff3088e2f76bc5869ee47d8edb4122291910e998bbe7652.gif',
      title: 'Card 1',
    },
    {
      id: 2,
      src: 'https://yours-fun-api.testnet.megayours.com/v1/gifs/public/5e76fa05dc2ddb9ee9502ebc9fd569803d6860e1d0bb4c153c1fb4c58136fd74.gif',
      title: 'Card 2',
    },
    {
      id: 3,
      src: 'https://yours-fun-api.testnet.megayours.com/v1/gifs/public/4853f749a215f382ed9da2749eeadee6e2537fb0d7f6a8e562f8a14f365fe7c7.gif',
      title: 'Card 3',
    },
    {
      id: 4,
      src: 'https://yours-fun-api.testnet.megayours.com/v1/gifs/public/7c84c8b91f2fd007eff3088e2f76bc5869ee47d8edb4122291910e998bbe7652.gif',
      title: 'Card 1',
    },
    {
      id: 5,
      src: 'https://yours-fun-api.testnet.megayours.com/v1/gifs/public/5e76fa05dc2ddb9ee9502ebc9fd569803d6860e1d0bb4c153c1fb4c58136fd74.gif',
      title: 'Card 2',
    },
    {
      id: 6,
      src: 'https://yours-fun-api.testnet.megayours.com/v1/gifs/public/4853f749a215f382ed9da2749eeadee6e2537fb0d7f6a8e562f8a14f365fe7c7.gif',
      title: 'Card 3',
    },
  ];

  return (
    <div
      className="relative flex max-h-screen flex-col gap-4 overflow-y-auto p-4"
      ref={containerRef}
    >
      <h1>Hello!</h1>
      {cards.map((card, index) => (
        <Card
          key={card.id}
          type="ambient"
          className={`card min-h-[150px] cursor-pointer overflow-visible ${activeCard === index ? 'active' : ''}`}
          onClick={() => animateCard(index)}
        >
          <div
            className="image-container relative overflow-hidden"
            style={{ height: initialHeight }}
            ref={imgRef}
          >
            <img
              src={card.src}
              alt={card.title}
              className="h-full min-h-300 w-full object-cover object-center"
            />
          </div>
          <Card.Chip readOnly>Hot place</Card.Chip>
          <Card.Cell readOnly subtitle="United states">
            Going hot
          </Card.Cell>
        </Card>
      ))}
    </div>
  );
}
