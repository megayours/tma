import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { safeParse, getValidationErrors } from '@/utils/validation';
import type { Session } from '@/auth/useAuth';
import {
  MemeTemplateListResponseSchema,
  MemeTemplateDetailSchema,
  MemeGenerationResponseSchema,
  MemeStatusSchema,
  MemeSchema,
  MemeListResponseSchema,
  CreateMemeTemplateResponseSchema,
  MemeTemplateAnalysisStatusSchema,
  type MemeTemplateListResponse,
  type MemeTemplateDetail,
  type MemeGenerationResponse,
  type MemeStatus,
  type Meme,
  type MemeListResponse,
  type MemeCharacterAssignment,
  type MemeTextInput,
  type CreateMemeTemplateResponse,
  type MemeTemplateAnalysisStatus,
} from '@/types/meme';

// List meme templates with pagination and search
export const useGetMemeTemplates = (
  pagination: { page: number; size: number },
  search?: string
) => {
  return useQuery({
    queryKey: ['meme-templates', pagination.page, pagination.size, search],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        ...(search && { search }),
      });

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/meme-templates?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }

      const data = await response.json();

      // Validate with Zod schema
      const result = safeParse(MemeTemplateListResponseSchema, data);
      if (!result) {
        const errors = getValidationErrors(
          MemeTemplateListResponseSchema,
          data
        );
        console.error('Template list validation errors:', errors);
        throw new Error('Invalid template list response format');
      }

      return result as MemeTemplateListResponse;
    },
  });
};

// Get single template details
export const useGetMemeTemplate = (id: string | null) => {
  return useQuery({
    queryKey: ['meme-template', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Template ID required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/meme-templates/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`);
      }

      const data = await response.json();

      // Validate with Zod schema
      const result = safeParse(MemeTemplateDetailSchema, data);
      if (!result) {
        const errors = getValidationErrors(MemeTemplateDetailSchema, data);
        console.error('Template detail validation errors:', errors);
        throw new Error('Invalid template detail response format');
      }

      return result as MemeTemplateDetail;
    },
    enabled: !!id,
  });
};

// Generate meme mutation
export const useGenerateMemeMutation = (session: Session | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      characterAssignments,
      texts = [],
    }: {
      templateId: string;
      characterAssignments: MemeCharacterAssignment[];
      texts?: MemeTextInput[];
    }): Promise<MemeGenerationResponse> => {
      if (!session?.authToken) {
        throw new Error('Authentication required for meme generation');
      }

      if (!characterAssignments || characterAssignments.length === 0) {
        throw new Error('At least one character assignment required');
      }

      const requestBody = {
        template_id: Number(templateId),
        character_assignments: characterAssignments,
        ...(texts.length > 0 && { texts }),
      };

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/memes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Validate with Zod schema
      const result = safeParse(MemeGenerationResponseSchema, data);
      if (!result) {
        const errors = getValidationErrors(MemeGenerationResponseSchema, data);
        console.error('Generation response validation errors:', errors);
        throw new Error('Invalid generation response format');
      }

      return result as MemeGenerationResponse;
    },
    onSuccess: () => {
      // Invalidate meme queries
      queryClient.invalidateQueries({ queryKey: ['user-memes'] });
    },
  });
};

// Poll meme generation status
export const useMemePollStatus = (memeId: string | null) => {
  const queryClient = useQueryClient();

  return useQuery<MemeStatus>({
    queryKey: ['meme-status', memeId],
    queryFn: async () => {
      if (!memeId) {
        throw new Error('Meme ID required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/memes/${memeId}/status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }

      const data = await response.json();

      // Validate with Zod schema
      const result = safeParse(MemeStatusSchema, data);
      if (!result) {
        const errors = getValidationErrors(MemeStatusSchema, data);
        console.error('Status validation errors:', errors);
        throw new Error('Invalid status response');
      }

      // Invalidate meme queries when completed
      if (result.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['user-memes'] });
        queryClient.invalidateQueries({ queryKey: ['meme', memeId] });
      }

      return result as MemeStatus;
    },
    enabled: !!memeId,
    refetchInterval: query => {
      const status = query.state.data?.status;
      return status === 'processing' ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });
};

// Get completed meme
export const useGetMeme = (memeId: string | null) => {
  return useQuery({
    queryKey: ['meme', memeId],
    queryFn: async () => {
      if (!memeId) {
        throw new Error('Meme ID required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/memes/${memeId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch meme: ${response.status}`);
      }

      const data = await response.json();

      // Validate with Zod schema
      const result = safeParse(MemeSchema, data);
      if (!result) {
        const errors = getValidationErrors(MemeSchema, data);
        console.error('Meme validation errors:', errors);
        throw new Error('Invalid meme response format');
      }

      return result as Meme;
    },
    enabled: !!memeId,
  });
};

// Get user's memes (for GenerationsTimeline)
export const useGetUserMemes = (
  session: Session | null | undefined,
  pagination: { page: number; size: number }
) => {
  return useQuery({
    queryKey: ['user-memes', session?.id, pagination.page, pagination.size],
    queryFn: async () => {
      if (!session?.authToken) {
        throw new Error('Authentication required');
      }

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
      });

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/memes?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user memes: ${response.status}`);
      }

      const data = await response.json();

      // Validate with Zod schema
      const result = safeParse(MemeListResponseSchema, data);
      if (!result) {
        const errors = getValidationErrors(MemeListResponseSchema, data);
        console.error('Meme list validation errors:', errors);
        throw new Error('Invalid meme list response format');
      }

      return result as MemeListResponse;
    },
    enabled: !!session,
  });
};

// Create meme template mutation
export const useCreateMemeTemplateMutation = (
  session: Session | null | undefined
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ image }: { image: File }): Promise<CreateMemeTemplateResponse> => {
      if (!session?.authToken) {
        throw new Error('Authentication required for template creation');
      }

      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/meme-templates`,
        {
          method: 'POST',
          headers: {
            Authorization: session.authToken,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create template: ${response.status}`
        );
      }

      const data = await response.json();

      // Validate with Zod schema
      const result = safeParse(CreateMemeTemplateResponseSchema, data);
      if (!result) {
        const errors = getValidationErrors(
          CreateMemeTemplateResponseSchema,
          data
        );
        console.error('Template creation validation errors:', errors);
        throw new Error('Invalid template creation response format');
      }

      return result as CreateMemeTemplateResponse;
    },
    onSuccess: () => {
      // Invalidate template queries
      queryClient.invalidateQueries({ queryKey: ['meme-templates'] });
    },
  });
};

// Poll meme template analysis status
export const useMemeTemplateAnalysisStatus = (
  templateId: string | number | null
) => {
  return useQuery<MemeTemplateAnalysisStatus>({
    queryKey: ['meme-template-analysis', templateId],
    queryFn: async () => {
      if (!templateId) {
        throw new Error('Template ID required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/meme-templates/${templateId}/analysis-status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch analysis status: ${response.status}`
        );
      }

      const data = await response.json();

      // Validate with Zod schema
      const result = safeParse(MemeTemplateAnalysisStatusSchema, data);
      if (!result) {
        const errors = getValidationErrors(
          MemeTemplateAnalysisStatusSchema,
          data
        );
        console.error('Analysis status validation errors:', errors);
        throw new Error('Invalid analysis status response');
      }

      return result as MemeTemplateAnalysisStatus;
    },
    enabled: !!templateId,
    refetchInterval: query => {
      const status = query.state.data?.analysis_status;
      return status === 'processing' || status === 'pending' ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });
};
