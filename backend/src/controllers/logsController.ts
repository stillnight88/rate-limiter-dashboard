import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/responseHelpers.js";
import {
    REDIS_KEYS,
    getJSONList,
    getListLength,
    isRedisConnected,
} from "../utils/redisUtils.js";

interface RequestLog {
    timestamp: string;
    ip: string;
    route: string;
    method: string;
    status: number;
    type: "allowed" | "blocked" | "banned";
    userAgent?: string;
    reason?: string;
}

interface LogsResponse {
    logs: RequestLog[];
    total: number;
    filtered: number;
}

type LogType = "allowed" | "blocked" | "banned" | "all";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

const filterLogsByType = (
    logs: RequestLog[],
    type: LogType
): RequestLog[] => {
    if (type === "all") {
        return logs;
    }

    return logs.filter((log) => log.type === type);
};

const parseLimit = (limitParam: string | undefined): number => {
    if (!limitParam) {
        return DEFAULT_LIMIT;
    }

    const limit = parseInt(limitParam, 10);

    if (isNaN(limit) || limit < 1) {
        return DEFAULT_LIMIT;
    }

    if (limit > MAX_LIMIT) {
        return MAX_LIMIT;
    }

    return limit;
};

const parseType = (typeParam: string | undefined): LogType => {
    if (!typeParam) {
        return "all";
    }

    const validTypes: LogType[] = ["allowed", "blocked", "banned", "all"];
    if (validTypes.includes(typeParam as LogType)) {
        return typeParam as LogType;
    }

    return "all";
};

/**
 * GET /logs - Fetch request logs with optional filtering
 * Query params:
 *   - type: "allowed" | "blocked" | "banned" | "all" (default: "all")
 *   - limit: number (default: 100, max: 1000)
 */

export const getLogs = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        if (!isRedisConnected()) {
            return sendError(res, 503, "Logs service temporarily unavailable");
        }

        const type = parseType(req.query.type as string);
        const limit = parseLimit(req.query.limit as string);

        const totalCount = await getListLength(REDIS_KEYS.LOGS.REQUESTS);
        if (totalCount === 0) {
            return sendSuccess<LogsResponse>(
                res,
                200,
                "No logs found",
                {
                    logs: [],
                    total: 0,
                    filtered: 0,
                }
            );
        }

        const fetchLimit = type === "all" ? limit : MAX_LIMIT;

        const allLogs = await getJSONList<RequestLog>(
            REDIS_KEYS.LOGS.REQUESTS,
            0,
            fetchLimit - 1
        );

        const filteredLogs = filterLogsByType(allLogs, type);

        const limitedLogs = filteredLogs.slice(0, limit);

        const response: LogsResponse = {
            logs: limitedLogs,
            total: totalCount,
            filtered: filteredLogs.length
        };

        return sendSuccess<LogsResponse>(
            res,
            200,
            "Logs retrieved successfully",
            response
        );
    } catch (error) {
        console.error("Get logs error:", error);
        return sendError(res, 500, "Failed to retrieve logs");
    }
};