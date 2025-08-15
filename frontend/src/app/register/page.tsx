"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CountrySelect } from "@/components/forms/fields/country-select";
import { CurrencySelect } from "@/components/forms/fields/currency-select";
import Link from "next/link";
import { toast } from "sonner";
import { registerSchemaWithPasswordMatch, type RegisterFormData } from "@/lib/validation/register";
import { registerUser } from "@/lib/api/auth";
import { useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import axios from "axios";
import type { components } from "@/lib/types/api";
import { useRouteGuard } from "@/hooks/useRouteGuard";

type ServiceError = components["schemas"]["ServiceError"];


export default function RegisterPage() {
  const { isChecking } = useRouteGuard({
    allowedRoles: ['GUEST'],
    unauthorizedRedirect: '/'
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError
  } = useForm<RegisterFormData>({
    resolver: valibotResolver(registerSchemaWithPasswordMatch),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      country: "",
      phoneNumber: undefined,
      username: undefined,
      dateOfBirth: undefined,
      preferredCurrency: undefined,
      acceptedTerms: false,
      newsletterSubscription: false
    }
  });

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      const response = await registerUser(data);
      toast.success("Account created successfully! Please check your email to verify your account.");

      console.log("Registration successful:", response);

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const serviceError = error.response.data as ServiceError;
        if (serviceError.Errors) {
          Object.entries(serviceError.Errors).forEach(([field, messages]) => {
            if (messages.length > 0) {
              const frontendField = field.charAt(0).toLowerCase() + field.slice(1);
              setError(frontendField as keyof RegisterFormData, {
                type: "server",
                message: messages[0]
              });
            }
          });
          toast.error("Please fix the errors in the form");
        }
      } else {
        console.error("Unexpected registration error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Join us to start your shopping journey
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password *
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium">
                    Country *
                  </label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select your country..."
                        error={!!errors.country}
                      />
                    )}
                  />
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    {...register("phoneNumber")}
                    className={errors.phoneNumber ? 'border-red-500' : ''}
                    placeholder="+1234567890"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username
                  </label>
                  <Input
                    id="username"
                    {...register("username")}
                    className={errors.username ? 'border-red-500' : ''}
                    placeholder="Optional username"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="text-sm font-medium">
                    Date of Birth
                  </label>
                  <Controller
                    name="dateOfBirth"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={field.value ? field.value.toISOString().split('T')[0] : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          field.onChange(date);
                        }}

                        className={errors.dateOfBirth ? 'border-red-500' : ''}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                      />
                    )}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Must be at least 13 years old</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="preferredCurrency" className="text-sm font-medium">
                    Currency
                  </label>
                  <Controller
                    name="preferredCurrency"
                    control={control}
                    render={({ field }) => (
                      <CurrencySelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choose your preferred currency"
                        error={errors.preferredCurrency?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register("acceptedTerms")}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">
                      I accept the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> *
                    </span>
                  </label>
                  {errors.acceptedTerms && (
                    <p className="text-sm text-red-500">{errors.acceptedTerms.message}</p>
                  )}

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register("newsletterSubscription")}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Subscribe to newsletter</span>
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}