import { z } from 'zod';

export const authConfigSchema = z.object({
    password_rules: z.string(),
    can_reset_password: z.boolean(),
    registration_enabled: z.boolean(),
    must_verify_email: z.boolean(),
});

export const authConfigResourceSchema = z.object({
    passwordRules: z.string(),
    canResetPassword: z.boolean(),
    registrationEnabled: z.boolean(),
    mustVerifyEmail: z.boolean(),
});

export type TAuthConfigType = z.infer<typeof authConfigSchema>;

export type TAuthConfig = z.infer<typeof authConfigResourceSchema>;

export const fallbackAuthConfig: TAuthConfig = {
    passwordRules: 'minlength: 8;',
    canResetPassword: true,
    registrationEnabled: true,
    mustVerifyEmail: true,
};
