import { z } from 'zod';

// Generate NFT params schema dynamically
const MAX_NFTS = 10;

const nftIdSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform(val => (val === undefined ? undefined : String(val)));

export const nftParamsSchema = z.object({
  ...Object.fromEntries(
    Array.from({ length: MAX_NFTS }, (_, i) => [
      [`nft_${i}_chain`, z.string().optional()],
      [`nft_${i}_address`, z.string().optional()],
      [`nft_${i}_id`, nftIdSchema],
      [`nft_${i}_user`, z.string().optional()],
      [`nft_${i}_username`, z.string().optional()],
    ]).flat()
  ),
});

export type NFTUrlParams = z.infer<typeof nftParamsSchema>;
