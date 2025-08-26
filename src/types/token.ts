import { z } from 'zod';
import { ContractSchema } from './contract';

export const TokenSchema = z.object({
  contract: ContractSchema,
  id: z.string(),
  name: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  attributes: z.any().optional(),
  owner: z.string().optional(),
});

export type Token = z.infer<typeof TokenSchema>;
