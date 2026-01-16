import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/axiosConfig';
import type { ApiResponse } from '@/types/api';
import type { ResponseData } from '@/types/auth';
import { toast } from 'sonner';

interface UseSignupFormReturn {
    error: string;
    loading: boolean;
    submitForm: (formData: Record<string, unknown>) => Promise<void>;
    clearError: () => void;
}

export const useSignupForm = (): UseSignupFormReturn => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submitForm = async (formData: Record<string, unknown>): Promise<void> => {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.post<ApiResponse<ResponseData>>(
                '/auth/signup',
                formData
            );

            if (!data.success) {
                throw new Error(data.error);
            }

            if (!data.data?.accessToken || !data.data?.user) {
                throw new Error('Invalid response format');
            }

            const { accessToken, user } = data.data;

            login({
                token: accessToken,
                user: user,
            });

            toast.success('Account created successfully!', {
                description: `Welcome, ${user.name}! Your account has been created with ${user.role} role.`,
            });

            navigate('/dashboard', { replace: true });
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            setError(errorMessage);
            toast.error('Signup failed', {
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const clearError = (): void => setError('');

    return {
        error,
        loading,
        submitForm,
        clearError,
    };
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        if (!error.response) {
            return 'Network error. Please check your connection.';
        }

        const responseData = error.response.data as ApiResponse | undefined;
        if (responseData && !responseData.success) {
            return responseData.error;
        }

        const serverMessage = error.response.data?.error || error.response.data?.message;
        if (serverMessage) return serverMessage;

        const status = error.response.status;
        if (status === 409) return 'An account with this email already exists.';
        if (status === 400) return 'Invalid input. Please check your information.';
        if (status === 403) return 'Signup is currently disabled.';
        if (status >= 500) return 'Server error. Please try again later.';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
};