import { Divider } from '@telegram-apps/telegram-ui';

interface AddInputMenuProps {
  onSelectContent: (contentType: string) => void;
  additionalImagesEnabled: boolean;
}

export const AddInputMenu = ({
  onSelectContent,
  additionalImagesEnabled,
}: AddInputMenuProps) => {
  console.log('additionalImagesEnabled', additionalImagesEnabled);
  return (
    <div className="flex w-full flex-col gap-2 p-4">
      {/* <div
        onClick={() => onSelectContent('nft')}
        className="cursor-pointer rounded-lg bg-tg-secondary p-4 text-tg-text transition-colors hover:bg-tg-secondary/80"
      >
        Input Asset
      </div> */}
      {/* <Divider />
      <div
        onClick={() => onSelectContent('prompt')}
        className="cursor-pointer rounded-lg bg-tg-secondary p-4 text-tg-text transition-colors hover:bg-tg-secondary/80"
      >
        Prompt
      </div> */}
      <Divider />
      <div
        onClick={() =>
          !additionalImagesEnabled ? undefined : onSelectContent('image')
        }
        className={`rounded-lg p-4 transition-colors ${
          additionalImagesEnabled
            ? 'bg-tg-secondary text-tg-text hover:bg-tg-secondary/80 cursor-pointer'
            : 'bg-tg-secondary/40 text-tg-hint cursor-not-allowed opacity-50'
        }`}
      >
        Image
      </div>
    </div>
  );
};
