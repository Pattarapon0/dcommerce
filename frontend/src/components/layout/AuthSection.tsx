"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthSection() {
  const { isAuthenticated, userProfile, logout } = useAuth();
  
  return (
    <div className="flex items-center space-x-2">
      {isAuthenticated ? (
        // Authenticated user UI with dropdown
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile?.AvatarUrl || undefined} alt={userProfile?.FirstName || 'User'} />
                <AvatarFallback>
                  {userProfile?.FirstName?.[0]?.toUpperCase() || userProfile?.Email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userProfile?.FirstName && userProfile?.LastName 
                    ? `${userProfile.FirstName} ${userProfile.LastName}`
                    : userProfile?.FirstName || 'User'
                  }
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userProfile?.Email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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