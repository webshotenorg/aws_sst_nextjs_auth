'use client';

import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('returnTo');
  const returnTo = decodeURIComponent(encoded || '');

  const { isAuthenticated, isLoading, redirectToCognitoHostedUI } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToCognitoHostedUI(returnTo);
    }
  }, [isAuthenticated, isLoading, redirectToCognitoHostedUI, returnTo]);

  return <div>Redirecting to login page...</div>;
}
