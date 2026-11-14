import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import InputError from '@/common/components/input-error';
import { Button } from '@/common/components/ui/button';
import { isUnauthenticatedError } from '@/common/lib/api/errors';
import { useLogout } from '../hooks/use-logout';

export default function LogoutButton() {
    const navigate = useNavigate();

    const { logOut, isLoggingOut, logOutError } = useLogout({
        onSuccess: () => navigate(ROUTES.login, { replace: true }),
    });

    async function onClick() {
        try {
            await logOut();
        } catch (error) {
            if (isUnauthenticatedError(error)) {
                void navigate(ROUTES.login, { replace: true });
            }
        }
    }

    const failed = logOutError !== null && !isUnauthenticatedError(logOutError);

    return (
        <div className="flex flex-col items-end gap-1.5">
            <Button
                variant="secondary"
                onClick={onClick}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? 'Signing out' : 'Log out'}
            </Button>
            <InputError
                message={
                    failed
                        ? 'Could not sign you out, please try again'
                        : undefined
                }
            />
        </div>
    );
}
