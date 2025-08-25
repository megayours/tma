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
