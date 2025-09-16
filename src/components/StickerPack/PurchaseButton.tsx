import { Button } from '@telegram-apps/telegram-ui';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { usePurchase } from '@/hooks/usePurchase';
import { useSession } from '@/auth/SessionProvider';
import { useGetFavorites } from '@/hooks/useFavorites';

interface PurchaseButtonProps {
  stickerPackId: number;
  price?: string;
}

export function PurchaseButton({
  stickerPackId,
  price = '$9.99',
}: PurchaseButtonProps) {
  const { session } = useSession();
  const { selectedFavorite, isLoadingSelected } = useGetFavorites(session);

  const { purchaseStickerPack, isPending, state } = usePurchase(session, {
    onSuccess: data => {
      console.log('Purchase successful:', data);
    },
    onError: error => {
      console.error('Purchase failed:', error);
    },
  });

  const handlePurchase = () => {
    purchaseStickerPack(stickerPackId, selectedFavorite?.token);
  };

  return (
    <Button
      mode="filled"
      size="s"
      className={`min-w-20 rounded-full px-4 py-2 font-semibold text-white transition-colors ${
        state === 'processing'
          ? 'bg-yellow-500 hover:bg-yellow-600'
          : state === 'success'
            ? 'bg-green-500 hover:bg-green-600'
            : state === 'error'
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
      }`}
      disabled={isPending}
      onClick={handlePurchase}
    >
      <span className="flex items-center gap-2 text-white">
        {/* Always show NFT thumbnail when available (in all states) */}
        {selectedFavorite && !isLoadingSelected && (
          <img
            src={selectedFavorite.token.image || ''}
            alt="Selected NFT"
            className={`h-6 w-6 rounded-full object-cover transition-all ${
              state === 'success'
                ? 'border-2 border-green-300 shadow-md shadow-green-400/50'
                : state === 'error'
                  ? 'border-2 border-red-300 shadow-md shadow-red-400/50'
                  : state === 'processing'
                    ? 'border-2 border-yellow-300 shadow-md shadow-yellow-400/50'
                    : 'border-2 border-white/30'
            }`}
          />
        )}

        {/* State icons */}
        {state === 'processing' && (
          <AiOutlineLoading3Quarters className="animate-spin" />
        )}
        {state === 'success' && <FaCheck />}
        {state === 'error' && <FaTimes />}

        {/* State text */}
        {state === 'processing'
          ? 'Processing...'
          : state === 'success'
            ? 'Purchased!'
            : state === 'error'
              ? 'Failed'
              : price}
      </span>
    </Button>
  );
}
