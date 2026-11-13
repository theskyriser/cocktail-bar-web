import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import AlertError from '@/common/components/alert-error';
import Heading from '@/common/components/heading';
import InputError from '@/common/components/input-error';
import PasswordInput from '@/common/components/password-input';
import { Button } from '@/common/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/common/components/ui/dialog';
import { Label } from '@/common/components/ui/label';
import { Spinner } from '@/common/components/ui/spinner';
import { applyApiErrors } from '@/common/lib/api/form-errors';
import type { TAccountDeletion } from '@/context.settings/_domain/model.schemas.profile';
import { accountDeletionSchema } from '@/context.settings/_domain/model.schemas.profile';
import { useDeleteAccount } from '@/context.settings/hooks/use-delete-account';

export function DeleteUser() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { removeAccount } = useDeleteAccount({
        onSuccess: () => void navigate(ROUTES.home, { replace: true }),
    });

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TAccountDeletion>({
        resolver: zodResolver(accountDeletionSchema),
        defaultValues: { password: '' },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await removeAccount(values);
        } catch (error) {
            reset({ password: '' });

            if (!applyApiErrors(error, setError)) {
                setError('root', {
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Could not delete your account.',
                });
            }
        }
    });

    const closeDialog = () => {
        reset({ password: '' });
        setIsOpen(false);
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Delete account"
                description="Delete your account and all of its resources"
            />
            <div className="space-y-4 rounded-lg border border-destructive/40 p-4">
                <div className="relative space-y-0.5 text-destructive">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm">
                        Please proceed with caution, this cannot be undone.
                    </p>
                </div>

                <Dialog
                    open={isOpen}
                    onOpenChange={(open) =>
                        open ? setIsOpen(true) : closeDialog()
                    }
                >
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            Delete account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            Are you sure you want to delete your account?
                        </DialogTitle>
                        <DialogDescription>
                            Once your account is deleted, all of its resources
                            and data will also be permanently deleted. Please
                            enter your password to confirm you would like to
                            permanently delete your account.
                        </DialogDescription>

                        <form
                            onSubmit={onSubmit}
                            className="space-y-6"
                            noValidate
                        >
                            {errors.root?.message && (
                                <AlertError errors={[errors.root.message]} />
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    autoFocus
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    {...register('password')}
                                />
                                <InputError
                                    message={errors.password?.message}
                                />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary" type="button">
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={isSubmitting}
                                    data-test="confirm-delete-user-button"
                                >
                                    {isSubmitting && <Spinner />}
                                    Delete account
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
