import { FiSend } from 'react-icons/fi';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { buildShareUrl } from '@/utils/shareUrl';

export function ShareMessage({
  url,
  startApp,
  withCommunity,
}: {
  url: string;
  startApp: string;
  withCommunity: boolean;
}) {
  const { selectedCommunity } = useSelectCommunity();
  const onShare = async () => {
    const shareUrl = buildShareUrl(
      url,
      startApp,
      withCommunity ? selectedCommunity?.id : null
    );

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check this out',
          url: shareUrl,
        });
        return;
      } catch (e) {
        // user cancelled or not allowed
      }
    } else {
      // fallback: just open the link
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <button
      onClick={onShare}
      className="bg-tg-button text-tg-button-text flex items-center justify-center rounded-full p-2 shadow-sm transition-all hover:shadow-md active:scale-95"
      aria-label="Share"
    >
      <FiSend className="h-5 w-5" />
    </button>
  );
}
