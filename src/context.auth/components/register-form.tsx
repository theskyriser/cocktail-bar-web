import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import AlertError from '@/common/components/alert-error';
import InputError from '@/common/components/input-error';
import PasswordInput from '@/common/components/password-input';
import TextLink from '@/common/components/text-link';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Spinner } from '@/common/components/ui/spinner';
import { applyApiErrors } from '@/common/lib/api/form-errors';
import type { TRegisterCredentials } from '@/context.auth/_domain/model.schemas.credentials';
import { registerSchema } from '@/context.auth/_domain/model.schemas.credentials';
import { useAuthConfig } from '@/context.auth/hooks/use-auth-config';
import { useRegister } from '@/context.auth/hooks/use-register';

export function RegisterForm() {
    const navigate = useNavigate();
    const { authConfig } = useAuthConfig();
    const { registerUser } = useRegister({
        onSuccess: () => void navigate(ROUTES.dashboard, { replace: true }),
    });

    const {
        register,
        handleSubmit,
        setError,
        resetField,
        formState: { errors, isSubmitting },
    } = useForm<TRegisterCredentials>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await registerUser(values);
        } catch (error) {
            resetField('password');
            resetField('password_confirmation');

            if (!applyApiErrors(error, setError)) {
                setError('root', {
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Could not create your account.',
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
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        autoFocus
                        tabIndex={1}
                        autoComplete="name"
                        placeholder="Full name"
                        {...register('name')}
                    />
                    <InputError message={errors.name?.message} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        tabIndex={2}
                        autoComplete="email"
                        placeholder="email@example.com"
                        {...register('email')}
                    />
                    <InputError message={errors.email?.message} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        tabIndex={3}
                        autoComplete="new-password"
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
                        tabIndex={4}
                        autoComplete="new-password"
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
                    className="mt-2 w-full"
                    tabIndex={5}
                    disabled={isSubmitting}
                    data-test="register-user-button"
                >
                    {isSubmitting && <Spinner />}
                    Create account
                </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <TextLink to={ROUTES.login} tabIndex={6}>
                    Log in
                </TextLink>
            </div>
        </form>
    );
}
