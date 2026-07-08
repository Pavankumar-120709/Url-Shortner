import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DateDataPoint {
  date: string;
  value: number;
}

export interface AnalyticsResponse {
  id: number;
  ipAddress: string;
  browser: string;
  operatingSystem: string;
  device: string;
  country: string;
  city: string;
  language: string;
  platform: string;
  userAgent: string;
  referrer: string;
  visitedAt: string;
}

export interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  todayClicks: number;
  monthlyClicks: number;
  activeLinks: number;
  expiredLinks: number;
  qrCodesGenerated: number;
  mostVisitedLinkCode: string;
  mostVisitedLinkOriginal: string;
  mostVisitedLinkClicks: number;
  
  recentActivity: AnalyticsResponse[];
  
  clicksPerDay: DateDataPoint[];
  browserDistribution: ChartDataPoint[];
  osDistribution: ChartDataPoint[];
  deviceDistribution: ChartDataPoint[];
  countryDistribution: ChartDataPoint[];
  referrerDistribution: ChartDataPoint[];
}

export function useDashboardStatsQuery() {
  return useQuery<DashboardStats>({
    queryKey: ['stats', 'dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/stats');
      return data;
    },
    refetchInterval: 15000, // Poll statistics every 15 seconds to keep charts real-time!
  });
}

export function useUrlStatsQuery(shortCode: string) {
  return useQuery<DashboardStats>({
    queryKey: ['stats', 'url', shortCode],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/stats/${shortCode}`);
      return data;
    },
    enabled: !!shortCode,
    refetchInterval: 15000, // Poll specific URL stats every 15s too
  });
}
