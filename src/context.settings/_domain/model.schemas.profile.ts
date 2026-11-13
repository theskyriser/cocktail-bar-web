import { z } from 'zod';

export const profileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z
        .string()
        .min(1, 'Email is required')
        .pipe(z.email('Enter a valid email')),
});

export const passwordUpdateSchema = z
    .object({
        current_password: z
            .string()
            .min(1, 'Your current password is required'),
        password: z.string().min(8, 'Use at least 8 characters'),
        password_confirmation: z.string().min(1, 'Confirm your password'),
    })
    .refine((values) => values.password === values.password_confirmation, {
        path: ['password_confirmation'],
        message: 'Passwords do not match',
    });

export const accountDeletionSchema = z.object({
    password: z.string().min(1, 'Your password is required'),
});

export type TProfileUpdate = z.infer<typeof profileSchema>;

export type TPasswordUpdate = z.infer<typeof passwordUpdateSchema>;

export type TAccountDeletion = z.infer<typeof accountDeletionSchema>;
