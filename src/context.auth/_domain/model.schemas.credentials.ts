import { z } from 'zod';

const emailField = z
    .string()
    .min(1, 'Email is required')
    .pipe(z.email('Enter a valid email'));

const passwordField = z.string().min(8, 'Use at least 8 characters');

export const loginSchema = z.object({
    email: emailField,
    password: z.string().min(1, 'Password is required'),
    remember: z.boolean(),
});

export const registerSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        email: emailField,
        password: passwordField,
        password_confirmation: z.string().min(1, 'Confirm your password'),
    })
    .refine((values) => values.password === values.password_confirmation, {
        path: ['password_confirmation'],
        message: 'Passwords do not match',
    });

export const forgotPasswordSchema = z.object({
    email: emailField,
});

export const resetPasswordSchema = z
    .object({
        token: z.string().min(1),
        email: emailField,
        password: passwordField,
        password_confirmation: z.string().min(1, 'Confirm your password'),
    })
    .refine((values) => values.password === values.password_confirmation, {
        path: ['password_confirmation'],
        message: 'Passwords do not match',
    });

export type TLoginCredentials = z.infer<typeof loginSchema>;

export type TRegisterCredentials = z.infer<typeof registerSchema>;

export type TForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

export type TResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
