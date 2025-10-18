import { createFileRoute, Link } from '@tanstack/react-router';
import { usePost } from '../../../lib/queries';
import { SpinnerFullPage } from '@/components/ui';

export const Route = createFileRoute('/post/$postId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  const { data: post, isLoading, error } = usePost(postId);

  if (isLoading) {
    return <SpinnerFullPage text="Loading post..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">
          Error loading post: {error.message}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Post not found</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Link
        to="/post"
        className="mb-4 inline-block text-blue-600 underline hover:text-blue-800"
      >
        ← Back to Posts
      </Link>

      <article className="mt-6">
        <header className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>By {post.author}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </header>

        <div className="prose max-w-none">
          <p className="text-lg leading-relaxed">{post.content}</p>
        </div>
      </article>
    </div>
  );
}
