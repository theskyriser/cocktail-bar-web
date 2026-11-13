import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TLoginCredentials } from '@/context.auth/_domain/model.schemas.credentials';
import { login } from '@/context.auth/data/login';
import { AUTH_QUERY_KEY } from './use-auth';

export function useLogin({ onSuccess }: { onSuccess?: () => void } = {}) {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error } = useMutation({
        mutationFn: (data: TLoginCredentials) => login({ data }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
            onSuccess?.();
        },
    });

    return {
        logIn: mutateAsync,
        isLoggingIn: isPending,
        logInError: error,
    };
}
