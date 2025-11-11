import { Cell, Divider } from '@telegram-apps/telegram-ui';

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
      <Cell onClick={() => onSelectContent('nft')}>NFT</Cell>
      {/* <Divider />
      <Cell onClick={() => onSelectContent('prompt')}>Prompt</Cell> */}
      <Divider />
      <Cell
        onClick={() => onSelectContent('image')}
        disabled={!additionalImagesEnabled}
      >
        Image
      </Cell>
    </div>
  );
};
