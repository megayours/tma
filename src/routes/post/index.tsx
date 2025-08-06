import { createFileRoute, Link } from '@tanstack/react-router';
import { usePosts } from '../../lib/queries';

export const Route = createFileRoute('/post/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">
          Error loading posts: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold">Posts</h1>
      <div className="space-y-4">
        {posts?.map(post => (
          <div key={post.id} className="rounded-lg border p-4 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">{post.title}</h2>
            <p className="mb-3 text-gray-600">
              {post.content.substring(0, 100)}...
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>By {post.author}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-3">
              <Link
                to="/post/$postId"
                params={{ postId: post.id }}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Read more
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
