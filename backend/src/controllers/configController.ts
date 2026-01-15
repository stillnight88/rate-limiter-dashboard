import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/responseHelpers.js";
import { REDIS_KEYS, getJSON, setJSON, isRedisConnected } from "../utils/redisUtils.js";

interface RateLimitConfig {
    points: number;
    duration: number;  // seconds
}

interface UpdateConfigRequest {
    points: number;
    duration: number;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
    points: 100,
    duration: 60
} as const;

const CONFIG_LIMITS = {
    MIN_POINTS: 1,
    MAX_POINTS: 10000,
    MIN_DURATION: 1,     // 1sec
    MAX_DURATION: 3600,  // 1hr
} as const;

const validateConfig = (
    points: number,
    duration: number
): { valid: boolean; error?: string } => {
    if (typeof points !== "number" || typeof duration !== "number") {
        return { valid: false, error: "Points and duration must be numbers" };
    }

    // Check if values are integers (no decimals)
    if (!Number.isInteger(points) || !Number.isInteger(duration)) {
        return { valid: false, error: "Points and duration must be integer" };
    }

    if (points < CONFIG_LIMITS.MIN_POINTS || points > CONFIG_LIMITS.MAX_POINTS) {
        return {
            valid: false,
            error: `Points must be between ${CONFIG_LIMITS.MIN_POINTS} and ${CONFIG_LIMITS.MAX_POINTS}`,
        };
    }

    if (
        duration < CONFIG_LIMITS.MIN_DURATION ||
        duration > CONFIG_LIMITS.MAX_DURATION
    ) {
        return {
            valid: false,
            error: `Duration must be between ${CONFIG_LIMITS.MIN_DURATION} and ${CONFIG_LIMITS.MAX_DURATION}`,
        };
    }

    return { valid: true };
};

// GET /config/current - Fetch current rate limit configuration
export const getCurrentConfig = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        if (!isRedisConnected()) {
            return sendError(res, 503, "Config service temporarily unavailable");
        }

        const config = await getJSON<RateLimitConfig>(
            REDIS_KEYS.CONFIG.RATE_LIMIT,
            DEFAULT_RATE_LIMIT
        );

        return sendSuccess<RateLimitConfig>(
            res,
            200,
            "Config retrieved successfully",
            config || DEFAULT_RATE_LIMIT
        );
    } catch (error) {
        console.error("Get config error:", error);
        return sendError(res, 500, "Failed to retrieve config");
    }
};

// POST /config/update - Update rate limit configuration - Body: { points, duration }
export const updateConfig = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        if (!isRedisConnected()) {
            return sendError(res, 503, "Config service temporarily unavailable");
        }

        const { points, duration }: UpdateConfigRequest = req.body;

        if (!points || !duration) {
            return sendError(
                res,
                400,
                "Missing required fields",
                ["points", "duration"]
            );
        }

        const validation = validateConfig(points, duration);
        if (!validation.valid) {
            return sendError(res, 400, validation.error!);
        }

        const newConfig: RateLimitConfig = {
            points,
            duration
        };

        const success = await setJSON(REDIS_KEYS.CONFIG.RATE_LIMIT, newConfig);
        if (!success) {
            return sendError(res, 500, "Failed to update config");
        }

        console.log(`Rate limit config updated by admin: ${points} requests per ${duration}s`);

        return sendSuccess<RateLimitConfig>(
            res,
            200,
            "Config updated successfully",
            newConfig
        );
    } catch (error) {
        console.error("Update config error:", error);
        return sendError(res, 500, "Failed to update config");
    }
};