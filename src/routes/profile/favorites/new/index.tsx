import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '../../../../auth/useAuth';
import { useGetSupportedCollections } from '@/hooks/useCollections';
import type { SupportedCollection } from '@/hooks/useCollections';
import { Card } from '@telegram-apps/telegram-ui';
import { useEffect, useState } from 'react';
import { useGetTokensByCollection } from '@/hooks/useCollections';
import { Pagination } from '@/components/ui/Pagination';

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
      <div className="flex flex-col p-4">
        <h1 className="text-tg-text text-xxl text-center font-bold">
          {collection.name}
        </h1>
        {isLoading && <div>Loading tokens...</div>}
        {tokensData && (
          <div className="flex flex-col gap-2">
            {/* Render your tokens here */}
            <p>Tokens loaded: {tokensData.tokens.length}</p>
            {tokensData.tokens.map(token => (
              <div key={token.id}>{token.name}</div>
            ))}

            <Pagination
              page={selectedPage}
              setPage={setSelectedPage}
              totalPages={tokensData?.pagination.totalPages || 1}
            />
          </div>
        )}
      </div>
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
