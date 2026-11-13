import { useMutation } from '@tanstack/react-query';
import type { TResetPasswordRequest } from '@/context.auth/_domain/model.schemas.credentials';
import { resetPassword } from '@/context.auth/data/resetPassword';

export function useResetPassword({
    onSuccess,
}: { onSuccess?: () => void } = {}) {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (data: TResetPasswordRequest) => resetPassword({ data }),
        onSuccess,
    });

    return {
        resetUserPassword: mutateAsync,
        isResettingPassword: isPending,
    };
}
