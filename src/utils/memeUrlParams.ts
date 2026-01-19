import { z } from 'zod';
import { encodeNFTsToParams, decodeNFTsFromParams, type DecodedNFT } from './nftUrlParams';
import type { Token } from '@/types/response';

const MAX_TEXT_ANCHORS = 10;

/**
 * Combines NFT params with text params for meme generation
 *
 * @param tokens - Array of Token objects (may contain undefined for empty slots)
 * @param texts - Array of text strings for anchors
 * @param userIdsByIndex - Optional user IDs for each token
 * @param usernamesByIndex - Optional usernames for each token
 * @returns Object with indexed parameters (nft_0_*, text_0, text_1, etc.)
 *
 * @example
 * Input: [Token], ["Top text", "Bottom text"]
 * Output: {
 *   nft_0_chain: "ethereum",
 *   nft_0_address: "0x123",
 *   nft_0_id: "5",
 *   text_0: "Top text",
 *   text_1: "Bottom text"
 * }
 */
export function encodeMemeParamsToUrl(
  tokens: Array<Token | undefined>,
  texts: string[],
  userIdsByIndex?: Array<string | undefined>,
  usernamesByIndex?: Array<string | undefined>
): Record<string, string> {
  // Get NFT params
  const nftParams = encodeNFTsToParams(tokens, userIdsByIndex, usernamesByIndex);

  // Add text params
  const textParams: Record<string, string> = {};
  texts.forEach((text, index) => {
    if (text && text.trim().length > 0 && index < MAX_TEXT_ANCHORS) {
      textParams[`text_${index}`] = text.trim();
    }
  });

  return { ...nftParams, ...textParams };
}

/**
 * Extracts both NFT and text data from URL search params
 *
 * @param params - URL search params object
 * @returns Object with nfts array and texts array
 *
 * @example
 * Input: {
 *   nft_0_chain: "ethereum",
 *   nft_0_address: "0x123",
 *   nft_0_id: "5",
 *   text_0: "Top text",
 *   text_1: "Bottom text"
 * }
 * Output: {
 *   nfts: [{ chain: "ethereum", contractAddress: "0x123", tokenId: "5" }],
 *   texts: ["Top text", "Bottom text"]
 * }
 */
export function decodeMemeParamsFromUrl(params: Record<string, unknown>): {
  nfts: Array<DecodedNFT | undefined>;
  texts: string[];
} {
  // Decode NFTs
  const nfts = decodeNFTsFromParams(params);

  // Decode texts
  const texts: string[] = [];
  for (let i = 0; i < MAX_TEXT_ANCHORS; i++) {
    const text = params[`text_${i}`];
    if (typeof text === 'string' && text.trim().length > 0) {
      texts[i] = text.trim();
    }
  }

  return { nfts, texts };
}

/**
 * Creates a dynamic Zod schema for meme URL params (NFTs + texts)
 *
 * @param maxNFTs - Maximum number of NFTs to support (default 10)
 * @param maxTexts - Maximum number of text anchors to support (default 10)
 * @returns Zod schema for route validation
 *
 * @example
 * const schema = createMemeParamsSchema(3, 2);
 * // Returns schema with nft_0_*, nft_1_*, nft_2_*, text_0, text_1
 */
export function createMemeParamsSchema(
  maxNFTs: number = 10,
  maxTexts: number = MAX_TEXT_ANCHORS
) {
  const schema: Record<string, z.ZodTypeAny> = {};

  // Add NFT params
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

  // Add text params
  for (let i = 0; i < maxTexts; i++) {
    schema[`text_${i}`] = z.string().optional();
  }

  return z.object(schema);
}
