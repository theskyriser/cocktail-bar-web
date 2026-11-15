import { Navigate, Outlet } from 'react-router';
import { ROUTES } from '@/app/routes';
import { Spinner } from '@/common/components/ui/spinner';
import { useAuth } from '@/context.auth/hooks/use-auth';

/**
 * Keep a signed-in user off the screens that only make sense signed out.
 *
 * Without this the login form still renders for someone who already has a
 * session, which is indistinguishable from the login having failed.
 */
export function GuestOnly() {
    const { isAuthenticated, isLoadingUser } = useAuth();

    if (isLoadingUser) {
        return (
            <div className="flex min-h-svh items-center justify-center">
                <Spinner className="size-6" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={ROUTES.bar} replace />;
    }

    return <Outlet />;
}
