import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AlertError from '@/common/components/alert-error';
import InputError from '@/common/components/input-error';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Spinner } from '@/common/components/ui/spinner';
import { applyApiErrors } from '@/common/lib/api/form-errors';
import type { TUser } from '@/context.auth/_domain/model.schemas.user';
import type { TProfileUpdate } from '@/context.settings/_domain/model.schemas.profile';
import { profileSchema } from '@/context.settings/_domain/model.schemas.profile';
import { useUpdateProfile } from '@/context.settings/hooks/use-update-profile';

export function ProfileForm({ user }: { user: TUser }) {
    const { saveProfile } = useUpdateProfile({
        onSuccess: () => toast.success('Profile updated.'),
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<TProfileUpdate>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user.name, email: user.email },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await saveProfile(values);
        } catch (error) {
            if (!applyApiErrors(error, setError)) {
                setError('root', {
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Could not save your profile.',
                });
            }
        }
    });

    return (
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {errors.root?.message && (
                <AlertError errors={[errors.root.message]} />
            )}

            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    className="mt-1 block w-full"
                    autoComplete="name"
                    placeholder="Full name"
                    {...register('name')}
                />
                <InputError className="mt-2" message={errors.name?.message} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                    id="email"
                    type="email"
                    className="mt-1 block w-full"
                    autoComplete="username"
                    placeholder="Email address"
                    {...register('email')}
                />
                <InputError className="mt-2" message={errors.email?.message} />
            </div>

            <div className="flex items-center gap-4">
                <Button
                    disabled={isSubmitting}
                    data-test="update-profile-button"
                >
                    {isSubmitting && <Spinner />}
                    Save
                </Button>
            </div>
        </form>
    );
}
