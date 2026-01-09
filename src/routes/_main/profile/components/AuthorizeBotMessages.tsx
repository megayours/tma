import { Blockquote, Button } from '@telegram-apps/telegram-ui';
import { requestWriteAccess, useLaunchParams } from '@telegram-apps/sdk-react';

export function AuthorizeBotMessages() {
  const launchParams = useLaunchParams(true);
  const allowsWriteToPm = launchParams?.tgWebAppData?.user?.allowsWriteToPm;

  const handleRequestAccess = async () => {
    if (requestWriteAccess.isAvailable()) {
      try {
        const result = await requestWriteAccess();
        console.log('Write access result:', result);
      } catch (err) {
        console.error('Write access error:', err);
      }
    } else {
      console.log('requestWriteAccess is not available');
    }
  };

  if (!allowsWriteToPm) {
    return (
      <Blockquote type="text">
        <span className="text-tg-button">
          Authorize Bot Messages Allowed: {allowsWriteToPm ? 'Yes' : 'No'}
        </span>
        <Button mode="filled" size="s" onClick={handleRequestAccess}>
          Request Access
        </Button>
      </Blockquote>
    );
  }

  return null;
}
