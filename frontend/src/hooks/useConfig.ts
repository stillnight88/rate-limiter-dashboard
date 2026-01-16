import { useQuery } from '@tanstack/react-query';
import { configApi } from '@/api/config';
import type { RateLimitConfig } from '@/types/config';

/**
 * Fetch current rate limit configuration
 * Cache: 30 seconds
 * Refetch: On window focus, on reconnect
 * Retry: Global strategy (3x, skip 401/403)
 */
export const useConfig = () => {
    return useQuery<RateLimitConfig, Error>({
        queryKey: ['config', 'rate-limit'],
        queryFn: configApi.getCurrent,
        staleTime: 30_000, // 30 seconds,
        retry: (failureCount, error) => {
            // Don't retry permission errors
            if (error.message.includes('403') || error.message.includes('401')) {
                return false;
            }
            return failureCount < 3;
        },
    });
};