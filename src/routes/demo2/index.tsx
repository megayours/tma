import { createFileRoute, Link } from '@tanstack/react-router';
import '@telegram-apps/telegram-ui/dist/styles.css';
import { Card } from '@telegram-apps/telegram-ui';

import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import { useRef, useState, useCallback } from 'react';

// Add styles to hide scrollbars
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

gsap.registerPlugin(useGSAP, ScrollToPlugin);

export const Route = createFileRoute('/demo2/')({
  component: RouteComponent,
});

function RouteComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timelines = useRef<gsap.core.Timeline[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const openCard = useCallback(
    (index: number) => {
      if (isAnimating) return;

      const currentCard = cards[index];
      const cardElement = cardRefs.current[index];
      console.log(
        'Opening card:',
        currentCard,
        cardElement,
        imageContainerRefs.current[index]
      );

      if (cardElement && currentCard) {
        // Kill any existing animations
        gsap.killTweensOf(cardElement);
        gsap.killTweensOf(imageContainerRefs.current[index]);

        setIsAnimating(true);
        setActiveCard(index);

        const tl = gsap.timeline({
          onComplete: () => {
            setIsAnimating(false);
            console.log('Open animation completed');
          },
        });

        // First, scroll to the top of the card
        tl.to(containerRef.current, {
          scrollTo: {
            y: cardElement,
            offsetY: 40,
          },
          duration: 0.4,
          ease: 'power2.out',
        });

        // Then animate both the card and the image container to grow to full screen height
        tl.to(
          [cardElement, imageContainerRefs.current[index]],
          {
            height: '80vh',
            minHeight: '80vh',
            position: 'relative',
            width: '100%',
            duration: 0.6,
            ease: 'power1.out',
          },
          '-=0.2'
        ); // Start the resize animation slightly before scroll completes

        // Store the timeline for cleanup
        timelines.current[index] = tl;
      }
    },
    [isAnimating]
  );

  const closeCardAnimation = useCallback(
    (index: number) => {
      if (isAnimating) return;

      const cardElement = cardRefs.current[index];
      console.log('Closing card:', index);

      if (cardElement) {
        // Kill any existing animations
        gsap.killTweensOf(cardElement);
        gsap.killTweensOf(imageContainerRefs.current[index]);

        setIsAnimating(true);
        setActiveCard(null);

        const tl = gsap.timeline({
          onComplete: () => {
            setIsAnimating(false);
            console.log('Close animation completed');
          },
        });

        // Animate both the card and the image container back to original size
        tl.to([cardElement, imageContainerRefs.current[index]], {
          height: '200px',
          minHeight: '200px',
          width: '100%',
          duration: 0.6,
          ease: 'power1.in',
        });

        timelines.current[index] = tl;
      }
    },
    [isAnimating]
  );

  const animateCard = useCallback(
    (index: number) => {
      const isCurrentlyActive = activeCard === index;

      if (isCurrentlyActive) {
        // If already active, close it
        closeCardAnimation(index);
      } else {
        // If not active, open it
        openCard(index);
      }
    },
    [activeCard, openCard, closeCardAnimation]
  );

  const closeCard = useCallback(() => {
    if (activeCard === null || isAnimating) return;
    closeCardAnimation(activeCard);
  }, [activeCard, isAnimating, closeCardAnimation]);

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
    <>
      <style>{scrollbarHideStyles}</style>
      <div
        className="scrollbar-hide relative flex max-h-screen flex-col gap-4 overflow-y-auto p-4"
        ref={containerRef}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <h1>Hello!</h1>

        {cards.map((card, index) => (
          <Card
            key={card.id}
            type="ambient"
            className={`card cursor-pointer`}
            style={{ height: '200px', minHeight: '200px' }}
            ref={el => {
              cardRefs.current[index] = el;
            }}
            onClick={() => animateCard(index)}
          >
            <div
              className="image-container relative flex items-center justify-center"
              style={{ height: '100%', width: '100%' }}
              ref={el => {
                imageContainerRefs.current[index] = el;
              }}
            >
              <img
                src={card.src}
                alt={card.title}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <Card.Chip readOnly>Hot place</Card.Chip>
            <Card.Cell
              readOnly
              subtitle="United states"
              className="hover:bg-transparent"
              style={
                {
                  backgroundColor: 'transparent !important',
                  '--hover-bg': 'transparent',
                  '--hover-bg-opacity': '0',
                } as React.CSSProperties
              }
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Link to="/demo2/item" params={{ id: card.id }}>
                {card.title}
              </Link>
            </Card.Cell>
          </Card>
        ))}
      </div>
    </>
  );
}
