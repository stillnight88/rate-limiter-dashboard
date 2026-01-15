import { useAuth } from '@/contexts/AuthContext';
import { useLogs } from '@/hooks/useLogs';
import { LogsFilters } from '@/components/logs/LogsFilters';
import { AutoRefreshToggle } from '@/components/logs/AutoRefreshToggle';
import { LogsTable } from '@/components/logs/LogsTable';
import { LogsEmptyState } from '@/components/logs/LogsEmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, Home, BarChart3, Shield, FileText, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Logs = () => {
    const { user, logout, isAdmin } = useAuth();
    const {
        data,
        isLoading,
        error,
        filters,
        setType,
        setLimit,
        toggleAutoRefresh,
        resetFilters,
        refetch,
    } = useLogs();

    const handleLogout = () => {
        logout();
    };

    const handleRetry = () => {
        refetch();
    };

    // Check if database is truly empty (no logs at all)
    const isDatabaseEmpty = !isLoading && !error && data?.total === 0;

    return (
        <div className="min-h-screen bg-muted/40">
            {/* Header */}
            <header className="border-b bg-background">
                <div className="container mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                Request Logs
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Monitor all incoming requests
                            </p>
                        </div>
                        <Badge variant={isAdmin() ? 'default' : 'secondary'} className="capitalize">
                            {user?.role}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/dashboard">
                            <Button variant="ghost" size="sm">
                                <Home className="mr-0.5 h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
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

                        <span className="text-sm text-muted-foreground">{user?.name}</span>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <Separator />

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {/* Error State */}
                {error && !isLoading && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
                        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
                        <h2 className="mb-2 text-lg font-semibold">Failed to Load Logs</h2>
                        <p className="mb-4 text-muted-foreground text-sm">
                            {error.message || 'Something went wrong'}
                        </p>
                        <Button onClick={handleRetry} variant="outline">
                            Retry
                        </Button>
                    </div>
                )}

                {/* Empty State (no logs in database) */}
                {isDatabaseEmpty && <LogsEmptyState />}

                {/* Normal State (has logs or loading) */}
                {!error && !isDatabaseEmpty && (
                    <div className="space-y-6">
                        {/* Filters with Auto-Refresh Toggle */}
                        <LogsFilters
                            filters={filters}
                            onTypeChange={(type) => setType(type)}
                            onLimitChange={(limit) => setLimit(limit)}
                            onReset={resetFilters}
                            autoRefreshToggle={
                                <AutoRefreshToggle
                                    enabled={filters.autoRefresh ?? false}
                                    onToggle={toggleAutoRefresh}
                                />
                            }
                        />

                        {/* Logs Table */}
                        <LogsTable
                            logs={data?.logs ?? []}
                            total={data?.total ?? 0}
                            filtered={data?.filtered ?? 0}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Logs;