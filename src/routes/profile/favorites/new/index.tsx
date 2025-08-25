import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '../../../../auth/useAuth';
import {
  useAddToFavoritesMutation,
  useGetSupportedCollections,
} from '@/hooks/useCollections';
import type { SupportedCollection } from '@/hooks/useCollections';
import { Button, Card, Input } from '@telegram-apps/telegram-ui';
import { useEffect, useState } from 'react';
import {
  useGetNFTByCollectionAndTokenId,
  useGetTokensByCollection,
} from '@/hooks/useCollections';

export const Route = createFileRoute('/profile/favorites/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  // get current favorites from the backend
  const { session } = useAuth();
  const { data: supportedCollections } = useGetSupportedCollections();
  const [step, setStep] = useState<number>(0);
  const [selectedCollection, setSelectedCollection] = useState<
    SupportedCollection | undefined
  >(undefined);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [searchToken, setSearchToken] = useState<string>('# ');

  // Move the hook to the top level
  const { data: tokensData, isLoading } = useGetTokensByCollection(
    selectedCollection,
    selectedPage,
    10
  );

  // Simulate a selected collection for testing
  useEffect(() => {
    if (supportedCollections && supportedCollections.length > 0) {
      setSelectedCollection(supportedCollections[0]);
      setStep(1);
    }
  }, [supportedCollections]);

  console.log('supportedCollections', supportedCollections);
  console.log('tokensData', tokensData);
  console.log('tokensData?.tokens', tokensData?.tokens);
  console.log('selectedCollection', selectedCollection);

  const selectedCollections = () => {
    return (
      <div className="grid h-full grid-cols-3 gap-2 overflow-y-auto p-4">
        {supportedCollections?.map((collection: SupportedCollection) => (
          <Card
            key={collection.address}
            className="bg-tg-secondary flex flex-col items-center justify-center gap-4 p-2"
            onClick={() => {
              setSelectedCollection(collection);
              setStep(1);
            }}
          >
            <img
              src={collection.image}
              alt={collection.name}
              className="h-12 w-24 rounded-lg object-cover"
            />
            <div className="text-tg-text mt-4 text-center text-xs font-bold break-words">
              {collection.name}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const selectTokenById = (collection: SupportedCollection) => {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-tg-text text-4xl">{collection.name}</h1>
        <div className="relative flex flex-col gap-4">
          <Input
            header="Token Id"
            placeholder="#..."
            type="text"
            inputMode="numeric"
            value={searchToken}
            onChange={e => {
              console.log('e.target.value', e.target.value);
              // Remove any existing '#' and spaces, then add the prefix
              const cleanValue = e.target.value.replace(/^#\s*/, '');
              setSearchToken(cleanValue ? `# ${cleanValue}` : '# ');
            }}
            className="h-20 text-6xl"
            style={{
              fontSize: '3rem',
            }}
          />
        </div>
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
    const { data: nftData, isLoading: isNFTLoading } =
      useGetNFTByCollectionAndTokenId(
        collection.chain,
        collection.address,
        tokenId
      );

    // Move the hook to the top level of the component
    const addToFavoritesMutation = useAddToFavoritesMutation(
      collection,
      tokenId
    );

    if (isNFTLoading) return <div></div>;
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
        <Button
          className="w-full"
          mode="filled"
          size="l"
          stretched
          onClick={() => {
            console.log('Is there a session?', session);
            if (session) {
              addToFavoritesMutation.mutate(session);
            }
          }}
        >
          Add to favorites
        </Button>
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
