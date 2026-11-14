import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TCredentials } from '../_domain/model.schemas.credentials';
import { login } from '../data/login';
import { AUTH_QUERY_KEY } from './use-auth';

type TUseLogin = {
    logIn: (data: TCredentials) => Promise<null>;
    isLoggingIn: boolean;
    logInError: Error | null;
};

export function useLogin({
    onSuccess,
}: { onSuccess?: () => void } = {}): TUseLogin {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error } = useMutation({
        mutationFn: (data: TCredentials) => login({ data }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
            onSuccess?.();
        },
    });

    return { logIn: mutateAsync, isLoggingIn: isPending, logInError: error };
}
