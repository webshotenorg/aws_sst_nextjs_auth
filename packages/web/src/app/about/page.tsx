'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function AboutPage() {
  const { user, logout, validateSession } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const isValid = await validateSession();
      if (!isValid) {
        debugger;
      }
    };
    checkSession();
  }, [validateSession]);

  return (
    <div>
      <h1>About</h1>
      {user && (
        <div>
          <p>
            Welcome About,
            {JSON.stringify(user)}
          </p>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}
