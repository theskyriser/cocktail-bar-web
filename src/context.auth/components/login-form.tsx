import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import AlertError from '@/common/components/alert-error';
import InputError from '@/common/components/input-error';
import PasswordInput from '@/common/components/password-input';
import TextLink from '@/common/components/text-link';
import { Button } from '@/common/components/ui/button';
import { Checkbox } from '@/common/components/ui/checkbox';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Spinner } from '@/common/components/ui/spinner';
import { applyApiErrors } from '@/common/lib/api/form-errors';
import type { TLoginCredentials } from '@/context.auth/_domain/model.schemas.credentials';
import { loginSchema } from '@/context.auth/_domain/model.schemas.credentials';
import { useAuthConfig } from '@/context.auth/hooks/use-auth-config';
import { useLogin } from '@/context.auth/hooks/use-login';

export function LoginForm() {
    const navigate = useNavigate();
    const { authConfig } = useAuthConfig();
    const { logIn } = useLogin({
        onSuccess: () => void navigate(ROUTES.dashboard, { replace: true }),
    });

    const {
        register,
        handleSubmit,
        setError,
        setValue,
        resetField,
        formState: { errors, isSubmitting },
    } = useForm<TLoginCredentials>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', remember: false },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await logIn(values);
        } catch (error) {
            resetField('password');

            if (!applyApiErrors(error, setError)) {
                setError('root', {
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Could not log you in.',
                });
            }
        }
    });

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
            {errors.root?.message && (
                <AlertError errors={[errors.root.message]} />
            )}

            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        autoFocus
                        tabIndex={1}
                        autoComplete="email"
                        placeholder="email@example.com"
                        {...register('email')}
                    />
                    <InputError message={errors.email?.message} />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        {authConfig.canResetPassword && (
                            <TextLink
                                to={ROUTES.forgotPassword}
                                className="ml-auto text-sm"
                                tabIndex={5}
                            >
                                Forgot your password?
                            </TextLink>
                        )}
                    </div>
                    <PasswordInput
                        id="password"
                        tabIndex={2}
                        autoComplete="current-password"
                        placeholder="Password"
                        {...register('password')}
                    />
                    <InputError message={errors.password?.message} />
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="remember"
                        tabIndex={3}
                        onCheckedChange={(checked) =>
                            setValue('remember', checked === true)
                        }
                    />
                    <Label htmlFor="remember">Remember me</Label>
                </div>

                <Button
                    type="submit"
                    className="mt-4 w-full"
                    tabIndex={4}
                    disabled={isSubmitting}
                    data-test="login-button"
                >
                    {isSubmitting && <Spinner />}
                    Log in
                </Button>
            </div>

            {authConfig.registrationEnabled && (
                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <TextLink to={ROUTES.register} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            )}
        </form>
    );
}
