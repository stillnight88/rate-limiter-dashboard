export interface RateLimitConfig {
    points: number;
    duration: number;   // Time window in seconds
}

export interface UpdateConfigRequest {
    points: number;
    duration: number;
}

// Config update response from backend
export interface ConfigUpdateResponse {
    success: true;
    message: string;
    timestamp: string;
    data: RateLimitConfig;
}

// Validation limits from backend
export const CONFIG_LIMITS = {
    MIN_POINTS: 1,
    MAX_POINTS: 10000,
    MIN_DURATION: 1,
    MAX_DURATION: 3600,
} as const;

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
    points: 100,
    duration: 60,
} as const;

// Type guard to check if config is valid
export const isValidConfig = (
    config: Partial<RateLimitConfig>
): config is RateLimitConfig => {
    return (
        typeof config.points === "number" &&
        typeof config.duration === "number" &&
        config.points >= CONFIG_LIMITS.MIN_POINTS &&
        config.points <= CONFIG_LIMITS.MAX_POINTS &&
        config.duration >= CONFIG_LIMITS.MIN_DURATION &&
        config.duration <= CONFIG_LIMITS.MAX_DURATION
    );
};

export const getConfigValidationError = (
    field: 'points' | 'duration',
    value: number
): string | null => {
    if (!Number.isInteger(value)) {
        return `${field} must be an integer`;
    }

    if (field === 'points') {
        if (value < CONFIG_LIMITS.MIN_POINTS || value > CONFIG_LIMITS.MAX_POINTS) {
            return `Points must be between ${CONFIG_LIMITS.MIN_POINTS} and ${CONFIG_LIMITS.MAX_POINTS}`;
        }
    }

    if (field === 'duration') {
        if (value < CONFIG_LIMITS.MIN_DURATION || value > CONFIG_LIMITS.MAX_DURATION) {
            return `Duration must be between ${CONFIG_LIMITS.MIN_DURATION} and ${CONFIG_LIMITS.MAX_DURATION} seconds`;
        }
    }

    return null;
};