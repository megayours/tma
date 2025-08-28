import type { Prompt, PromptVersion } from '@/types/prompt';
import { useSession } from '../../auth/SessionProvider';
import { useGetPreviewContent } from '../../hooks/useContents';
import type { Content } from '@/types/response';

export const ContentPreviews = ({
  prompt,
  selectedVersion,
}: {
  prompt: Prompt;
  selectedVersion: PromptVersion;
}) => {
  const { session } = useSession();
  const { data: { content, pagination } = { content: [], pagination: {} } } =
    useGetPreviewContent(session, prompt.id, selectedVersion);
  console.log('Content:', content);
  return (
    <div>
      ContentPreview
      <div className="flex flex-row">
        eee
        {content?.map((content: Content) => (
          <div key={content.id}>
            <img src={content.image} alt={content.id} />
          </div>
        ))}
      </div>
    </div>
  );
};
