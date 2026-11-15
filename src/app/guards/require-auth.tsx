import { Navigate, Outlet, useLocation } from 'react-router';
import { ROUTES } from '@/app/routes';
import { Spinner } from '@/common/components/ui/spinner';
import { useAuth } from '@/context.auth/hooks/use-auth';

/**
 * Gate a route tier on having a session.
 *
 * The loading branch is not optional: useAuth starts out pending, so without it
 * a signed-in user is bounced to the login screen on the first render, before
 * their session has been checked.
 */
export function RequireAuth() {
    const { isAuthenticated, isLoadingUser } = useAuth();
    const location = useLocation();

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

    return <Outlet />;
}
