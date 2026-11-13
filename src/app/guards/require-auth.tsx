import { Navigate, Outlet, useLocation } from 'react-router';
import { ROUTES } from '@/app/routes';
import { Spinner } from '@/common/components/ui/spinner';
import { useAuth } from '@/context.auth/hooks/use-auth';
import { useAuthConfig } from '@/context.auth/hooks/use-auth-config';

export function RequireAuth({
    requireVerified = false,
}: {
    requireVerified?: boolean;
}) {
    const location = useLocation();
    const { isLoadingUser, isAuthenticated, isVerified } = useAuth();
    const { authConfig } = useAuthConfig();

    if (isLoadingUser) {
        return (
            <div className="flex min-h-svh items-center justify-center">
                <Spinner className="size-6" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate to={ROUTES.login} replace state={{ from: location }} />
        );
    }

    if (requireVerified && authConfig.mustVerifyEmail && !isVerified) {
        return <Navigate to={ROUTES.verifyEmail} replace />;
    }

    return <Outlet />;
}
