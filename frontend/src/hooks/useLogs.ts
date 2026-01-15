import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { logsApi } from '@/api/config';
import type { LogsResponse, LogsFilters, LogFilterType, LogLimit } from '@/types/logs';
import { DEFAULT_LOGS_FILTERS } from '@/types/logs';

// Parse and validate filter from URL search params
const parseFiltersFromURL = (searchParams: URLSearchParams): LogsFilters => {
    const typeParam = searchParams.get('type');
    const limitParam = searchParams.get('limit');
    const autoRefreshParam = searchParams.get('autoRefresh');

    const validTypes: LogFilterType[] = ['all', 'allowed', 'blocked', 'banned'];
    const type: LogFilterType = validTypes.includes(typeParam as LogFilterType)
        ? (typeParam as LogFilterType)
        : DEFAULT_LOGS_FILTERS.type;

    const validLimits: LogLimit[] = [50, 100, 500, 1000];
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : null;
    const limit: LogLimit = parsedLimit && validLimits.includes(parsedLimit as LogLimit)
        ? (parsedLimit as LogLimit)
        : DEFAULT_LOGS_FILTERS.limit;

    const autoRefresh = autoRefreshParam === 'true';

    return { type, limit, autoRefresh };
};

// Fetch request logs with URL-based filtering
export const useLogs = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const filters = useMemo(
        () => parseFiltersFromURL(searchParams),
        [searchParams]
    );

    const query = useQuery<LogsResponse, Error>({
        queryKey: ['logs', filters.type, filters.limit],
        queryFn: () => logsApi.getLogs({
            type: filters.type,
            limit: filters.limit
        }),
        staleTime: 10_000,
        // Constant polling wastes resources. Users opt-in when monitoring live traffic.
        refetchInterval: filters.autoRefresh ? 5000 : false, // Auto-refresh every 5s if enabled
    });

    const updateFilters = useCallback(
        (updates: Partial<LogsFilters>) => {
            const newFilters = { ...filters, ...updates };

            const newParams = new URLSearchParams();

            // Only set non-default values
            if (newFilters.type !== DEFAULT_LOGS_FILTERS.type) {
                newParams.set('type', newFilters.type);
            }

            if (newFilters.limit !== DEFAULT_LOGS_FILTERS.limit) {
                newParams.set('limit', newFilters.limit.toString());
            }

            if (newFilters.autoRefresh) {
                newParams.set('autoRefresh', 'true');
            }

            setSearchParams(newParams, { replace: true });
        },
        [filters, setSearchParams]
    );

    const setType = useCallback(
        (type: LogFilterType) => {
            updateFilters({ type });
        },
        [updateFilters]
    );

    const setLimit = useCallback(
        (limit: LogLimit) => { updateFilters({ limit }) },
        [updateFilters]
    );

    const toggleAutoRefresh = useCallback(
        () => updateFilters({ autoRefresh: !filters.autoRefresh }),
        [filters.autoRefresh, updateFilters]
    );

    const resetFilters = useCallback(() => {
        setSearchParams(new URLSearchParams(), { replace: true });
    }, [setSearchParams]);

    return {
        ...query,
        filters,
        updateFilters,
        setType,
        setLimit,
        toggleAutoRefresh,
        resetFilters,
    };
};