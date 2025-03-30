'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isAuthenticated, isLoading, redirectToCognitoHostedUI } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToCognitoHostedUI();
    }
  }, [isAuthenticated, isLoading, redirectToCognitoHostedUI]);

  return <div>Redirecting to login page...</div>;
}
