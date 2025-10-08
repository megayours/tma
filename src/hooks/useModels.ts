'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { ModelsResponse } from '@/types/models';

export const useModels = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await apiGet<ModelsResponse>(
        `${import.meta.env.VITE_PUBLIC_API_URL}/settings/models`
      );
      return response;
    },
  });

  return {
    models: data?.models || [],
    isLoading,
    error,
  };
};
