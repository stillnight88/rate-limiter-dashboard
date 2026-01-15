import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardAction,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import {
    LOG_TYPE_OPTIONS,
    LOG_LIMIT_OPTIONS,
    DEFAULT_LOGS_FILTERS,
    type LogFilterType,
    type LogLimit,
    type LogsFilters as LogsFiltersType,
} from '@/types/logs';

interface LogsFiltersProps {
    filters: LogsFiltersType;
    onTypeChange: (type: LogFilterType) => void;
    onLimitChange: (limit: LogLimit) => void;
    onReset: () => void;
    autoRefreshToggle?: React.ReactNode;
}

/**
 * Logs Filters Component
 * 
 * Features:
 * - Type filter (all/allowed/blocked/banned)
 * - Limit filter (50/100/500/1000)
 * - Reset button (only shows if filters changed)
 * - Auto-refresh toggle in CardAction slot
 */
export const LogsFilters = ({
    filters,
    onTypeChange,
    onLimitChange,
    onReset,
    autoRefreshToggle
}: LogsFiltersProps) => {
    const hasActiveFilters = filters.type !== DEFAULT_LOGS_FILTERS.type || filters.limit !== DEFAULT_LOGS_FILTERS.limit;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                    Filter and customize the request logs view
                </CardDescription>

                {/* Auto-refresh toggle in header action slot */}
                {autoRefreshToggle && (
                    <CardAction>
                        {autoRefreshToggle}
                    </CardAction>
                )}
            </CardHeader>

            <CardContent>
                <div className="grid gap-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    {/* Type Filter */}
                    <div className="grid gap-2">
                        <Label htmlFor="log-type">Request Type</Label>
                        <Select
                            value={filters.type}
                            onValueChange={(value) => onTypeChange(value as LogFilterType)}
                        >
                            <SelectTrigger id="log-type" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LOG_TYPE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Limit Filter */}
                    <div className="grid gap-2">
                        <Label htmlFor="log-limit">Results Limit</Label>
                        <Select
                            value={filters.limit.toString()}
                            onValueChange={(value) => onLimitChange(parseInt(value, 10) as LogLimit)}
                        >
                            <SelectTrigger id="log-limit" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LOG_LIMIT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reset Button (only visible if filters active) */}
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="default"
                            onClick={onReset}
                            className="w-full sm:w-auto"
                        >
                            <RotateCcw />
                            Reset
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
