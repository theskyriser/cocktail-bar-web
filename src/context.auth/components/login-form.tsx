import InputError from '@/common/components/input-error';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { credentialsSchema } from '../_domain/model.schemas.credentials';
import type { TCredentials } from '../_domain/model.schemas.credentials';
import { useLogin } from '../hooks/use-login';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import { applyApiErrors } from '@/common/lib/api/formErrors';

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        resetField,
        formState: { errors, isSubmitting },
    } = useForm<TCredentials>({
        resolver: zodResolver(credentialsSchema),
        defaultValues: { email: '', password: '' },
    });

    const navigate = useNavigate();

    const { logIn } = useLogin({
        onSuccess: () => navigate(ROUTES.bar, { replace: true }),
    });

    async function onSubmit(values: TCredentials) {
        clearErrors('root');
        try {
            await logIn(values);
        } catch (error) {
            if (!applyApiErrors(error, setError)) {
                setError('root', {
                    message: 'Could not sign in, please try again',
                });
            }
            resetField('password');
        }
    }

    return (
        <div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <div className="grid gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        aria-invalid={Boolean(errors.email)}
                        {...register('email')}
                    />
                    <InputError message={errors.email?.message} />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        aria-invalid={Boolean(errors.password)}
                        {...register('password')}
                    />
                    <InputError message={errors.password?.message} />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    Log In
                </Button>
            </form>
        </div>
    );
}
