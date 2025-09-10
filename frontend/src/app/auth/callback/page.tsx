import { Suspense } from 'react';
import AuthCallbackClient from './AuthCallbackClient';

function AuthCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Loading...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we process your authentication.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackClient />
    </Suspense>
  );
}
