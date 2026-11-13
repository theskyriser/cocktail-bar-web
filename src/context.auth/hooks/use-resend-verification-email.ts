import { useMutation } from '@tanstack/react-query';
import { resendVerificationEmail } from '@/context.auth/data/resendVerificationEmail';

export function useResendVerificationEmail({
    onSuccess,
}: { onSuccess?: () => void } = {}) {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: resendVerificationEmail,
        onSuccess,
    });

    return {
        resendVerification: mutateAsync,
        isResendingVerification: isPending,
    };
}
