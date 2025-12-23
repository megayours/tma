import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import {
  useGetSupportedCollections,
  useGetNFTByCollectionAndTokenId,
} from '@/hooks/useCollections';
import { NFTSelector } from '@/routes/sticker-packs/$stickerPackId/select-nfts/NFTSelector';
import type { Token } from '@/types/response';
import { useSelectedNFTsSafe } from '@/contexts/SelectedNFTsContext';
import { useGetPrompt } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';
import { useGenerateContentMutation } from '@/hooks/useContents';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';

export const Route = createFileRoute('/content/$promptId/select-nfts/')({
  component: SelectNFTsPage,
});

// Helper function to convert prompt type to content type
const getContentType = (
  promptType: string
): 'image' | 'gif' | 'sticker' | 'animated_sticker' => {
  switch (promptType) {
    case 'images':
      return 'image';
    case 'gifs':
      return 'gif';
    case 'stickers':
      return 'sticker';
    case 'animated_stickers':
      return 'animated_sticker';
    default:
      return 'image';
  }
};

// Selected NFT Display Component
function SelectedNFTDisplay({
  selectedNFT,
  isSelectorOpen,
  onToggleSelector,
}: {
  selectedNFT: Token | null;
  isSelectorOpen: boolean;
  onToggleSelector: () => void;
}) {
  if (!selectedNFT) return null;

  return (
    <div>
      <div
        className={`flex items-center justify-center transition-all duration-500`}
      >
        <div className="flex flex-col items-center">
          {/* NFT Image - Circular with Edit Icon */}
          <div
            className="relative cursor-pointer transition-all duration-500 ease-in-out"
            onClick={onToggleSelector}
          >
            {selectedNFT.image && (
              <img
                src={selectedNFT.image}
                alt={selectedNFT.name || `NFT #${selectedNFT.id}`}
                className={`rounded-full object-cover transition-all duration-500 ease-in-out ${
                  isSelectorOpen ? 'h-24 w-24' : 'h-52 w-52'
                }`}
              />
            )}

            {/* Edit Icon - Overlay */}
            <div
              className={`bg-tg-accent-text absolute rounded-full transition-all duration-500 ease-in-out hover:opacity-90 ${
                isSelectorOpen
                  ? 'right-1 bottom-1 p-1.5'
                  : 'right-3 bottom-3 p-2.5'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`text-white transition-all duration-500 ease-in-out ${
                  isSelectorOpen ? 'h-3 w-3' : 'h-5 w-5'
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
          </div>

          {/* NFT Info Below */}
          <div
            className={`text-tg-text text-center transition-all duration-500 ease-in-out ${
              isSelectorOpen ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div
              className={`font-semibold transition-all duration-500 ease-in-out ${
                isSelectorOpen ? 'text-sm' : 'text-base'
              }`}
            >
              {selectedNFT.name || `NFT #${selectedNFT.id}`}
            </div>
            <div
              className={`text-tg-hint transition-all duration-500 ease-in-out ${
                isSelectorOpen ? 'text-xs' : 'text-sm'
              }`}
            >
              {selectedNFT.contract?.name || 'Unknown Collection'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectNFTsPage() {
  const { promptId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();

  // Fetch prompt data
  const { data: prompt, isLoading: isLoadingPrompt } = useGetPrompt(
    promptId,
    session
  );

  const { data: collections } = useGetSupportedCollections();

  // Local state for selected NFT
  const { selectedFavorite } = useSelectedNFTsSafe();
  const [selectedNFTs, setSelectedNFTs] = useState<Token[]>([]);

  const { defaultCollection } = useSelectCommunity();

  // Generate random token ID for default collection
  const [randomTokenId] = useState(() =>
    defaultCollection
      ? Math.floor(Math.random() * defaultCollection.size).toString()
      : '0'
  );

  // Fetch default token (only when needed)
  const { data: defaultToken } = useGetNFTByCollectionAndTokenId(
    defaultCollection?.chain || '',
    defaultCollection?.address || '',
    randomTokenId
  );
  // Pre-populate with selectedFavorite if available and nothing is selected yet
  useEffect(() => {
    if (selectedFavorite && selectedNFTs.length === 0) {
      setSelectedNFTs([selectedFavorite.token]);
    } else if (!selectedFavorite && defaultToken && selectedNFTs.length === 0) {
      setSelectedNFTs([defaultToken]);
    }
  }, [selectedFavorite, selectedNFTs.length, setSelectedNFTs]);

  // State for selector visibility
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Open selector if no NFT selected, close if one is selected
  useEffect(() => {
    setIsSelectorOpen(selectedNFTs.length === 0);
  }, [selectedNFTs.length]);

  // Generation mutation
  const generateMutation = useGenerateContentMutation(session);

  // Auto-navigate to processing when generation succeeds
  useEffect(() => {
    if (generateMutation.isSuccess && generateMutation.data) {
      navigate({
        to: '/content/$promptId/processing/$executionId',
        params: {
          promptId,
          executionId: generateMutation.data.execution_id,
        },
      });
    }
  }, [generateMutation.isSuccess, generateMutation.data, promptId, navigate]);

  // Handle generation errors
  useEffect(() => {
    if (generateMutation.isError && generateMutation.error) {
      console.error('Generation failed:', generateMutation.error);
      alert(`Generation failed: ${generateMutation.error.message}`);
    }
  }, [generateMutation.isError, generateMutation.error]);

  const handleTokenSelect = useCallback((token: Token) => {
    setSelectedNFTs(token ? [token] : []);
    setIsSelectorOpen(false);
  }, []);

  const handleToggleSelector = () => {
    setIsSelectorOpen(prev => !prev);
  };

  const handleGenerate = () => {
    if (!selectedNFTs.length || !prompt) {
      alert('Please select an NFT to continue');
      return;
    }

    const selectedToken = selectedNFTs[0];

    // Generate content using the selected NFT
    generateMutation.mutate({
      promptId: promptId,
      type: getContentType(prompt.type || 'images'),
      inputs: [
        {
          prompt_id: promptId,
          chain: selectedToken.contract.chain,
          contract_address: selectedToken.contract.address,
          token_id: selectedToken.id,
        },
      ],
    });
  };

  if (isLoadingPrompt) {
    return <SpinnerFullPage text="Loading..." />;
  }

  if (!prompt) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Prompt not found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl p-6">
          <h1 className="text-tg-text mb-2 text-center text-2xl font-bold">
            Select Your NFT
          </h1>
          <p className="text-tg-hint mb-6 text-center">
            Choose an NFT to personalize your {prompt.type}
          </p>

          {/* Selected NFT Display */}
          <SelectedNFTDisplay
            selectedNFT={selectedNFTs[0] || null}
            isSelectorOpen={isSelectorOpen}
            onToggleSelector={handleToggleSelector}
          />

          {/* NFT Selector */}
          {isSelectorOpen && (
            <NFTSelector
              collections={collections}
              onTokenSelect={handleTokenSelect}
              selectedNFT={selectedNFTs[0] || null}
              onCancel={() => setIsSelectorOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Bottom Button */}
      <TelegramDualButtons
        mainButton={{
          text: generateMutation.isPending ? 'Generating...' : 'Generate',
          onClick: handleGenerate,
          disabled: !selectedNFTs.length,
          loading: generateMutation.isPending,
          visible: true,
        }}
      />
    </div>
  );
}
