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

// Simulate API calls with delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Getting Started with TanStack Router',
    content:
      'TanStack Router is a powerful routing solution for React applications...',
    author: 'John Doe',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Advanced Data Fetching with TanStack Query',
    content:
      'Learn how to efficiently manage server state with TanStack Query...',
    author: 'Jane Smith',
    createdAt: '2024-01-16T14:30:00Z',
  },
  {
    id: '3',
    title: 'Building Modern React Applications',
    content: 'A comprehensive guide to building scalable React applications...',
    author: 'Mike Johnson',
    createdAt: '2024-01-17T09:15:00Z',
  },
];

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
];

// API functions
export const fetchPosts = async (): Promise<Post[]> => {
  await delay(1000); // Simulate network delay
  return mockPosts;
};

export const fetchPost = async (id: string): Promise<Post> => {
  await delay(500);
  const post = mockPosts.find(p => p.id === id);
  if (!post) {
    throw new Error(`Post with id ${id} not found`);
  }
  return post;
};

export const fetchUsers = async (): Promise<User[]> => {
  await delay(800);
  return mockUsers;
};

export const fetchUser = async (id: string): Promise<User> => {
  await delay(300);
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
