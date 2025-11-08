import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  useGetCommunities,
  useCommunityId,
  useGetCommunityCollections,
  type Community,
} from '@/hooks/useCommunities';

interface SelectedCommunityProviderType {
  selectedCommunity: Community | null;
  availableCommunities: Community[];
  setSelectedCommunity: (community: Community | null) => void;
  isLoading: boolean;
  error: Error | null;
}

const SelectedCommunityContext = createContext<
  SelectedCommunityProviderType | undefined
>(undefined);

const STORAGE_KEY = 'selectedCommunity';

export function SelectCommunityProvider({ children }: { children: ReactNode }) {
  const [selectedCommunity, setSelectedCommunityState] =
    useState<Community | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Get communityId from URL (priority)
  const communityIdFromUrl = useCommunityId();

  // Fetch community from URL if present
  const { data: communityFromUrl, isLoading: isLoadingFromUrl } =
    useGetCommunityCollections(communityIdFromUrl);

  // Fetch all available communities
  const { data: availableCommunities, isLoading, error } = useGetCommunities();

  // Initialize from URL (priority) or localStorage
  useEffect(() => {
    console.log('[SelectCommunityContext] Init check', {
      hasInitialized,
      communityIdFromUrl,
      isLoadingFromUrl,
      hasCommunityFromUrl: !!communityFromUrl,
    });

    if (hasInitialized) return;

    // Priority 1: URL communityId - wait for fetch to complete
    if (communityIdFromUrl) {
      console.log('[SelectCommunityContext] URL community detected', {
        communityIdFromUrl,
        isLoadingFromUrl,
        communityFromUrl: communityFromUrl
          ? { id: communityFromUrl.id, name: communityFromUrl.name }
          : null,
      });

      if (communityFromUrl && !isLoadingFromUrl) {
        console.log(
          '[SelectCommunityContext] Setting community from URL',
          communityFromUrl.name
        );
        setSelectedCommunityState(communityFromUrl);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(communityFromUrl));
        setHasInitialized(true);

        // Clean up URL parameter
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('communityId');
          window.history.replaceState({}, '', url.toString());
          console.log('[SelectCommunityContext] Cleaned URL parameter');
        }
      }
      return; // Wait for fetch or skip localStorage check
    }

    // Priority 2: localStorage (only if no URL communityId)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('[SelectCommunityContext] Checking localStorage', {
        hasStored: !!stored,
      });

      if (stored) {
        const parsedCommunity = JSON.parse(stored) as Community;
        console.log(
          '[SelectCommunityContext] Loading from localStorage',
          parsedCommunity.name
        );
        setSelectedCommunityState(parsedCommunity);
      }
    } catch (error) {
      console.error('Failed to load community from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }

    setHasInitialized(true);
    console.log('[SelectCommunityContext] Initialization complete');
  }, [
    communityIdFromUrl,
    communityFromUrl,
    isLoadingFromUrl,
    hasInitialized,
  ]);

  // Wrapper to persist to localStorage whenever community changes
  const setSelectedCommunity = (community: Community | null) => {
    setSelectedCommunityState(community);

    if (community) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(community));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <SelectedCommunityContext.Provider
      value={{
        selectedCommunity,
        availableCommunities,
        setSelectedCommunity,
        isLoading: isLoading || (!!communityIdFromUrl && isLoadingFromUrl),
        error,
      }}
    >
      {children}
    </SelectedCommunityContext.Provider>
  );
}

export function useSelectCommunity() {
  const context = useContext(SelectedCommunityContext);
  if (context === undefined) {
    throw new Error(
      'useSelectCommunity must be used within a SelectCommunityProvider'
    );
  }
  return context;
}
