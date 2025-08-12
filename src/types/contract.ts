import { z } from 'zod';

export const ContractSchema = z.object({
  chain: z.string(),
  address: z.string(),
  name: z.string(),
});

export type Contract = z.infer<typeof ContractSchema>;
