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
    <div className="w-full" onClick={onShare}>
      <FiSend className="h-auto w-full" />
    </div>
  );
}
