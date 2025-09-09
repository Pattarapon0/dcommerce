"use client";

import { Button } from "@/components/ui/button";
import { initiateGoogleLogin } from "@/lib/api/auth";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

interface GoogleOAuthButtonProps {
  text?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
  disabled?: boolean;
}

export function GoogleOAuthButton({ 
  text = "Continue with Google", 
  variant = "outline",
  className,
  disabled = false 
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await initiateGoogleLogin();
    } catch (error) {
      console.error("Failed to initiate Google login:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-center gap-2 ${className || ""}`}
    >
      <FcGoogle className="w-5 h-5" />
      {isLoading ? "Redirecting..." : text}
    </Button>
  );
}