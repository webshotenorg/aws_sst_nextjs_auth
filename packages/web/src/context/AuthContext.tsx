/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  redirectToCognitoHostedUI: (redirect: string) => void;
  logout: () => void;
  validateSession: () => Promise<Validate>; // 追加
}

interface User {
  username: string;
  email: string;
  emailVerified: boolean;
  userId: string;
}

interface Validate {
  valid: boolean;
  error?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const redirectToCognitoHostedUI = (returnTo?: string) => {
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!,
    );

    if (!cognitoDomain || !clientId || !redirectUri) {
      console.error('Cognito環境変数が設定されていません');
      return;
    }

    const scope = [
      'openid',
      'email',
      'profile',
      'aws.cognito.signin.user.admin',
    ].join(' ');

    const addUrl = returnTo ? `&state=${encodeURIComponent(returnTo)}` : '';
    const loginUrl =
      `https://${cognitoDomain}/login?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}` +
      addUrl;

    window.location.href = loginUrl;
  };

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  const validateSession = async (): Promise<Validate> => {
    try {
      const res = await fetch('/api/auth/validate', {
        credentials: 'include',
      });

      // 401エラー（未認証）を特別扱い
      if (res.status === 401) {
        return { valid: false, error: 'Unauthorized' };
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return { valid: data.valid };
    } catch (error) {
      console.error('Session validation failed:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const fetchUser = async (): Promise<User | null> => {
    try {
      const res = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('User fetch failed');

      return await res.json();
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { valid, error } = await validateSession();

        if (valid) {
          // 認証済み処理
          const userData = await fetchUser();
          setUser(userData);
          setIsAuthenticated(true);

          if (['/login', '/register'].includes(pathname)) {
            router.push('/dashboard');
          }
        } else {
          // 未認証処理
          setIsAuthenticated(false);
          setUser(null);

          if (
            error !== 'Unauthorized' &&
            !['/', '/login', '/register'].includes(pathname)
          ) {
            redirectToCognitoHostedUI();
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        if (!['/login', '/register', '/'].includes(pathname)) {
          redirectToCognitoHostedUI();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        redirectToCognitoHostedUI,
        logout,
        validateSession, // 追加
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
