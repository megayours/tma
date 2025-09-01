import {
  Button,
  Card,
  Cell,
  Divider,
  Input,
  Placeholder,
  Section,
} from '@telegram-apps/telegram-ui';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import type { Prompt } from '../../types/prompt';

export const SelectNFT = ({
  prompt,
  updatePrompt,
}: {
  prompt: Prompt;
  updatePrompt: ((updates: Partial<Prompt>) => void) | null;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      // Small delay to ensure the component is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleNFTSelect = () => {
    if (updatePrompt) {
      updatePrompt({
        maxTokens: (prompt.maxTokens ?? 0) + 1,
        minTokens: (prompt.minTokens ?? 0) + 1,
      });
      // Todo close modal
    }
  };

  return (
    <>
      <Button onClick={handleNFTSelect}>
        PLEASE CLICK ME, I am useless button
      </Button>
    </>
  );
  /*
    <Section>
      <Input
        ref={inputRef}
        header="NFT Name"
        value={nftName}
        onChange={handleNFTNameChange}
        placeholder="Enter NFT name..."
      />
      <Button
        onClick={handleNFTSelect}
        size="l"
        className="w-full"
        disabled={!nftName.trim()}
      >
        Use "{nftName || 'NFT'}" as NFT
      </Button>
      <Section>
        <Section>
          <h1 className="text-tg-text">Your NFTs</h1>
          <div className="flex flex-row p-2">
            {favorites &&
              favorites.length > 0 &&
              favorites?.map(favorite => (
                <Card
                  key={favorite.token.id}
                  className="border-tg-section-separator flex h-30 w-30 flex-row gap-2"
                >
                  <img
                    src={favorite.token.image}
                    alt={favorite.token.name}
                    className="h-20 w-30 object-cover"
                  />
                  <h2 className="text-tg-text text-center text-sm wrap-break-word">
                    {favorite.token.name}
                  </h2>
                </Card>
              ))}
          </div>
        </Section>
        <div className="flex flex-row items-center justify-center">OR</div>
        <Section>
          <div className="bg-tg-section-bg">
            <h1>User Selected NFT</h1>
            <div className="flex flex-col items-center justify-center p-4">
              <Placeholder
                description="Description"
                header="Title"
                className="bg-tg-section-bg border-tg-section-separator h-80 w-60 rounded-lg border"
              >
                <img
                  alt="Telegram sticker"
                  className="blt0jZBzpxuR4oDhJc8s"
                  src="https://xelene.me/telegram.gif"
                />
              </Placeholder>
            </div>
          </div>
        </Section>
      </Section>
    </Section>
  ); */
};

export const SelectPrompt = ({
  updatePrompt,
  prompt,
}: {
  updatePrompt: ((updates: Partial<Prompt>) => void) | null;
  prompt: Prompt;
}) => {
  console.log('PROMPT', prompt);
  return <div>Select Prompt</div>;
};

export const SelectImage = ({
  prompt,
  updatePrompt,
}: {
  prompt: Prompt;
  updatePrompt: ((updates: Partial<Prompt>) => void) | null;
}) => {
  console.log('PROMPT', prompt);
  return <div>Select Image</div>;
};

export function AddContentButton({
  updatePrompt,
  prompt,
  promptTextareaRef,
  isOpen,
  setIsOpen,
  selectedContent,
  setSelectedContent,
}: {
  updatePrompt: ((updates: Partial<Prompt>) => void) | null;
  prompt: Prompt;
  promptTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedContent: string | null;
  setSelectedContent: (content: string | null) => void;
}) {
  const addNFT = () => {
    setSelectedContent('nft'); // now not used
    updatePrompt?.({
      maxTokens: (prompt.maxTokens ?? 0) + 1,
      minTokens: (prompt.minTokens ?? 0) + 1,
    });
    setIsOpen(false);
    // focus on textarea by using ref
    if (promptTextareaRef.current) {
      promptTextareaRef.current.focus();
    }
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-tg-button text-tg-button-text hover:bg-tg-button/80 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
      aria-label="Add content"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  );
}
