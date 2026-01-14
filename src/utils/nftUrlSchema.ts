import { z } from 'zod';

// Generate NFT params schema dynamically
const MAX_NFTS = 10;

export const nftParamsSchema = z.object({
  ...Object.fromEntries(
    Array.from({ length: MAX_NFTS }, (_, i) => [
      [`nft_${i}_chain`, z.string().optional()],
      [`nft_${i}_address`, z.string().optional()],
      [`nft_${i}_id`, z.string().optional()],
    ]).flat()
  ),
  // Handle notify as either a single string or array, normalize to array
  notify: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform(val => {
      if (!val) return undefined;
      return Array.isArray(val) ? val : [val];
    }),
});

export type NFTUrlParams = z.infer<typeof nftParamsSchema>;
