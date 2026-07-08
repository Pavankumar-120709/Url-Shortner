import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export interface UrlRequest {
  originalUrl: string;
  customAlias?: string;
  maxClicks?: number | null;
  expiresAt?: string | null;
  notes?: string;
}

export interface UrlResponse {
  id: number;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  shortUrl: string;
  clickCount: number;
  maxClicks?: number;
  notes?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUrls {
  content: UrlResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export function useUrlsQuery(
  search = '',
  page = 0,
  size = 10,
  sortBy = 'createdAt',
  sortDir = 'desc'
) {
  return useQuery<PaginatedUrls>({
    queryKey: ['urls', { search, page, size, sortBy, sortDir }],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/urls', {
        params: { search, page, size, sortBy, sortDir },
      });
      return data;
    },
  });
}

export function useUrlQuery(id: number) {
  return useQuery<UrlResponse>({
    queryKey: ['url', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/urls/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateUrlMutation() {
  const queryClient = useQueryClient();
  return useMutation<UrlResponse, Error, UrlRequest>({
    mutationFn: async (urlRequest) => {
      const { data } = await apiClient.post('/api/v1/urls', urlRequest);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useCreateUrlsBulkMutation() {
  const queryClient = useQueryClient();
  return useMutation<UrlResponse[], Error, UrlRequest[]>({
    mutationFn: async (urlRequests) => {
      const { data } = await apiClient.post('/api/v1/urls/bulk', urlRequests);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateUrlMutation() {
  const queryClient = useQueryClient();
  return useMutation<UrlResponse, Error, { id: number; data: UrlRequest }>({
    mutationFn: async ({ id, data }) => {
      const { data: responseData } = await apiClient.put(`/api/v1/urls/${id}`, data);
      return responseData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['url', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteUrlMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/api/v1/urls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
