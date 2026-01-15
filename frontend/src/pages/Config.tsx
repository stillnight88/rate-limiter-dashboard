import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/hooks/useConfig';
import { useUpdateConfig } from '@/hooks/useUpdateConfig';
import { ConfigForm } from '@/components/config/ConfigForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, Home, BarChart3, Shield, Settings, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_RATE_LIMIT } from '@/types/config';

const Config = () => {
  const { user, logout, isAdmin } = useAuth();
  const { data: config, isLoading, error } = useConfig();
  const updateMutation = useUpdateConfig();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Configuration
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage rate limit settings
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
        {/* Viewer Warning */}
        {!isAdmin() && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Viewer Mode:</strong> You can view configuration but cannot make changes.
              Contact an administrator for elevated permissions.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-lg font-semibold">Failed to Load Configuration</h2>
            <p className="mb-4 text-muted-foreground text-sm">
              {error.message || 'Something went wrong'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        )}

        {/* Config Form */}
        {!error && (
          <div className="max-w-2xl">
            <ConfigForm
              initialValues={config ?? DEFAULT_RATE_LIMIT}
              onSubmit={(values) => updateMutation.mutate(values)}
              isLoading={isLoading}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Config;