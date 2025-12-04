'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  useMeQuery,
  useLogoutMutation,
} from '@/features/auth/api/authApi';

export default function ProtectedLayout({ children, }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { data, isLoading, isError } = useMeQuery();
    const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

    useEffect(() => {
        if(!isLoading && (isError || !data?.success))
        {
            router.replace('/login');
        }
    }, [isLoading, isError, data, router]);

    const handleLogout = async () => {
        try {
           await logout().unwrap(); 
        } catch (error) {
            
        }
        router.replace('/login');
    }

    if (isLoading || !data?.success) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
            <div className="animate-pulse text-sm text-slate-400">
            Checking authentication...
            </div>
        </div>
        );
  }

  const user = data?.user;

  const sectionLabel = pathname === '/products' ? 'Products' : pathname === '/analytics' ? 'Analytics' : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sky-600/10 px-2 py-1 text-xs font-semibold text-sky-400">
              Realtime PM
            </span>
            {sectionLabel && (
              <span className="text-sm text-slate-400">{sectionLabel}</span>
            )}
          </div>

          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/products"
              className={`rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium transition-colors ${
                pathname === '/products'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Products
            </Link>
            <Link
              href="/analytics"
              className={`rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium transition-colors ${
                pathname === '/analytics'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Analytics
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 bg-gradient-to-b from-slate-950 to-slate-900">
        {children}
      </main>
    </div>
  );
}