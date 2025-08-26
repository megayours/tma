import type { Token } from '@/types/token';
import type { Favorite } from '@/hooks/useFavorites';

export type LocalStorageFavorite = {
  user_id: string;
  token_id: string;
  contract_address: string;
  chain: string;
  name: string;
  image_url: string;
  imageBase64: string;
  updatedAt: number;
  createdAt: number;
};

export function restoreFavorite(accountId: string): Favorite | null {
  // get the token from the local storage
  const favorite = localStorage.getItem(`user-favorite-${accountId}`);
  if (!favorite) {
    return null;
  }

  const parsedFavorite = JSON.parse(favorite) as LocalStorageFavorite;
  return {
    token: {
      contract: {
        chain: parsedFavorite.chain,
        address: parsedFavorite.contract_address,
        name: parsedFavorite.name,
      },
      id: parsedFavorite.token_id,
      image: parsedFavorite.image_url,
    },
    createdAt: parsedFavorite.updatedAt,
    updatedAt: parsedFavorite.updatedAt,
  };
}

export function getOrUpdateFavorite(accountId: string, token: Favorite) {
  const favorite = restoreFavorite(accountId);

  const now = Date.now();

  if (!favorite) return // TODO store 

  if (favorite) {
    // if the favorite exists and the updateAt is more recent than token.updatedAt return favorite
    if (token.updatedAt > favorite.updatedAt) {
      return favorite;
    }
    // if the favorite exists and the updateAt is less than token.updatedAt, update the favorite
    // update the favorite
    localStorage.setItem(`user-favorite-${accountId}`, JSON.stringify({
  }
}
