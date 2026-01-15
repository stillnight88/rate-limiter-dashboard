import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    LOG_TYPE_ICONS,
    getLogTypeBadgeVariant,
    formatLogTimestamp,
    formatLogTimestampFull,
    type RequestLog,
} from '@/types/logs';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogsTableProps {
    logs: RequestLog[];
    total: number;
    filtered: number;
    isLoading?: boolean;
}

/**
 * Logs Table Component
 * 
 * Features:
 * - Displays logs in reverse chronological order
 * - Color-coded badges by type
 * - IP masking with hover reveal
 * - Relative timestamps with full timestamp on hover
 * - Responsive layout
 * - Loading skeleton
 */

export const LogsTable = ({
    logs,
    total,
    filtered,
    isLoading = false
}: LogsTableProps) => {
    if (isLoading) {
        return <LogsTableSkeleton />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Request Logs</span>
                    <span className="text-sm font-normal text-muted-foreground">
                        Showing {logs.length} of {filtered} {filtered !== total && `(${total} total)`}
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="hidden lg:table-cell">User Agent</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No logs found
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log, index) => (
                                <LogRow key={`${log.timestamp}-${log.ip}-${index}`} log={log} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

// Single Log Row Component - Handles IP masking and timestamp formatting
export const LogRow = ({ log }: { log: RequestLog }) => {
    const [showFullIp, setShowFullIp] = useState(false);
    const Icon = LOG_TYPE_ICONS[log.type];

    const maskedIp = log.ip.split('.').map((part, i) => (i < 2 ? part : '*')).join('.');   // Mask IP: 192.168.1.100 → 192.168.*.*

    return (
        <TableRow>
            {/* Timestamp with tooltip */}
            <TableCell className="font-mono text-xs" title={formatLogTimestampFull(log.timestamp)}>
                {formatLogTimestamp(log.timestamp)}
            </TableCell>

            {/* IP Address with mask/reveal */}
            <TableCell>
                <div className="flex items-center gap-2">
                    <code className="text-xs font-mono">{showFullIp ? log.ip : maskedIp}</code>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowFullIp(!showFullIp)}
                        title={showFullIp ? 'Hide IP' : 'Show full IP'}
                    >
                        {showFullIp ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                </div>
            </TableCell>

            {/* Method */}
            <TableCell>
                <code className="text-xs font-semibold">{log.method}</code>
            </TableCell>

            {/* Route */}
            <TableCell>
                <code className="text-xs">{log.route}</code>
            </TableCell>

            {/* Status Code */}
            <TableCell>
                <code className="text-xs">{log.status}</code>
            </TableCell>

            {/* Type Badge */}
            <TableCell>
                <Badge variant={getLogTypeBadgeVariant(log.type)}>
                    <Icon />
                    {log.type}
                </Badge>
            </TableCell>

            {/* User Agent (hidden on mobile) */}
            <TableCell className="hidden lg:table-cell">
                <span className="text-xs text-muted-foreground truncate max-w-xs block" title={log.userAgent}>
                    {log.userAgent || '—'}
                </span>
            </TableCell>
        </TableRow>
    );
};

const LogsTableSkeleton = () => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="p-6 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};