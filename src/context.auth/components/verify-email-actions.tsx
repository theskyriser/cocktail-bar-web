import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import { Button } from '@/common/components/ui/button';
import { Spinner } from '@/common/components/ui/spinner';
import { useLogout } from '@/context.auth/hooks/use-logout';
import { useResendVerificationEmail } from '@/context.auth/hooks/use-resend-verification-email';

export function VerifyEmailActions() {
    const navigate = useNavigate();
    const [isSent, setIsSent] = useState(false);
    const { resendVerification, isResendingVerification } =
        useResendVerificationEmail({ onSuccess: () => setIsSent(true) });
    const { logOut, isLoggingOut } = useLogout({
        onSuccess: () => void navigate(ROUTES.login, { replace: true }),
    });

    return (
        <div className="space-y-6 text-center">
            {isSent && (
                <div className="mb-4 text-center text-sm text-accent-700">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <Button
                variant="secondary"
                disabled={isResendingVerification}
                onClick={() => void resendVerification()}
            >
                {isResendingVerification && <Spinner />}
                Resend verification email
            </Button>

            <Button
                variant="link"
                className="mx-auto block text-sm"
                disabled={isLoggingOut}
                onClick={() => void logOut()}
            >
                Log out
            </Button>
        </div>
    );
}
