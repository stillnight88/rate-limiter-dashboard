import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { statsAPI } from '@/api/stats';
import type { StatsResponse } from '@/types/stats';
import type { ApiResponse } from '@/types/api';

interface UseOverviewStatsOptions {
    enabled?: boolean;
    refetchInterval?: number;
}

export const useOverviewStats = (
    options: UseOverviewStatsOptions = {}
): UseQueryResult<StatsResponse, AxiosError<ApiResponse>> => {
    const { enabled = true, refetchInterval = 10000 } = options;

    return useQuery({
        queryKey: ['stats', 'overview'],  
        queryFn: statsAPI.getOverview,
        enabled,
        refetchInterval,
        refetchOnWindowFocus: false,  
        staleTime: 5000,
        retry: (failureCount, error) => {
            // Don't retry auth/permission errors
            if (error.response?.status === 401 || error.response?.status === 403) {
                return false;
            }

            // Don't retry rate limit errors
            if (error.response?.status === 429) {
                return false;
            }

            // Retry server errors up to 3 times
            if (error.response?.status && error.response.status >= 500) {
                return failureCount < 3;
            }

            return false;
        },
        retryDelay: (attemptIndex) => {
            return Math.min(1000 * 2 ** attemptIndex, 10000);
        },
    });
};

