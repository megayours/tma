import { z } from 'zod';
import type { Token } from '@/types/response';

const MAX_NFTS = 10;

function normalizeParamValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

/**
 * Converts array of Token objects to indexed URL search params
 *
 * @param tokens - Array of Token objects to encode
 * @returns Object with indexed parameters (nft_0_chain, nft_0_address, nft_0_id, etc.)
 *
 * @example
 * Input: [{ id: "5", contract: { chain: "ethereum", address: "0x123" } }]
 * Output: { nft_0_chain: "ethereum", nft_0_address: "0x123", nft_0_id: "5" }
 */
export function encodeNFTsToParams(
  tokens: Token[],
  userIdsByIndex?: Array<string | undefined>,
  usernamesByIndex?: Array<string | undefined>
): Record<string, string> {
  const params: Record<string, string> = {};
  const validTokens = tokens.slice(0, MAX_NFTS); // Limit to 10 NFTs

  validTokens.forEach((token, index) => {
    // 0-based indexing
    params[`nft_${index}_chain`] = token.contract.chain;
    params[`nft_${index}_address`] = token.contract.address;
    params[`nft_${index}_id`] = normalizeParamValue(String(token.id));
    const userId = userIdsByIndex?.[index];
    if (userId) {
      params[`nft_${index}_user`] = normalizeParamValue(userId);
    }
    const username = usernamesByIndex?.[index];
    if (username) {
      params[`nft_${index}_username`] = normalizeParamValue(username);
    }
  });

  return params;
}

/**
 * Helper to parse indexed params into a map
 *
 * @param params - Raw search params
 * @param maxIndex - Maximum index to scan (default 10)
 * @returns Map of index → { chain, address, id }
 */
function parseIndexedParams(
  params: Record<string, unknown>,
  maxIndex: number = MAX_NFTS
): Map<
  number,
  { chain: string; address: string; id: string; userId?: string; username?: string }
> {
  const result = new Map();

  for (let i = 0; i < maxIndex; i++) {
    const chain = params[`nft_${i}_chain`];
    const address = params[`nft_${i}_address`];
    const id = params[`nft_${i}_id`];
    const userId = params[`nft_${i}_user`];
    const username = params[`nft_${i}_username`];

    // All three must be present and be non-empty strings
    if (
      typeof chain === 'string' &&
      chain.trim() !== '' &&
      typeof address === 'string' &&
      address.trim() !== '' &&
      typeof id === 'string' &&
      id.trim() !== ''
    ) {
      result.set(i, {
        chain,
        address,
        id,
        userId: typeof userId === 'string' && userId.trim() !== '' ? userId : undefined,
        username:
          typeof username === 'string' && username.trim() !== ''
            ? username
            : undefined,
      });
    }
  }

  return result;
}

/**
 * Extracts NFT data from indexed URL search params
 *
 * @param params - URL search params object
 * @returns Array of NFT identifiers with chain, contractAddress, tokenId
 *
 * @example
 * Input: { nft_0_chain: "ethereum", nft_0_address: "0x123", nft_0_id: "5" }
 * Output: [{ chain: "ethereum", contractAddress: "0x123", tokenId: "5" }]
 */
export function decodeNFTsFromParams(
  params: Record<string, unknown>
): Array<{
  chain: string;
  contractAddress: string;
  tokenId: string;
  userId?: string;
  username?: string;
}> {
  const parsedMap = parseIndexedParams(params);

  // Convert map values to array, preserving order
  return Array.from(parsedMap.values()).map(
    ({ chain, address, id, userId, username }) => ({
      chain,
      contractAddress: address,
      tokenId: id,
      userId,
      username,
    })
  );
}

/**
 * Creates a dynamic Zod schema for NFT URL params
 *
 * @param maxNFTs - Maximum number of NFTs to support (default 10)
 * @returns Zod schema for route validation
 *
 * @example
 * const schema = createNFTParamsSchema(10);
 * // Returns schema with nft_0_chain, nft_0_address, nft_0_id ... nft_9_chain, nft_9_address, nft_9_id
 */
export function createNFTParamsSchema(maxNFTs: number = MAX_NFTS) {
  const schema: Record<string, z.ZodTypeAny> = {};

  for (let i = 0; i < maxNFTs; i++) {
    schema[`nft_${i}_chain`] = z.string().optional();
    schema[`nft_${i}_address`] = z.string().optional();
    schema[`nft_${i}_id`] = z
      .union([z.string(), z.number()])
      .optional()
      .transform(val => (val === undefined ? undefined : String(val)));
    schema[`nft_${i}_user`] = z.string().optional();
    schema[`nft_${i}_username`] = z.string().optional();
  }

  return z.object(schema);
}
