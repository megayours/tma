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
import { SelectCollection } from '@/components/SelectCollection';
import { SelectTokenId } from '@/components/SelectTokenId';

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

  const DisplayNFT = ({
    collection,
    tokenId,
  }: {
    collection: SupportedCollection;
    tokenId: string;
  }) => {
    const {
      data: nftData,
      isLoading: isNFTLoading,
      error,
    } = useGetNFTByCollectionAndTokenId(
      collection.chain,
      collection.address,
      tokenId
    );

    // Move the hook to the top level of the component
    const addToFavoritesMutation = useAddToFavoritesMutation(
      collection,
      tokenId
    );

    if (isNFTLoading) return <div>Loading...</div>;

    if (error) return <div>Error: {error.message}</div>;

    if (nftData === null) {
      return (
        <Card className="flex flex-col items-center justify-center gap-4 p-6">
          <div className="text-tg-text text-center text-lg">
            🚫 This NFT does not exist
          </div>
          <div className="text-tg-hint text-center text-sm">
            Token #{tokenId} was not found in {collection.name}
          </div>
        </Card>
      );
    }

    return (
      <>
        <Card className="flex flex-col items-center justify-center gap-2 p-2">
          <img
            src={nftData?.image}
            alt={nftData?.contract.name}
            className="mx-auto h-64 w-64 rounded-lg object-cover"
          />
          <div className="text-tg-text text-center text-sm font-bold">
            {nftData?.contract.name} #{tokenId}
          </div>
        </Card>
        <CriticalButton
          className="w-full"
          size="lg"
          state={
            addToFavoritesMutation.isPending
              ? 'loading'
              : addToFavoritesMutation.isSuccess
                ? 'success'
                : 'normal'
          }
          normalContent={createButtonContent('Add to favorites', {
            emoji: '❤️',
          })}
          loadingContent={createButtonContent('Adding...', {})}
          successContent={createButtonContent('Added to favorites!', {
            emoji: '✅',
          })}
          redirectUrl="/"
          onClick={() => {
            if (session) {
              addToFavoritesMutation.mutate(session);
            }
          }}
        />
      </>
    );
  };

  return (
    <div>
      {(step === 0 && selectedCollections()) ||
        (step === 1 &&
          selectedCollection &&
          selectTokenById(selectedCollection)) ||
        (step === 2 && <div>Step 2</div>)}
    </div>
  );
}
