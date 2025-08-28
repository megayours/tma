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
    <div className="h-full pb-25">
      <div className="h-full pb-70">ss</div>
      <div className="bg-tg-secondary-bg flex max-h-20 flex-row gap-2 overflow-x-auto p-2">
        {content?.map((content: Content) => (
          <div key={content.id} className="">
            <img src={content.image} alt={content.id} className="h-18 w-18" />
          </div>
        ))}
      </div>
    </div>
  );
};
