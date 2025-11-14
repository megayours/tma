import { z } from 'zod';

/**
 * Reusable schema for sticker pack execution status
 * Used across hooks and components for consistent validation
 */
export const ExecutionStatusSchema = z.enum([
  'pending_payment',
  'processing',
  'completed',
  'error',
  'cancelled',
]);

export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;
