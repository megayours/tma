import { createFileRoute } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import {
  useAddToFavoritesMutation,
  useGetSupportedCollections,
} from '@/hooks/useCollections';
import type { SupportedCollection } from '@/hooks/useCollections';
import { Button, Card, Input } from '@telegram-apps/telegram-ui';
import { CriticalButton, createButtonContent } from '@/components/ui';
import { useState } from 'react';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';
import { SelectCollection, SelectTokenId, DisplayNFT } from '@/components/NFT';

export const Route = createFileRoute('/profile/favorites/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  // get current favorites from the backend
  const { session } = useSession();
  const { data: supportedCollections } = useGetSupportedCollections();
  const [step, setStep] = useState<number>(0);
  const [selectedCollection, setSelectedCollection] = useState<
    SupportedCollection | undefined
  >(undefined);
  const [searchToken, setSearchToken] = useState<string>('# ');

  const selectedCollections = () => {
    return (
      <SelectCollection
        collections={supportedCollections || []}
        onCollectionSelect={collection => {
          setSelectedCollection(collection);
          setStep(1);
        }}
      />
    );
  };

  const selectTokenById = (collection: SupportedCollection) => {
    return (
      <div className="flex flex-col gap-4">
        <SelectTokenId
          collection={collection}
          onBack={() => setStep(0)}
          onTokenSelect={tokenId => {
            setSearchToken(`# ${tokenId}`);
          }}
        />
        {selectedCollection && searchToken !== '# ' && (
          <>
            <DisplayNFT
              collection={selectedCollection}
              tokenId={searchToken.replace(/^#\s*/, '')}
            />
          </>
        )}
      </div>
    );
  };
}
