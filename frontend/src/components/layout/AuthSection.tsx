"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AuthSection() {
  const { isAuthenticated, userBasic, logout } = useAuth();
  
  return (
    <div className="flex items-center space-x-2">
      {isAuthenticated ? (
        // Authenticated user UI
        <div className="flex items-center space-x-2">
          {userBasic && (
            <span className="text-sm text-gray-600 hidden md:block">
              Hi, {userBasic.email.split('@')[0]}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      ) : (
        // Unauthenticated user UI
        <>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}