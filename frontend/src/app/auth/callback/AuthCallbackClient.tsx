"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handlePkceCallback, parseOAuthCallback } from '@/lib/api/auth';
import { retrieveAndClearPkceData } from '@/lib/utils/pkce';
import { useAtom } from 'jotai';
import { accessTokenAtom, refreshTokenAtom, tokenExpirationAtom } from '@/stores/auth';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, setAccessToken] = useAtom(accessTokenAtom);
  const [, setRefreshToken] = useAtom(refreshTokenAtom);
  const [, setTokenExpiration] = useAtom(tokenExpirationAtom);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function processCallback() {
      try {
        // Parse URL parameters
        const { code, state, error, errorDescription } = parseOAuthCallback(searchParams);
        
        // Check for OAuth errors
        if (error) {
          setStatus('error');
          setErrorMessage(errorDescription || error || 'OAuth authentication failed');
          return;
        }
        
        // Check for authorization code
        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received from Google');
          return;
        }
        
        // Retrieve PKCE data from session storage
        const pkceData = retrieveAndClearPkceData();
        if (!pkceData) {
          setStatus('error');
          setErrorMessage('PKCE data not found. Please try logging in again.');
          return;
        }
        
        // Validate state parameter (CSRF protection)
        if (state !== pkceData.state) {
          setStatus('error');
          setErrorMessage('Invalid state parameter. Possible CSRF attack.');
          return;
        }
        
        // Exchange authorization code for tokens using PKCE
        const loginResponse = await handlePkceCallback(
          code,
          pkceData.codeVerifier,
          state
        );
        
        // Store tokens directly in atoms
        setAccessToken(loginResponse.AccessToken || null);
        setRefreshToken(loginResponse.RefreshToken?.RefreshToken || null);
        setTokenExpiration(loginResponse.Token?.ExpiresAt || null);
        
        setStatus('success');
        
        // Check if profile completion is required for OAuth users
        try {
          // Import profile API at the top level to avoid dynamic imports in callback
          const { getUserProfile } = await import('@/lib/api/user');
          const { ProfileCompleteness } = await import('@/lib/utils/profileCompleteness');
          
          const userProfile = await getUserProfile();
          
          if (ProfileCompleteness.requiresCompletion(userProfile)) {
            // Redirect to profile completion for OAuth users with incomplete profiles
            setTimeout(() => {
              router.push('/complete-profile');
            }, 1000);
          } else {
            // Redirect to home page for users with complete profiles
            setTimeout(() => {
              router.push('/');
            }, 1000);
          }
        } catch (profileError) {
          console.error('Error checking profile completion:', profileError);
          // Fallback: redirect to home if profile check fails
          setTimeout(() => {
            router.push('/');
          }, 1500);
        }
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred during authentication'
        );
      }
    }

    processCallback();
  }, [searchParams, router, setAccessToken, setRefreshToken, setTokenExpiration]);

  // Handle retry
  const handleRetry = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Authenticating...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we complete your Google sign-in.
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Success!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You have been successfully signed in. Redirecting to home page...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Authentication Failed
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {errorMessage}
              </p>
              <button
                onClick={handleRetry}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}