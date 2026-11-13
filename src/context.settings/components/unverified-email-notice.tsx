import { useState } from 'react';
import { Button } from '@/common/components/ui/button';
import { useResendVerificationEmail } from '@/context.auth/hooks/use-resend-verification-email';

export function UnverifiedEmailNotice() {
    const [isSent, setIsSent] = useState(false);
    const { resendVerification, isResendingVerification } =
        useResendVerificationEmail({ onSuccess: () => setIsSent(true) });

    return (
        <div>
            <p className="-mt-4 text-sm text-muted-foreground">
                Your email address is unverified.{' '}
                <Button
                    variant="link"
                    className="h-auto p-0 text-foreground underline decoration-neutral-300 underline-offset-4 dark:decoration-neutral-500"
                    disabled={isResendingVerification}
                    onClick={() => void resendVerification()}
                >
                    Click here to re-send the verification email.
                </Button>
            </p>

            {isSent && (
                <div className="mt-2 text-sm font-medium text-accent-700">
                    A new verification link has been sent to your email address.
                </div>
            )}
        </div>
    );
}
