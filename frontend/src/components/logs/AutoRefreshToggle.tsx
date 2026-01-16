import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

interface AutoRefreshToggleProps {
    enabled: boolean;
    onToggle: () => void;
    className?: string;  /** Optional className for styling */
}

// Auto-Refresh Toggle Component - Standalone toggle for enabling/disabling automatic log refresh
export const AutoRefreshToggle = ({
    enabled,
    onToggle,
    className,
}: AutoRefreshToggleProps) => {
    return (
        <div className={className}>
            <Label
                htmlFor="auto-refresh"
                className="flex items-center gap-2 cursor-pointer"
            >
                <RefreshCw className={enabled ? 'animate-spin text-primary' : ''} />
                <span className="text-sm font-medium">Auto-refresh</span>
                <Switch
                    id="auto-refresh"
                    checked={enabled}
                    onCheckedChange={onToggle}
                />
            </Label>
        </div>
    );
};


