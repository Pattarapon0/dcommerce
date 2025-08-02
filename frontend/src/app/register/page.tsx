"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CountrySelect } from "@/components/ui/country-select";
import Link from "next/link";
import { toast } from "sonner";
import * as v from "valibot";
import { registerSchemaWithPasswordMatch, type RegisterFormData, type RegisterErrors } from "@/lib/validation/register";
import { registerUser } from "@/lib/api/auth";
import { useState } from "react";
import axios from "axios";
import type { components } from "@/lib/types/api";

type ServiceError = components["schemas"]["ServiceError"];



export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
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
  });

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Type-safe validation for individual fields - simple approach
  const validateField = <K extends keyof RegisterFormData>(
    name: K,
    value: RegisterFormData[K]
  ): void => {
    try {
      // For individual field validation, we need to validate the whole form
      // and then extract errors for this specific field
      v.parse(registerSchemaWithPasswordMatch.entries[name], value);
      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (error) {
      if (v.isValiError(error)) {
        const fieldErrors = error.issues[0].message;  
        setErrors(prev => ({
            ...prev,
            [name]: fieldErrors
        }));
      }
    }
  };

  // Type-safe input change handler with proper overloads
  const handleInputChange = <K extends keyof RegisterFormData>(
    name: K, 
    value: RegisterFormData[K]
  ): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Type-safe blur handler
  const handleInputBlur = <K extends keyof RegisterFormData>(
    name: K, 
    value: RegisterFormData[K]
  ): void => {
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate entire form with proper typing
      const validatedData: RegisterFormData = v.parse(registerSchemaWithPasswordMatch, formData);
      
      // Clear all errors
      setErrors({});
      
      // Make API call to register user
      const response = await registerUser(validatedData);
      toast.success("Account created successfully! Please check your email to verify your account.");
      
      // TODO: Redirect to email verification page or login page
      console.log("Registration successful:", response);
      
    } catch (error) {
      if (v.isValiError(error)) {
        // Handle client-side validation errors
        const fieldErrors: RegisterErrors = {};
        error.issues.forEach((issue) => {
          const fieldName = issue.path?.[0]?.key as keyof RegisterFormData;
          if (fieldName && !fieldErrors[fieldName]) {
            fieldErrors[fieldName] = issue.message; // Store first error as string
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the errors in the form");
      } else if (axios.isAxiosError(error) && error.response?.data) {
        // Handle API validation errors
        const serviceError = error.response.data as ServiceError;
        if (serviceError.Errors) {
          // Map backend field errors to frontend form
          const apiErrors: RegisterErrors = {};
          Object.entries(serviceError.Errors).forEach(([field, messages]) => {
            if (messages.length > 0) {
              // Convert backend field names to frontend field names (camelCase)
              const frontendField = field.charAt(0).toLowerCase() + field.slice(1);
              apiErrors[frontendField as keyof RegisterErrors] = messages[0];
            }
          });
          setErrors(apiErrors);
          toast.error("Please fix the errors in the form");
        }
        // General API errors are already handled by Axios interceptor (automatic toasts)
      } else {
        // Handle unexpected errors
        console.error("Unexpected registration error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleInputChange('firstName', e.target.value)
                    }
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => 
                      handleInputBlur('firstName', e.target.value)
                    }
                    className={errors.firstName ? 'border-red-500' : ''}
                    required
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    onBlur={(e) => handleInputBlur('lastName', e.target.value)}
                    className={errors.lastName ? 'border-red-500' : ''}
                    required
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
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
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={(e) => handleInputBlur('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password *
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={(e) => handleInputBlur('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password *
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={(e) => handleInputBlur('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium">
                  Country * 
                </label>
                <CountrySelect
                  value={formData.country}
                  onValueChange={(value) => {
                    handleInputChange('country', value);
                    handleInputBlur('country', value);
                  }}
                  placeholder="Select your country..."
                  error={!!errors.country}
                />
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber || ""}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value || undefined)}
                  onBlur={(e) => handleInputBlur('phoneNumber', e.target.value || undefined)}
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                  placeholder="+1234567890"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>
              
               <div className="space-y-2">
                 <label htmlFor="username" className="text-sm font-medium">
                   Username
                 </label>
                 <Input
                   id="username"
                   value={formData.username || ""}
                   onChange={(e) => handleInputChange('username', e.target.value || undefined)}
                   onBlur={(e) => handleInputBlur('username', e.target.value || undefined)}
                   className={errors.username ? 'border-red-500' : ''}
                   placeholder="Optional username"
                 />
                 {errors.username && (
                   <p className="text-sm text-red-500">{errors.username}</p>
                 )}
               </div>
               
               <div className="space-y-2">
                 <label htmlFor="dateOfBirth" className="text-sm font-medium">
                   Date of Birth
                 </label>
                 <Input
                   id="dateOfBirth"
                   type="date"
                   value={formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : ""}
                   onChange={(e) => {
                     const date = e.target.value ? new Date(e.target.value) : undefined;
                     handleInputChange('dateOfBirth', date);
                   }}
                   onBlur={(e) => {
                     const date = e.target.value ? new Date(e.target.value) : undefined;
                     handleInputBlur('dateOfBirth', date);
                   }}
                   className={errors.dateOfBirth ? 'border-red-500' : ''}
                   max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                 />
                 {errors.dateOfBirth && (
                   <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                 )}
                 <p className="text-xs text-muted-foreground">Must be at least 13 years old</p>
               </div>

               <div className="space-y-2">
                 <label htmlFor="preferredCurrency" className="text-sm font-medium">
                   Currency
                 </label>
                 <select
                   id="preferredCurrency"
                   value={formData.preferredCurrency || ""}
                   onChange={(e) => handleInputChange('preferredCurrency', e.target.value || undefined)}
                   onBlur={(e) => handleInputBlur('preferredCurrency', e.target.value || undefined)}
                   className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.preferredCurrency ? 'border-red-500' : ''}`}
                 >
                   <option value="">Select currency</option>
                   <option value="THB">THB (Thai Baht)</option>
                   <option value="USD">USD (US Dollar)</option>
                   <option value="EUR">EUR (Euro)</option>
                   <option value="GBP">GBP (British Pound)</option>
                   <option value="JPY">JPY (Japanese Yen)</option>
                   <option value="CNY">CNY (Chinese Yuan)</option>
                 </select>
                 {errors.preferredCurrency && (
                   <p className="text-sm text-red-500">{errors.preferredCurrency}</p>
                 )}
               </div>              
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.acceptedTerms}
                    onChange={(e) => handleInputChange('acceptedTerms', e.target.checked)}
                    className="rounded border-gray-300"
                    required
                  />
                  <span className="text-sm">
                    I accept the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> *
                  </span>
                </label>
                {errors.acceptedTerms && (
                  <p className="text-sm text-red-500">{errors.acceptedTerms}</p>
                )}
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.newsletterSubscription || false}
                    onChange={(e) => handleInputChange('newsletterSubscription', e.target.checked)}
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