import { useMutation } from '@tanstack/react-query';
import type { TPasswordUpdate } from '@/context.settings/_domain/model.schemas.profile';
import { updatePassword } from '@/context.settings/data/updatePassword';

export function useUpdatePassword({
    onSuccess,
}: { onSuccess?: () => void } = {}) {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (data: TPasswordUpdate) => updatePassword({ data }),
        onSuccess,
    });

    return {
        savePassword: mutateAsync,
        isSavingPassword: isPending,
    };
}
