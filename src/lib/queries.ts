import { useQuery } from '@tanstack/react-query';
import { fetchPosts, fetchPost, fetchUsers, fetchUser } from './api';

// Query keys for better cache management
export const queryKeys = {
  posts: ['posts'] as const,
  post: (id: string) => ['post', id] as const,
  users: ['users'] as const,
  user: (id: string) => ['user', id] as const,
};

// Query hooks
export const usePosts = () => {
  return useQuery({
    queryKey: queryKeys.posts,
    queryFn: fetchPosts,
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: queryKeys.post(id),
    queryFn: () => fetchPost(id),
    enabled: !!id, // Only run query if id is provided
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: fetchUsers,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
};
