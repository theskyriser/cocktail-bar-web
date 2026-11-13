import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TAccountDeletion } from '@/context.settings/_domain/model.schemas.profile';
import { deleteAccount } from '@/context.settings/data/deleteAccount';

export function useDeleteAccount({
    onSuccess,
}: { onSuccess?: () => void } = {}) {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (data: TAccountDeletion) => deleteAccount({ data }),
        onSuccess: () => {
            queryClient.clear();
            onSuccess?.();
        },
    });

    return {
        removeAccount: mutateAsync,
        isRemovingAccount: isPending,
    };
}
