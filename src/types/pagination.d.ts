export const PaginationSchema = z.object({
  page: z.string().default('1'),
  size: z.string().default('10'),
});
export type Pagination = z.infer<typeof PaginationSchema>;
