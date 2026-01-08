import { encodeBase64Url } from '@telegram-apps/sdk-react';

/**
 * Parameters for building a share URL
 */
export interface ShareUrlParams {
  botUrl: string;
  startAppPath: string;
  communityId?: string | null;
}

/**
 * Builds a Telegram bot share URL with encoded startapp parameter
 *
 * The function creates a URL that can be used to share with Telegram users:
 * - Encodes the startAppPath (with optional communityId) as base64
 * - Appends it as the `startapp` query parameter
 * - Used for sharing sticker packs, content, and other app features
 *
 * @param botUrl - The base bot URL (typically from VITE_PUBLIC_BOT_URL)
 * @param startAppPath - The app path to encode (e.g., "/sticker-packs/123")
 * @param communityId - Optional community ID to append to the path
 * @returns The complete share URL ready for use
 *
 * @example
 * const shareUrl = buildShareUrl(
 *   "https://t.me/mybot",
 *   "/sticker-packs/42",
 *   "community-123"
 * );
 * // Result: "https://t.me/mybot?startapp={encodedPayload}"
 */
export function buildShareUrl(params: ShareUrlParams): string;
export function buildShareUrl(
  botUrl: string,
  startAppPath: string,
  communityId?: string | null
): string;
export function buildShareUrl(
  botUrlOrParams: string | ShareUrlParams,
  startAppPath?: string,
  communityId?: string | null
): string {
  // Handle overloaded parameters
  let botUrl: string;
  let path: string;
  let community: string | null | undefined;

  if (typeof botUrlOrParams === 'string') {
    // Called with individual parameters
    botUrl = botUrlOrParams;
    path = startAppPath!;
    community = communityId;
  } else {
    // Called with object parameter
    botUrl = botUrlOrParams.botUrl;
    path = botUrlOrParams.startAppPath;
    community = botUrlOrParams.communityId;
  }

  // Build the payload
  const sharePayload = community
    ? `${path}${path.includes('?') ? '&' : '?'}communityId=${community}`
    : path;

  // Encode and build the final URL
  const shareUrl = `${botUrl}?startapp=${encodeBase64Url(sharePayload)}`;

  return shareUrl;
}
