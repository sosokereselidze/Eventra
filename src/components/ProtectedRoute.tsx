import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { fetchApi } from '@/lib/api';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(requireAdmin);
  const [isAuthorized, setIsAuthorized] = useState(!requireAdmin);

  useEffect(() => {
    if (!isLoading && !user) {
      setIsVerifying(false);
      navigate('/auth', { replace: true });
      return;
    }

    if (!isLoading && user && requireAdmin) {
      const verifyAdmin = async () => {
        try {
          await fetchApi<{ ok: boolean }>('/api/auth/verify-admin');
          setIsAuthorized(true);
        } catch {
          navigate('/', { replace: true });
          setIsAuthorized(false);
        } finally {
          setIsVerifying(false);
        }
      };
      verifyAdmin();
    }
  }, [user, isLoading, requireAdmin, navigate]);

  if (isLoading || isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && !isAuthorized) return null;

  return <>{children}</>;
}
