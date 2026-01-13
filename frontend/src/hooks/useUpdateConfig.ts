import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { configApi } from '@/api/config';
import type { UpdateConfigRequest, RateLimitConfig } from '@/types/config';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

export const useUpdateConfig = () => {
    const queryClient = useQueryClient();

    return useMutation<RateLimitConfig, AxiosError<ApiError>, UpdateConfigRequest>({
        mutationFn: configApi.update,

        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['config', 'rate-limit'] });
            toast.success('Configuration updated', {
                description: `Rate limit set to ${data.points} requests per ${data.duration} seconds`,
            });
        },

        onError: (error) => {
            const message = error.response?.data?.error || error.message || 'Failed to update configuration';

            toast.error('Update failed', {
                description: message,
            });
        },
    });
};