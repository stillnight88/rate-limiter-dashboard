import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CONFIG_LIMITS, type RateLimitConfig } from '@/types/config';
import Loader from '@/components/kokonutui/loader';

// Zod validation schema for rate limit config
const configSchema = z.object({
    points: z
        .number('Points must be a number')
        .int('Points must be an integer')
        .min(CONFIG_LIMITS.MIN_POINTS, `Minimum ${CONFIG_LIMITS.MIN_POINTS} points`)
        .max(CONFIG_LIMITS.MAX_POINTS, `Maximum ${CONFIG_LIMITS.MAX_POINTS} points`),

    duration: z
        .number('Points must be a number')
        .int('Duration must be an integer')
        .min(CONFIG_LIMITS.MIN_DURATION, `Minimum ${CONFIG_LIMITS.MIN_DURATION} second`)
        .max(CONFIG_LIMITS.MAX_DURATION, `Maximum ${CONFIG_LIMITS.MAX_DURATION} seconds`),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface ConfigFormProps {
    initialValues: RateLimitConfig;
    onSubmit: (values: RateLimitConfig) => void;
    isLoading?: boolean;
    isSubmitting?: boolean;   // Submitting state during update
}

// Rate Limit Configuration Form
export function ConfigForm({
    initialValues,
    onSubmit,
    isLoading = false,
    isSubmitting = false
}: ConfigFormProps) {
    const form = useForm<ConfigFormValues>({
        resolver: zodResolver(configSchema),
        defaultValues: initialValues,
        mode: 'onChange'
    });

    const handleSubmit = (values: ConfigFormValues) => {
        onSubmit(values);
    };

    const isDirty = form.formState.isDirty;   // Check if form has unsaved changes

    if (isLoading) {
        return <ConfigFormSkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rate Limit Configuration</CardTitle>
                <CardDescription>
                    Configure the maximum number of requests allowed per time window
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Points Field */}
                        <FormField
                            control={form.control}
                            name="points"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximum Requests</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            disabled={isSubmitting}
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Convert to number or set to 0 if empty
                                                field.onChange(value === '' ? 0 : parseInt(value, 10));
                                            }}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Number of requests allowed per time window
                                        ({CONFIG_LIMITS.MIN_POINTS} - {CONFIG_LIMITS.MAX_POINTS})
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Duration Field */}
                        <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time Window (seconds)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="60"
                                            disabled={isSubmitting}
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                field.onChange(value === '' ? 0 : parseInt(value, 10));
                                            }}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Duration in seconds ({CONFIG_LIMITS.MIN_DURATION}–
                                        {CONFIG_LIMITS.MAX_DURATION})
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <div className="flex items-center gap-4">
                            <Button
                                type="submit"
                                disabled={!isDirty || isSubmitting || !form.formState.isValid}
                            >
                                {isSubmitting && <Loader/>}
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>

                            {isDirty && !isSubmitting && (
                                <p className="text-sm text-muted-foreground">
                                    You have unsaved changes
                                </p>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

function ConfigFormSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
            </CardHeader>

            <CardContent>
                <div className="space-y-6">
                    {/* Points field skeleton */}
                    <div className="grid gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-4 w-64" />
                    </div>

                    {/* Duration field skeleton */}
                    <div className="grid gap-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-4 w-56" />
                    </div>

                    {/* Button skeleton */}
                    <Skeleton className="h-9 w-32" />
                </div>
            </CardContent>
        </Card>
    );
};
