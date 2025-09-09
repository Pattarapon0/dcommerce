"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/forms/fields/country-select";
import { toast } from "sonner";
import { profileCompletionSchema, type ProfileCompletionFormData } from "@/lib/validation/profileCompletion";
import { completeUserProfile } from "@/lib/api/user";
import { useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import axios from "axios";
import type { ServiceError } from "@/lib/types/service-error";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { PageLayout } from "@/components/layout/PageLayout";
import { useRouter } from "next/navigation";
import { User, Phone, Calendar } from "lucide-react";

export default function CompleteProfilePage() {
  const { isChecking } = useRouteGuard({
    allowedRoles: ['Buyer', 'Seller'],
    unauthorizedRedirect: '/login'
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError
  } = useForm<ProfileCompletionFormData>({
    resolver: valibotResolver(profileCompletionSchema),
    defaultValues: {
      phoneNumber: "",
      dateOfBirth: undefined,
      country: "thailand"
    }
  });

  const router = useRouter();

  const onSubmit = async (data: ProfileCompletionFormData): Promise<void> => {
    try {
      await completeUserProfile(data);
      toast.success("Profile completed successfully! Welcome to our platform.");
      router.push('/');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const serviceError = error.response.data as ServiceError;
        if (serviceError.errors) {
          Object.entries(serviceError.errors).forEach(([field, messages]) => {
            if (messages.length > 0) {
              const frontendField = field.charAt(0).toLowerCase() + field.slice(1);
              setError(frontendField as keyof ProfileCompletionFormData, {
                type: "server",
                message: messages[0]
              });
            }
          });
          toast.error("Please fix the errors in the form");
        } else {
          toast.error(serviceError.message || "Failed to complete profile");
        }
      } else {
        console.error("Unexpected profile completion error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return (
    <PageLayout fullHeight className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>
              We need a few more details to set up your account for shopping
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  {...register("phoneNumber")}
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Required for order updates and delivery notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth *
                </Label>
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
                <p className="text-xs text-muted-foreground">
                  Must be at least 13 years old
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">
                  Country *
                </Label>
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
                <p className="text-xs text-muted-foreground">
                  Used for shipping calculations and currency preferences
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? "Completing Profile..." : "Complete Profile"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Your information is secure and will only be used for order processing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}