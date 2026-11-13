import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ROUTES } from '@/app/routes';
import AlertError from '@/common/components/alert-error';
import InputError from '@/common/components/input-error';
import TextLink from '@/common/components/text-link';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Spinner } from '@/common/components/ui/spinner';
import { applyApiErrors } from '@/common/lib/api/form-errors';
import type { TForgotPasswordRequest } from '@/context.auth/_domain/model.schemas.credentials';
import { forgotPasswordSchema } from '@/context.auth/_domain/model.schemas.credentials';
import { useForgotPassword } from '@/context.auth/hooks/use-forgot-password';

export function ForgotPasswordForm() {
    const [isSent, setIsSent] = useState(false);
    const { requestPasswordReset } = useForgotPassword({
        onSuccess: () => setIsSent(true),
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<TForgotPasswordRequest>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await requestPasswordReset(values);
        } catch (error) {
            if (!applyApiErrors(error, setError)) {
                setError('root', {
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Could not send the reset link.',
                });
            }
        }
    });

    return (
        <div className="space-y-6">
            {isSent && (
                <div className="mb-4 text-center text-sm text-accent-700">
                    A reset link has been sent to that address, if an account
                    exists for it.
                </div>
            )}

            {errors.root?.message && (
                <AlertError errors={[errors.root.message]} />
            )}

            <form onSubmit={onSubmit} noValidate>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="off"
                        autoFocus
                        placeholder="email@example.com"
                        {...register('email')}
                    />
                    <InputError message={errors.email?.message} />
                </div>

                <div className="my-6 flex items-center justify-start">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                        data-test="email-password-reset-link-button"
                    >
                        {isSubmitting && <Spinner />}
                        Email password reset link
                    </Button>
                </div>
            </form>

            <div className="space-x-1 text-center text-sm text-muted-foreground">
                <span>Or, return to</span>
                <TextLink to={ROUTES.login}>log in</TextLink>
            </div>
        </div>
    );
}
