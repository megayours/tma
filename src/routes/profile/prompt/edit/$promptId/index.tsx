import { createFileRoute, Link } from '@tanstack/react-router';
import { PromptEditor } from '@/components/Prompt/PromptEditor';
import { useAuth } from '@/auth/useAuth';
import { useGetPrompt } from '@/hooks/usePrompts';

export const Route = createFileRoute('/profile/prompt/edit/$promptId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { promptId } = Route.useParams();
  const { session } = useAuth();
  const { data: prompt, isLoading, error } = useGetPrompt(promptId, session);

  if (isLoading) return <div>Loading prompt...</div>;

  if (error) {
    const errorMessage = error.message;
    if (errorMessage.includes('not found')) {
      return (
        <div className="p-4 text-center">
          <h2 className="mb-2 text-xl font-semibold">Prompt Not Found</h2>
          <p className="text-gray-600">
            The prompt you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link to="/" className="text-blue-500">
            Go back to Home
          </Link>
        </div>
      );
    }
    return (
      <div className="p-4 text-center">
        <h2 className="mb-2 text-xl font-semibold">Error</h2>
        <p className="text-red-600">{errorMessage}</p>
      </div>
    );
  }

  if (!prompt) return <div>Prompt not found</div>;

  return <PromptEditor prompt={prompt} />;
}
