import type { Token } from '@/types/response';

/**
 * Encodes a Token object into a compact string format for URL parameters
 * Format: chain:contractAddress:tokenId
 *
 * @param token - The Token object to encode
 * @returns Encoded string in format "chain:contract:tokenId"
 */
export function encodeNFT(token: Token): string {
  const chain = token.contract.chain || 'unknown';
  const contract = token.contract.address;
  const tokenId = token.id;

  return `${chain}:${contract}:${tokenId}`;
}

/**
 * Decodes an NFT string back into its component parts
 * Format: chain:contractAddress:tokenId
 *
 * @param encoded - The encoded NFT string
 * @returns Object with chain, contractAddress, and tokenId
 * @throws Error if the format is invalid
 */
export function decodeNFT(encoded: string): {
  chain: string;
  contractAddress: string;
  tokenId: string;
} {
  const parts = encoded.split(':');

  if (parts.length !== 3) {
    throw new Error(
      `Invalid NFT encoding format. Expected "chain:contract:tokenId", got "${encoded}"`
    );
  }

  const [chain, contractAddress, tokenId] = parts;

  if (!chain || !contractAddress || !tokenId) {
    throw new Error(
      `Invalid NFT encoding: one or more parts are empty in "${encoded}"`
    );
  }

  return {
    chain,
    contractAddress,
    tokenId,
  };
}

/**
 * Encodes an array of tokens into a comma-separated string
 * Useful for supporting multiple NFT selections in the future
 *
 * @param tokens - Array of Token objects
 * @returns Comma-separated encoded string
 */
export function encodeNFTs(tokens: Token[]): string {
  return tokens.map(encodeNFT).join(',');
}

/**
 * Decodes a comma-separated string of NFTs
 *
 * @param encoded - Comma-separated encoded NFT string
 * @returns Array of decoded NFT objects
 */
export function decodeNFTs(encoded: string): Array<{
  chain: string;
  contractAddress: string;
  tokenId: string;
}> {
  if (!encoded || encoded.trim() === '') {
    return [];
  }

  return encoded.split(',').map(decodeNFT);
}

/**
 * Validates if a string is a valid NFT encoding
 *
 * @param encoded - String to validate
 * @returns true if valid, false otherwise
 */
export function isValidNFTEncoding(encoded: string): boolean {
  try {
    decodeNFT(encoded);
    return true;
  } catch {
    return false;
  }
}
