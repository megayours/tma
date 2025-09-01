import { Button, Card, Input } from '@telegram-apps/telegram-ui';
import type { SupportedCollection } from '@/hooks/useCollections';
import { useState } from 'react';

interface SelectTokenIdProps {
  collection: SupportedCollection;
  onBack: () => void;
  onTokenSelect?: (tokenId: string) => void;
  className?: string;
}

export function SelectTokenId({
  collection,
  onBack,
  onTokenSelect,
  className = '',
}: SelectTokenIdProps) {
  const [searchToken, setSearchToken] = useState<string>('# ');

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('e.target.value', e.target.value);
    // Remove any existing '#' and spaces, then add the prefix
    const cleanValue = e.target.value.replace(/^#\s*/, '');
    const newValue = cleanValue ? `# ${cleanValue}` : '# ';
    setSearchToken(newValue);

    // Call onTokenSelect if provided
    if (onTokenSelect && cleanValue) {
      onTokenSelect(cleanValue);
    }
  };

  return (
    <div className={`flex flex-col p-2 ${className}`}>
      <div>
        <Button mode="plain" size="s" onClick={onBack} className="w-fit">
          ←
        </Button>
      </div>
      <h1 className="text-tg-text text-4xl">{collection.name}</h1>
      <div className="relative flex flex-col gap-4">
        <Input
          header="Token Id"
          placeholder="#..."
          type="text"
          inputMode="numeric"
          value={searchToken}
          onChange={handleTokenChange}
          className="h-20 text-6xl"
          style={{
            fontSize: '3rem',
          }}
        />
      </div>
    </div>
  );
}
