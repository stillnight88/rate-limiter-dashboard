import { api } from './axiosConfig';
import type { ApiResponse } from '@/types/api';
import type {
    RateLimitConfig,
    UpdateConfigRequest,
} from '@/types/config';
import type { LogsResponse } from '@/types/logs';

export const configApi = {
    //  GET /api/config/current - Fetch current rate limit configuration - Requires: ADMIN or VIEWER role
    getCurrent: async (): Promise<RateLimitConfig> => {
        const { data } = await api.get<ApiResponse<RateLimitConfig>>('/config/current');
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch config');
        }

        if (!data.data) {
            throw new Error('Invalid config response: missing data');
        }

        return data.data;
    },

    // POST /api/config/update - Update rate limit configuration - Requires: ADMIN role
    update: async (payload: UpdateConfigRequest): Promise<RateLimitConfig> => {
        const { data } = await api.post<ApiResponse<RateLimitConfig>>(
            '/config/update',
            payload
        );

        if (!data.success) {
            throw new Error(data.error || 'Failed to update config');
        }

        if (!data.data) {
            throw new Error('Invalid update response: missing data');
        }

        return data.data;
    },
};

export const logsApi = {
    // GET /api/logs - Fetch request logs with optional filtering - Requires: ADMIN or VIEWER role
    /*  Query params:
       - type: "allowed" | "blocked" | "banned" | undefined (all)
       - limit: number (50-1000)
    */
    getLogs: async (params: {
        type?: string,
        limit?: number
    }): Promise<LogsResponse> => {
        const { data } = await api.get<ApiResponse<LogsResponse>>('/logs', {
            params: {
                // Only send type if it's not 'all'
                type: params.type !== "all" ? params.type : undefined,
                limit: params.limit
            }
        });

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch logs');
        }

        if (!data.data) {
            throw new Error('Invalid logs response: missing data');
        }

        return data.data;
    },
};

export const configService = {
    ...configApi,
    ...logsApi,
};