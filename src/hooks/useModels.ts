'use client';

import { useQuery } from '@tanstack/react-query';

export const useModels = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/settings/models`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
  });

  return {
    models: data?.models || [],
    isLoading,
    error,
  };
};
