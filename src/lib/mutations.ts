import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queries';
import type { Post } from './api';

// Simulate API calls for mutations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions for mutations
export const createPost = async (
  post: Omit<Post, 'id' | 'createdAt'>
): Promise<Post> => {
  await delay(1000);
  return {
    ...post,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
};

export const updatePost = async (
  id: string,
  updates: Partial<Post>
): Promise<Post> => {
  await delay(800);
  return {
    id,
    title: updates.title || 'Updated Post',
    content: updates.content || 'Updated content...',
    author: updates.author || 'Unknown Author',
    createdAt: new Date().toISOString(),
  };
};

export const deletePost = async (id: string): Promise<void> => {
  await delay(500);
  // Simulate successful deletion
  console.log(`Deleting post with id: ${id}`);
};

// Mutation hooks
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: newPost => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });

      // Optionally, add the new post to the cache
      queryClient.setQueryData(queryKeys.post(newPost.id), newPost);
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Post> }) =>
      updatePost(id, updates),
    onSuccess: updatedPost => {
      // Update the specific post in cache
      queryClient.setQueryData(queryKeys.post(updatedPost.id), updatedPost);

      // Invalidate posts list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, deletedId) => {
      // Remove the post from cache
      queryClient.removeQueries({ queryKey: queryKeys.post(deletedId) });

      // Invalidate posts list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};
