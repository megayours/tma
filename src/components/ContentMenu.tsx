import type { ReactNode } from 'react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

type ContentType = string | { id: string; content: ReactNode };

interface ContentMenuProps {
  contentTypes: ContentType[];
  selectedContentType: string;
  setSelectedContentType: (contentType: string) => void;
}

export function ContentMenu(props: ContentMenuProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedElement = itemRefs.current[props.selectedContentType];
    const bubble = bubbleRef.current;
    const container = containerRef.current;

    if (selectedElement && bubble && container) {
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();

      const offsetX = selectedRect.left - containerRect.left;
      const width = selectedRect.width;

      gsap.to(bubble, {
        x: offsetX,
        width: width,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [props.selectedContentType, props.contentTypes]);

  return (
    <div className="fixed right-10 bottom-5 left-10 px-4 text-xs">
      <div
        ref={containerRef}
        className="relative flex h-11 flex-row items-center overflow-hidden rounded-4xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-lg"
      >
        {/* Sliding bubble indicator */}
        <div
          ref={bubbleRef}
          className="bg-tg-button/80 absolute h-full rounded-4xl backdrop-blur-sm transition-colors"
          style={{ zIndex: 0 }}
        />

        {props.contentTypes.map(contentType => {
          const id =
            typeof contentType === 'string' ? contentType : contentType.id;
          const content =
            typeof contentType === 'string' ? contentType : contentType.content;

          return (
            <div
              key={id}
              ref={el => {
                itemRefs.current[id] = el;
              }}
              onClick={() => props.setSelectedContentType(id)}
              className="text-tg-button-text relative z-10 flex h-full w-full items-center justify-center p-3"
              style={{ zIndex: 1 }}
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
