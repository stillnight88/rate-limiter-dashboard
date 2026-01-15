import {
    CheckCircle,
    ShieldAlert,
    ShieldBan,
    type LucideIcon,
} from "lucide-react";

export type LogType = 'allowed' | 'blocked' | 'banned';

export interface RequestLog {
    timestamp: string;
    ip: string;
    route: string;
    method: string;
    status: number;
    type: LogType;
    userAgent?: string;
    reason?: string;  // Only present for 'banned' type
}

export interface LogsResponse {
    logs: RequestLog[];
    total: number;
    filtered: number;
}

export type LogFilterType = 'all' | LogType;
export type LogLimit = 50 | 100 | 500 | 1000;

export interface LogsFilters {
    type: LogFilterType;
    limit: LogLimit;
    autoRefresh?: boolean;
}

export const DEFAULT_LOGS_FILTERS: LogsFilters = {
    type: 'all',
    limit: 100,
    autoRefresh: false,
} as const;

// filter options for UI
export const LOG_TYPE_OPTIONS: Array<{ value: LogFilterType; label: string }> = [
    { value: 'all', label: 'All Requests' },
    { value: 'allowed', label: 'Allowed' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'banned', label: 'Banned' },
] as const;

export const LOG_LIMIT_OPTIONS: Array<{ value: LogLimit; label: string }> = [
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 500, label: '500' },
    { value: 1000, label: '1000' },
] as const;

// log type to Lucide icon 
export const LOG_TYPE_ICONS: Record<LogType, LucideIcon> = {
    allowed: CheckCircle,
    blocked: ShieldAlert,
    banned: ShieldBan,
};

// log type to Badge variant
export const getLogTypeBadgeVariant = (
    type: LogType
): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
        case 'allowed':
            return 'default';
        case 'blocked':
            return 'secondary';
        case 'banned':
            return 'destructive';
    }
};

// 2026-01-11T14:30:15.203Z to "5s ago", "3m ago", "2h ago", "1d ago", or fallback to date
export const formatLogTimestamp = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);
        const now = new Date();

        const diffMs = now.getTime() - date.getTime();   // Time passed since the log
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) {
            return `${diffSecs}s ago`;
        } else if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    } catch {
        return timestamp;
    }
};

// Format timestamp to full date/time string - "1/11/2025, 2:30:15 PM"
export const formatLogTimestampFull = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch {
        return timestamp;
    }
};

// Type guard to check if log entry is valid
export const isValidLog = (log: unknown): log is RequestLog => {
    if (typeof log !== 'object' || log === null) return false;

    const entry = log as Partial<RequestLog>;

    return (
        typeof entry.timestamp === 'string' &&
        typeof entry.ip === 'string' &&
        typeof entry.route === 'string' &&
        typeof entry.method === 'string' &&
        typeof entry.status === 'number' &&
        typeof entry.type === 'string' &&
        ['allowed', 'blocked', 'banned'].includes(entry.type)
    );
};