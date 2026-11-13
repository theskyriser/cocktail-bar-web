import { Navigate, Outlet } from 'react-router';
import { ROUTES } from '@/app/routes';
import { Spinner } from '@/common/components/ui/spinner';
import { useAuth } from '@/context.auth/hooks/use-auth';

export function GuestOnly() {
    const { isLoadingUser, isAuthenticated } = useAuth();

    if (isLoadingUser) {
        return (
            <div className="flex min-h-svh items-center justify-center">
                <Spinner className="size-6" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={ROUTES.dashboard} replace />;
    }

    return <Outlet />;
}
