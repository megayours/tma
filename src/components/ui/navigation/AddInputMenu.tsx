import { Cell, Divider } from '@telegram-apps/telegram-ui';

interface AddInputMenuProps {
  onSelectContent: (contentType: string) => void;
}

export const AddInputMenu = ({ onSelectContent }: AddInputMenuProps) => {
  return (
    <div className="flex w-full flex-col gap-2 p-4">
      <Cell onClick={() => onSelectContent('nft')}>NFT</Cell>
      <Divider />
      <Cell onClick={() => onSelectContent('prompt')}>Prompt</Cell>
      <Divider />
      <Cell onClick={() => onSelectContent('image')}>Image</Cell>
    </div>
  );
};