'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'STUDENT')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirecionar para dashboard apropriado baseado no role
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/aluno');
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin"></div>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
