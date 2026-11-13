import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import AlertError from '@/common/components/alert-error';
import InputError from '@/common/components/input-error';
import PasswordInput from '@/common/components/password-input';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Spinner } from '@/common/components/ui/spinner';
import { applyApiErrors } from '@/common/lib/api/form-errors';
import type { TResetPasswordRequest } from '@/context.auth/_domain/model.schemas.credentials';
import { resetPasswordSchema } from '@/context.auth/_domain/model.schemas.credentials';
import { useAuthConfig } from '@/context.auth/hooks/use-auth-config';
import { useResetPassword } from '@/context.auth/hooks/use-reset-password';

type Props = {
    token: string;
    email: string;
};

export function ResetPasswordForm({ token, email }: Props) {
    const navigate = useNavigate();
    const { authConfig } = useAuthConfig();
    const { resetUserPassword } = useResetPassword({
        onSuccess: () => void navigate(ROUTES.login, { replace: true }),
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<TResetPasswordRequest>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token,
            email,
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await resetUserPassword(values);
        } catch (error) {
            if (!applyApiErrors(error, setError)) {
                setError('root', {
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Could not reset your password.',
                });
            }
        }
    });

    return (
        <form onSubmit={onSubmit} noValidate>
            <div className="grid gap-6">
                {errors.root?.message && (
                    <AlertError errors={[errors.root.message]} />
                )}

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="mt-1 block w-full"
                        readOnly
                        {...register('email')}
                    />
                    <InputError message={errors.email?.message} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        autoComplete="new-password"
                        className="mt-1 block w-full"
                        autoFocus
                        placeholder="Password"
                        passwordrules={authConfig.passwordRules}
                        {...register('password')}
                    />
                    <InputError message={errors.password?.message} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">
                        Confirm password
                    </Label>
                    <PasswordInput
                        id="password_confirmation"
                        autoComplete="new-password"
                        className="mt-1 block w-full"
                        placeholder="Confirm password"
                        passwordrules={authConfig.passwordRules}
                        {...register('password_confirmation')}
                    />
                    <InputError
                        message={errors.password_confirmation?.message}
                    />
                </div>

                <Button
                    type="submit"
                    className="mt-4 w-full"
                    disabled={isSubmitting}
                    data-test="reset-password-button"
                >
                    {isSubmitting && <Spinner />}
                    Reset password
                </Button>
            </div>
        </form>
    );
}
