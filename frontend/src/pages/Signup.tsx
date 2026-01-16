import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { GalleryVerticalEnd } from "lucide-react";
import { useSignupForm } from "@/hooks/useSignupForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loader from "@/components/kokonutui/loader";
import { cn } from "@/lib/utils";

const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim(),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must not exceed 50 characters"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const { error, loading, submitForm, clearError } = useSignupForm();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const handleInputChange = () => {
    if (error) clearError();
  };

  const onSubmit = (data: SignupFormData) => {
    const { confirmPassword, ...signupData } = data;
    submitForm(signupData);
  };

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader
              title="Creating your account..."
              subtitle="Please wait while we set up your admin profile"
            />
          </div>
        ) : (
          <div className={cn("flex flex-col gap-6")}>
            <Card>
              <CardHeader className="space-y-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
                    <GalleryVerticalEnd className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>
                    Enter your details to create your account
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="John Doe"
                              autoComplete="name"
                              disabled={loading}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleInputChange();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="m@example.com"
                              autoComplete="email"
                              disabled={loading}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleInputChange();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password Field */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a strong password"
                              autoComplete="new-password"
                              disabled={loading}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleInputChange();
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Must be at least 6 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password Field */}
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Re-enter your password"
                              autoComplete="new-password"
                              disabled={loading}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleInputChange();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" disabled={loading}>
                      Create account
                    </Button>

                    {/* Login Link */}
                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="font-medium text-primary hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardContent className="pt-1">
                <p className="text-xs text-muted-foreground text-center">
                  New accounts are created with <strong>Viewer</strong> role by
                  default. Contact an administrator to upgrade permissions.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
