import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AUTH_QUERY_KEY } from '@/context.auth/hooks/use-auth';
import type { TProfileUpdate } from '@/context.settings/_domain/model.schemas.profile';
import { updateProfile } from '@/context.settings/data/updateProfile';

export function useUpdateProfile({
    onSuccess,
}: { onSuccess?: () => void } = {}) {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (data: TProfileUpdate) => updateProfile({ data }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
            onSuccess?.();
        },
    });

    return {
        saveProfile: mutateAsync,
        isSavingProfile: isPending,
    };
}
