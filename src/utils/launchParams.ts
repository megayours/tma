/**
 * Extracts auth_date from Telegram initData
 * @param initData The Telegram initData string (URL-encoded query string)
 * @returns auth_date as a number (Unix timestamp in seconds) or null if not found
 */
export function extractAuthDate(initData: string | undefined): number | null {
  if (!initData) return null;

  try {
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');

    if (authDate) {
      const authDateNum = parseInt(authDate, 10);
      if (!isNaN(authDateNum)) {
        return authDateNum;
      }
    }
  } catch (error) {
    console.error('Failed to extract auth_date from initData:', error);
  }

  return null;
}

/**
 * Checks if the launch is fresh (new auth_date) or a reload (same auth_date)
 * @param currentAuthDate The auth_date from current launch params
 * @returns true if this is a fresh launch, false if it's a reload
 */
export function isFreshLaunch(currentAuthDate: number | null): boolean {
  if (currentAuthDate === null) {
    // No auth_date available, treat as fresh launch to process community
    return false;
  }

  try {
    const storedAuthDate = localStorage.getItem('lastLaunchAuthDate');

    if (!storedAuthDate) {
      // First launch, treat as fresh
      return true;
    }

    const storedAuthDateNum = parseInt(storedAuthDate, 10);
    if (isNaN(storedAuthDateNum)) {
      // Invalid stored value, treat as fresh
      return true;
    }

    // Compare: if different, it's a fresh launch
    return currentAuthDate !== storedAuthDateNum;
  } catch (error) {
    console.error('Failed to check if fresh launch:', error);
    // On error, treat as fresh to be safe
    return true;
  }
}

/**
 * Stores the auth_date in localStorage for future comparisons
 * @param authDate The auth_date to store
 */
export function storeAuthDate(authDate: number | null): void {
  if (authDate === null) return;

  try {
    localStorage.setItem('lastLaunchAuthDate', authDate.toString());
  } catch (error) {
    console.error('Failed to store auth_date:', error);
  }
}
