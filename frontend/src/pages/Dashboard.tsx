import { AxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { useOverviewStats } from '@/hooks/useOverviewStats';
import { useConfig } from '@/hooks/useConfig';
import { StatsGrid } from '@/components/stats/StatsGrid';
import { StatsGridSkeleton } from '@/components/stats/StatsGridSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, LogOut, AlertCircle, BarChart3, Shield, Settings, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useOverviewStats();
    const { data: configData, isLoading: configLoading } = useConfig();

    const handleLogout = () => {
        logout();
    };

    const handleRetry = async () => {
        toast.promise(refetchStats(), {
            loading: 'Refreshing stats...',
            success: 'Stats updated successfully',
            error: 'Failed to refresh stats',
        });
    };

    const getErrorMessage = (error: AxiosError<ApiResponse> | null): string => {
        if (!error) return 'Something went wrong';

        if (error.response?.data) {
            const data = error.response.data;
            if (typeof data === 'object' && data !== null) {
                if (!data.success && 'error' in data) {
                    return data.error;
                }
            }
        }

        if (error.message) {
            return error.message;
        }

        return 'Something went wrong';
    };

    return (
        <div className="min-h-screen bg-muted/40">
            <header className="border-b bg-background">
                <div className="container mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-muted-foreground text-sm">
                                Welcome back, {user?.name}
                            </p>
                        </div>
                        <Badge
                            variant={isAdmin() ? 'default' : 'secondary'}
                            className="capitalize"
                        >
                            {user?.role}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/analytics">
                            <Button variant="ghost" size="sm">
                                <BarChart3 className="mr-0.5 h-4 w-4" />
                                Analytics
                            </Button>
                        </Link>
                        <Link to="/ips">
                            <Button variant="ghost" size="sm">
                                <Shield className="mr-0.5 h-4 w-4" />
                                IP Management
                            </Button>
                        </Link>
                        <Link to="/config">
                            <Button variant="ghost" size="sm">
                                <Settings className="mr-0.5 h-4 w-4" />
                                Config
                            </Button>
                        </Link>
                        <Link to="/logs">
                            <Button variant="ghost" size="sm">
                                <FileText className="mr-0.5 h-4 w-4" />
                                Logs
                            </Button>
                        </Link>

                        {!statsLoading && !statsError && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRetry}
                                aria-label="Refresh stats"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <Separator />

            <main className="container mx-auto px-6 py-8 space-y-6">
                {/* Stats Grid */}
                {statsLoading && <StatsGridSkeleton />}

                {statsError && !statsLoading && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
                        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
                        <h2 className="mb-2 text-lg font-semibold">
                            Failed to Load Stats
                        </h2>
                        <p className="mb-4 text-muted-foreground text-sm">
                            {getErrorMessage(statsError)}
                        </p>
                        <Button onClick={handleRetry} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </div>
                )}

                {statsData && !statsLoading && !statsError && (
                    <StatsGrid data={statsData.data} />
                )}

                {/* Rate Limit Status Card */}
                {!statsLoading && !statsError && statsData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Rate Limit Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Current Configuration */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Current Configuration
                                    </p>
                                    {configLoading ? (
                                        <Skeleton className="h-6 w-48" />
                                    ) : configData ? (
                                        <p className="text-lg font-semibold">
                                            {configData.points} requests per {configData.duration}s
                                        </p>
                                    ) : (
                                        <p className="text-lg font-semibold">
                                            {statsData.data.currentRateLimit.points} requests per{' '}
                                            {statsData.data.currentRateLimit.duration}s
                                        </p>
                                    )}
                                </div>

                                {/* Remaining Quota */}
                          
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default Dashboard;