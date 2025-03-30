'use client';

import Link from 'next/link';

export function LoginButton() {
  return (
    <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
      Sign in with Cognito
    </Link>
  );
}

export function LogoutButton() {
  return (
    <Link href="/logout" className="bg-red-500 text-white px-4 py-2 rounded">
      Sign Out
    </Link>
  );
}
