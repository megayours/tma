// Example API functions for TanStack Query
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// Mock data for demonstration
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'First Post',
    content: 'This is the content of the first post',
    author: 'John Doe',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Second Post',
    content: 'This is the content of the second post',
    author: 'Jane Smith',
    createdAt: new Date().toISOString(),
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
  },
];

// API functions
export const fetchPosts = async (): Promise<Post[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPosts;
};

export const fetchPost = async (id: string): Promise<Post> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const post = mockPosts.find(p => p.id === id);
  if (!post) {
    throw new Error(`Post with id ${id} not found`);
  }
  return post;
};

export const fetchUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockUsers;
};

export const fetchUser = async (id: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const user = mockUsers.find(u => u.id === id);
  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }
  return user;
};

/**
 * Helper function to add parameter to URLSearchParams if it exists
 */
export const addQueryParam = (
  params: URLSearchParams,
  key: string,
  value: any
) => {
  if (value !== undefined && value !== null) {
    params.append(key, String(value));
  }
};

/**
 * Build query string from an object of parameters
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    addQueryParam(searchParams, key, value);
  });

  return searchParams.toString();
};

/**
 * Make a GET request with query parameters
 */
export const apiGet = async <T>(
  url: string,
  params?: Record<string, any>
): Promise<T> => {
  const queryString = params ? buildQueryString(params) : '';
  const fullUrl = `${url}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
