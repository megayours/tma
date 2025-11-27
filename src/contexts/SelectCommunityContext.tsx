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
import { isFreshLaunch, storeAuthDate } from '@/utils/launchParams';
import { useQueryClient } from '@tanstack/react-query';
import { type SupportedCollection } from '../hooks/useCollections';

interface SelectedCommunityProviderType {
  selectedCommunity: Community | null;
  availableCommunities: Community[];
  setSelectedCommunity: (community: Community | null) => void;
  isLoading: boolean;
  error: Error | null;
  defaultCollection?: SupportedCollection;
}

const SelectedCommunityContext = createContext<
  SelectedCommunityProviderType | undefined
>(undefined);

const STORAGE_KEY = 'selectedCommunity';

export function SelectCommunityProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [selectedCommunity, setSelectedCommunityState] =
    useState<Community | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Get communityId and authDate from URL (priority)
  const { communityId: communityIdFromUrl, authDate } = useCommunityId();

  // Fetch community from URL if present
  const { data: communityFromUrl, isLoading: isLoadingFromUrl } =
    useGetCommunityCollections(communityIdFromUrl);

  // Fetch all available communities
  const { data: availableCommunities, isLoading, error } = useGetCommunities();

  const defaultCollection = selectedCommunity?.collections.filter(
    t => t.id == selectedCommunity.default_collection_id?.toString()
  )[0]!;

  // Initialize from URL (priority) or localStorage
  useEffect(() => {
    console.log(
      `[SelectCommunityContext] Init check: hasInitialized=${hasInitialized}, communityIdFromUrl=${communityIdFromUrl}, authDate=${authDate}, isLoadingFromUrl=${isLoadingFromUrl}, hasCommunityFromUrl=${!!communityFromUrl}, availableCommunitiesCount=${availableCommunities.length}, isLoading=${isLoading}`
    );

    // Priority 0: Auto-select if only 1 community available
    // (Check this BEFORE hasInitialized to ensure it runs when communities load)
    if (
      !isLoading &&
      availableCommunities.length === 1 &&
      !selectedCommunity &&
      !communityIdFromUrl
    ) {
      const singleCommunity = availableCommunities[0];
      console.log(
        `[SelectCommunityContext] Only 1 community available, auto-selecting: ${singleCommunity.name} (${singleCommunity.id})`
      );
      setSelectedCommunityState(singleCommunity);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(singleCommunity));
      setHasInitialized(true);
      return;
    }

    if (hasInitialized) return;

    // Priority 1: URL communityId - but check if it's a fresh launch
    if (communityIdFromUrl) {
      // Check if this is a fresh launch or a page reload
      const isNewLaunch = isFreshLaunch(authDate);

      console.log(
        `[SelectCommunityContext] URL community detected: communityId=${communityIdFromUrl}, authDate=${authDate}, isNewLaunch=${isNewLaunch}, isLoadingFromUrl=${isLoadingFromUrl}, communityName=${communityFromUrl?.name || 'null'}`
      );

      // Only process communityId if it's a fresh launch
      if (isNewLaunch) {
        if (communityFromUrl && !isLoadingFromUrl) {
          console.log(
            `[SelectCommunityContext] Setting community from URL (fresh launch): ${communityFromUrl.name} (${communityFromUrl.id})`
          );
          setSelectedCommunityState(communityFromUrl);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(communityFromUrl));

          // Store the auth_date to detect future reloads
          storeAuthDate(authDate);

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
      } else {
        // Not a fresh launch (reload) - ignore URL communityId and use localStorage
        console.log(
          `[SelectCommunityContext] Reload detected (same auth_date=${authDate}), ignoring URL communityId and using localStorage`
        );
        // Fall through to localStorage loading below
      }
    }

    // Priority 2: localStorage (only if no URL communityId or reload detected)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log(
        `[SelectCommunityContext] Checking localStorage: hasStored=${!!stored}`
      );

      if (stored) {
        const parsedCommunity = JSON.parse(stored) as Community;
        console.log(
          `[SelectCommunityContext] Loading from localStorage: ${parsedCommunity.name} (${parsedCommunity.id})`
        );
        setSelectedCommunityState(parsedCommunity);
        setHasInitialized(true);
      }
    } catch (error) {
      console.error('Failed to load community from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }

    // Only mark as initialized if communities have finished loading
    // This ensures Priority 0 (auto-select single community) can run when data loads
    if (!isLoading) {
      setHasInitialized(true);
      console.log('[SelectCommunityContext] Initialization complete');
    }
  }, [
    communityIdFromUrl,
    communityFromUrl,
    isLoadingFromUrl,
    hasInitialized,
    authDate,
    availableCommunities,
    isLoading,
    selectedCommunity,
  ]);

  // Wrapper to persist to localStorage whenever community changes
  const setSelectedCommunity = (community: Community | null) => {
    setSelectedCommunityState(community);

    if (community) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(community));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Invalidate all queries when community changes
    console.log(
      `[SelectCommunityContext] Invalidating all queries after community change to: ${community?.name || 'null'}`
    );
    queryClient.invalidateQueries();
  };

  return (
    <SelectedCommunityContext.Provider
      value={{
        selectedCommunity,
        availableCommunities,
        setSelectedCommunity,
        isLoading: isLoading || (!!communityIdFromUrl && isLoadingFromUrl),
        error,
        defaultCollection,
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
