import type { Prompt } from '@/types/prompt';
import { Button, Chip, Divider } from '@telegram-apps/telegram-ui';

export const InputsEditor = ({ prompt }: { prompt: Prompt }) => {
  return (
    <div className="flex h-12 flex-row items-center justify-center gap-2">
      {Array.from({ length: prompt.maxTokens ?? 1 }).map((_, index) => (
        <div key={index}>
          <Button
            mode="white"
            key={index}
            className=""
            onClick={() => {
              console.log('CLICKED');
            }}
            size="s"
          >
            NFT {index + 1}
          </Button>
        </div>
      ))}
    </div>
  );
};
