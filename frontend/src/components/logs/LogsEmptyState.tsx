import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

// Empty State Component for Logs - Displayed when no logs exist in the database
export const LogsEmptyState = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">No request logs yet</h3>
        
        <p className="text-sm text-muted-foreground max-w-md">
          Request logs will appear here once your application starts receiving traffic.
          All allowed, blocked, and banned requests will be tracked.
        </p>
      </CardContent>
    </Card>
  );
};