import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AUTH_QUERY_KEY } from './use-auth';
import { logout } from '../data/logout';

export function useLogout({ onSuccess }: { onSuccess?: () => void } = {}) {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error } = useMutation({
        mutationFn: () => logout({}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
            onSuccess?.();
        },
    });

    return { logOut: mutateAsync, isLoggingOut: isPending, logOutError: error };
}
