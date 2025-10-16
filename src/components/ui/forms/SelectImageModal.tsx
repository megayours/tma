import { Button } from '@telegram-apps/telegram-ui';
import { useState, useRef } from 'react';
import type { Prompt } from '@/types/prompt';
import { useUploadContent } from '@/hooks/useContents';
import { usePromptMutation } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';

interface SelectImageModalProps {
  prompt: Prompt;
  onClose?: () => void;
}

export const SelectImageModal = ({ prompt, onClose }: SelectImageModalProps) => {
  const { session } = useSession();
  const { mutateAsync: uploadContent, isPending: isUploading } = useUploadContent(session);
  const { mutateAsync: updatePrompt, isPending: isUpdatingPrompt } = usePromptMutation(session);
  const [step, setStep] = useState<'select' | 'uploading' | 'completed' | 'error'>('select');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file');
      setStep('error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 10MB');
      setStep('error');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Convert to base64
    setStep('uploading');
    setErrorMessage('');

    const base64Reader = new FileReader();
    base64Reader.onload = async (e) => {
      try {
        const base64String = e.target?.result as string;
        // Keep the full Data URL (including the prefix)
        const dataUrl = base64String;

        // Upload the image
        const uploadResult = await uploadContent(dataUrl);

        // Update the prompt with the new content ID
        const updatedPrompt = {
          ...prompt,
          additionalContentIds: [
            ...(prompt.additionalContentIds || []),
            uploadResult.id,
          ],
        };

        await updatePrompt({ prompt: updatedPrompt });

        setStep('completed');
        // Close modal after a short delay to show feedback
        setTimeout(() => {
          onClose?.();
        }, 1000);
      } catch (error) {
        console.error('Failed to upload image:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to upload image');
        setStep('error');
      }
    };

    base64Reader.readAsDataURL(file);
  };

  const handleRetry = () => {
    setStep('select');
    setPreviewUrl(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (step === 'completed') {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="text-center">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-tg-text font-medium">Image Uploaded</div>
          <div className="text-tg-hint text-sm">
            Image has been added to prompt
          </div>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="text-center">
          <div className="text-2xl mb-2">❌</div>
          <div className="text-tg-text font-medium">Upload Failed</div>
          <div className="text-tg-destructive-text text-sm mt-2">
            {errorMessage}
          </div>
        </div>
        <Button
          mode="filled"
          size="l"
          onClick={handleRetry}
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (step === 'uploading') {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-64 rounded-lg object-contain"
          />
        )}
        <div className="text-center">
          <div className="text-tg-text font-medium">Uploading...</div>
          <div className="text-tg-hint text-sm mt-2">
            Please wait while we upload your image
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-center mb-4">
        <h3 className="text-tg-text text-lg font-medium mb-2">Upload Image</h3>
        <p className="text-tg-hint text-sm">
          Select an image to add to this prompt
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload-input"
        />
        <Button
          mode="filled"
          size="l"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
          loading={isUploading || isUpdatingPrompt}
          disabled={isUploading || isUpdatingPrompt}
        >
          Choose Image
        </Button>
      </div>

      <div className="text-tg-hint text-xs text-center mt-2">
        Maximum file size: 10MB
        <br />
        Supported formats: JPG, PNG, GIF, WebP
      </div>
    </div>
  );
};