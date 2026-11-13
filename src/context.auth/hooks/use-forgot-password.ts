import { useMutation } from '@tanstack/react-query';
import type { TForgotPasswordRequest } from '@/context.auth/_domain/model.schemas.credentials';
import { forgotPassword } from '@/context.auth/data/forgotPassword';

export function useForgotPassword({
    onSuccess,
}: { onSuccess?: () => void } = {}) {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (data: TForgotPasswordRequest) => forgotPassword({ data }),
        onSuccess,
    });

    return {
        requestPasswordReset: mutateAsync,
        isRequestingPasswordReset: isPending,
    };
}
