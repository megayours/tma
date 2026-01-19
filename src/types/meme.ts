import { z } from 'zod';
import { TokenSchema, PaginationResponseSchema } from './response';

// Analysis status for templates
export const AnalysisStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'error',
]);
export type AnalysisStatus = z.infer<typeof AnalysisStatusSchema>;

// Meme status
export const MemeStatusTypeSchema = z.enum([
  'processing',
  'completed',
  'error',
]);
export type MemeStatusType = z.infer<typeof MemeStatusTypeSchema>;

// Character slot in template (bounding box coordinates are normalized 0-1)
export const MemeTemplateCharacterSchema = z.object({
  label: z.string(),
  slot_index: z.number(),
  bbox: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
});
export type MemeTemplateCharacter = z.infer<
  typeof MemeTemplateCharacterSchema
>;

// Text anchor in template (position coordinates are normalized 0-1)
export const MemeTemplateTextAnchorSchema = z.object({
  label: z.string(),
  anchor_index: z.number(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});
export type MemeTemplateTextAnchor = z.infer<
  typeof MemeTemplateTextAnchorSchema
>;

// Meme template (list view)
export const MemeTemplateSchema = z.object({
  id: z.number(),
  name: z.string(),
  tags: z.array(z.string()),
  thumbnail_url: z.string().nullable(),
  analysis_status: AnalysisStatusSchema,
  character_count: z.number(),
  text_anchor_count: z.number(),
  usage_count: z.number(),
  created_at: z.number(),
});
export type MemeTemplate = z.infer<typeof MemeTemplateSchema>;

// Meme template (detailed view with slots)
export const MemeTemplateDetailSchema = MemeTemplateSchema.omit({
  character_count: true,
  text_anchor_count: true,
}).extend({
  image_url: z.string(),
  characters: z.array(MemeTemplateCharacterSchema),
  text_anchors: z.array(MemeTemplateTextAnchorSchema),
  analysis_error: z.string().nullable(),
  creator_id: z.string(),
  updated_at: z.number(),
});
export type MemeTemplateDetail = z.infer<typeof MemeTemplateDetailSchema>;

// Paginated list of templates
export const MemeTemplateListResponseSchema = z.object({
  data: z.array(MemeTemplateSchema),
  pagination: PaginationResponseSchema,
});
export type MemeTemplateListResponse = z.infer<
  typeof MemeTemplateListResponseSchema
>;

// Character assignment for generation request
export const MemeCharacterAssignmentSchema = z.object({
  slot_index: z.number(),
  token: z.object({
    id: z.string(),
    contract: z.object({
      chain: z.string(),
      address: z.string(),
    }),
  }),
});
export type MemeCharacterAssignment = z.infer<
  typeof MemeCharacterAssignmentSchema
>;

// Text input for generation request
export const MemeTextInputSchema = z.object({
  anchor_index: z.number(),
  text: z.string(),
});
export type MemeTextInput = z.infer<typeof MemeTextInputSchema>;

// Generation request
export const MemeGenerationRequestSchema = z.object({
  template_id: z.number(),
  character_assignments: z.array(MemeCharacterAssignmentSchema),
  texts: z.array(MemeTextInputSchema).optional(),
});
export type MemeGenerationRequest = z.infer<
  typeof MemeGenerationRequestSchema
>;

// Generation response (initial async response)
export const MemeGenerationResponseSchema = z.object({
  id: z.string(),
});
export type MemeGenerationResponse = z.infer<
  typeof MemeGenerationResponseSchema
>;

// Status polling response
export const MemeStatusSchema = z.object({
  id: z.string(),
  status: MemeStatusTypeSchema,
  error: z.string().nullish(),
});
export type MemeStatus = z.infer<typeof MemeStatusSchema>;

// Completed meme
export const MemeSchema = z.object({
  id: z.string(),
  status: MemeStatusTypeSchema,
  url: z.string().nullable(),
  thumbnail_url: z.string().nullable(),
  template: z.object({
    id: z.number(),
    name: z.string(),
  }),
  tokens: z.array(TokenSchema),
  creator_id: z.string(),
  created_at: z.number(),
});
export type Meme = z.infer<typeof MemeSchema>;

// Paginated list of memes
export const MemeListResponseSchema = z.object({
  data: z.array(MemeSchema),
  pagination: PaginationResponseSchema,
});
export type MemeListResponse = z.infer<typeof MemeListResponseSchema>;

// Template creation response
export const CreateMemeTemplateResponseSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  image_url: z.string(),
  analysis_status: AnalysisStatusSchema,
  created_at: z.number(),
});
export type CreateMemeTemplateResponse = z.infer<
  typeof CreateMemeTemplateResponseSchema
>;

// Analysis status polling response
export const MemeTemplateAnalysisStatusSchema = z.object({
  id: z.number(),
  analysis_status: AnalysisStatusSchema,
  error: z.string().optional(),
});
export type MemeTemplateAnalysisStatus = z.infer<
  typeof MemeTemplateAnalysisStatusSchema
>;
