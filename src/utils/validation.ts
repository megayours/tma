import { z } from 'zod';

/**
 * Safely parses data with a Zod schema and returns the parsed data or null if validation fails
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Gets validation errors from a Zod schema as a string
 */
export function getValidationErrors(
  schema: z.ZodSchema,
  data: unknown
): string {
  const result = schema.safeParse(data);
  if (result.success) return '';

  return result.error.issues
    .map((error: z.ZodIssue) => `${error.path.join('.')}: ${error.message}`)
    .join(', ');
}
