import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AlertError from '@/common/components/alert-error';
import InputError from '@/common/components/input-error';
import PasswordInput from '@/common/components/password-input';
import { Button } from '@/common/components/ui/button';
import { Label } from '@/common/components/ui/label';
import { Spinner } from '@/common/components/ui/spinner';
import { applyApiErrors } from '@/common/lib/api/form-errors';
import { useAuthConfig } from '@/context.auth/hooks/use-auth-config';
import type { TPasswordUpdate } from '@/context.settings/_domain/model.schemas.profile';
import { passwordUpdateSchema } from '@/context.settings/_domain/model.schemas.profile';
import { useUpdatePassword } from '@/context.settings/hooks/use-update-password';

export function PasswordForm() {
    const { authConfig } = useAuthConfig();
    const { savePassword } = useUpdatePassword({
        onSuccess: () => toast.success('Password updated.'),
    });

    const {
        register,
        handleSubmit,
        setError,
        setFocus,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TPasswordUpdate>({
        resolver: zodResolver(passwordUpdateSchema),
        defaultValues: {
            current_password: '',
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await savePassword(values);
            reset();
        } catch (error) {
            reset({
                current_password: '',
                password: '',
                password_confirmation: '',
            });

            if (applyApiErrors(error, setError)) {
                setFocus(
                    errors.current_password ? 'current_password' : 'password',
                );

                return;
            }

            setError('root', {
                message:
                    error instanceof Error
                        ? error.message
                        : 'Could not update your password.',
            });
        }
    });

    return (
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {errors.root?.message && (
                <AlertError errors={[errors.root.message]} />
            )}

            <div className="grid gap-2">
                <Label htmlFor="current_password">Current password</Label>
                <PasswordInput
                    id="current_password"
                    className="mt-1 block w-full"
                    autoComplete="current-password"
                    placeholder="Current password"
                    {...register('current_password')}
                />
                <InputError message={errors.current_password?.message} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <PasswordInput
                    id="password"
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                    placeholder="New password"
                    passwordrules={authConfig.passwordRules}
                    {...register('password')}
                />
                <InputError message={errors.password?.message} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirm password</Label>
                <PasswordInput
                    id="password_confirmation"
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    passwordrules={authConfig.passwordRules}
                    {...register('password_confirmation')}
                />
                <InputError message={errors.password_confirmation?.message} />
            </div>

            <div className="flex items-center gap-4">
                <Button
                    disabled={isSubmitting}
                    data-test="update-password-button"
                >
                    {isSubmitting && <Spinner />}
                    Save
                </Button>
            </div>
        </form>
    );
}
