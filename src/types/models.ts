import { z } from 'zod';

export const ModelCapabilitySchema = z.object({
  type: z.enum(['image', 'video', 'sticker']),
  maxTokens: z.number().optional(),
  maxImages: z.number().optional(),
  supportedSizes: z.array(z.string()).optional(),
  supportedQualities: z.array(z.string()).optional(),
});

export type ModelCapability = z.infer<typeof ModelCapabilitySchema>;

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  capabilities: z.array(ModelCapabilitySchema),
  isEnabled: z.boolean(),
});

export type Model = z.infer<typeof ModelSchema>;

export const ModelsResponseSchema = z.object({
  models: z.array(ModelSchema),
});

export type ModelsResponse = z.infer<typeof ModelsResponseSchema>;