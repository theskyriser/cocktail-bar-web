import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/context.auth/data/logout';

export function useLogout({ onSuccess }: { onSuccess?: () => void } = {}) {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.clear();
            onSuccess?.();
        },
    });

    return {
        logOut: mutateAsync,
        isLoggingOut: isPending,
    };
}
