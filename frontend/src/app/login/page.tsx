"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as v from "valibot";
import { loginSchema, type LoginFormData, type LoginErrors } from "@/lib/validation/login";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/lib/hooks/useAuth";
import type { components } from "@/lib/types/api";

type ServiceError = components["schemas"]["ServiceError"];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState<LoginErrors>({});

  // Type-safe validation for individual fields
  const validateField = <K extends keyof LoginFormData>(
    name: K,
    value: LoginFormData[K]
  ): void => {
    try {
      v.parse(loginSchema.entries[name], value);
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

  // Type-safe input change handler
  const handleInputChange = <K extends keyof LoginFormData>(
    name: K, 
    value: LoginFormData[K]
  ): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Type-safe blur handler
  const handleInputBlur = <K extends keyof LoginFormData>(
    name: K, 
    value: LoginFormData[K]
  ): void => {
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    try {
      // Validate entire form
      const validatedData: LoginFormData = v.parse(loginSchema, formData);
      
      // Clear all errors
      setErrors({});
      // Login via useAuth hook
      login({
        Email: validatedData.email,
        Password: validatedData.password
      });
      
      toast.success("Login successful! Welcome back!");
      
      // Redirect to home page
      router.push('/');
      
    } catch (error) {
      if (v.isValiError(error)) {
        // Handle client-side validation errors
        const fieldErrors: LoginErrors = {};
        error.issues.forEach((issue) => {
          const fieldName = issue.path?.[0]?.key as keyof LoginFormData;
          if (fieldName && !fieldErrors[fieldName]) {
            fieldErrors[fieldName] = issue.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the errors in the form");
      } else if (axios.isAxiosError(error) && error.response?.data) {
        // Handle API validation errors
        const serviceError = error.response.data as ServiceError;
        if (serviceError.Errors) {
          // Map backend field errors to frontend form
          const apiErrors: LoginErrors = {};
          Object.entries(serviceError.Errors).forEach(([field, messages]) => {
            if (messages.length > 0) {
              const frontendField = field.charAt(0).toLowerCase() + field.slice(1);
              apiErrors[frontendField as keyof LoginErrors] = messages[0];
            }
          });
          setErrors(apiErrors);
          toast.error("Please fix the errors in the form");
        }
        // General API errors are already handled by Axios interceptor + toast system
      } else {
        console.error("Unexpected login error:", error);
        toast.error("Login failed. Please check your credentials and try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue shopping
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}