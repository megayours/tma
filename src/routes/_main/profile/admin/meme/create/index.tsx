import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MemeTemplateUpload } from '@/components/Meme/MemeTemplateUpload';
import { useSession } from '@/auth/SessionProvider';
import { useCreateMemeTemplateMutation } from '@/hooks/useMemes';
import { useToast } from '@/components/ui/toast';

export const Route = createFileRoute('/_main/profile/admin/meme/create/')({
  component: MemeTemplateUploadPage,
});

function MemeTemplateUploadPage() {
  const { session } = useSession();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { mutateAsync: createTemplate, isPending } =
    useCreateMemeTemplateMutation(session);

  const handleUpload = async (file: File) => {
    try {
      const result = await createTemplate({ image: file });

      addToast({
        type: 'success',
        title: 'Template Created',
        message: 'Your meme template is being analyzed...',
      });

      // Navigate to the template editor
      navigate({
        to: '/profile/admin/meme/create/$templateId',
        params: { templateId: String(result.id) },
      });
    } catch (error) {
      console.error('Failed to create template:', error);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create meme template',
      });
    }
  };

  return (
    <MemeTemplateUpload onUpload={handleUpload} isUploading={isPending} />
  );
}
