import { fetchApi } from '@/common/lib/api/client';
import type { TAuthConfig } from '@/context.auth/_domain/model.schemas.auth-config';
import { authConfigSchema } from '@/context.auth/_domain/model.schemas.auth-config';

const AUTH_CONFIG_ENDPOINT = '/api/auth/config';

export async function getAuthConfig(
    opts: { signal?: AbortSignal } = {},
): Promise<TAuthConfig> {
    const config = await fetchApi(AUTH_CONFIG_ENDPOINT, {
        schema: authConfigSchema,
        signal: opts.signal,
    });

    return {
        passwordRules: config.password_rules,
        canResetPassword: config.can_reset_password,
        registrationEnabled: config.registration_enabled,
        mustVerifyEmail: config.must_verify_email,
    };
}
