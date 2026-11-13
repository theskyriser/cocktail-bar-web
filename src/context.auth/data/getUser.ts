import { API_ENDPOINTS } from '@/common/lib/api/endpoints';
import { fetchApi } from '@/common/lib/api/client';
import { isUnauthenticatedError } from '@/common/lib/api/errors';
import type { TUser } from '@/context.auth/_domain/model.schemas.user';
import { userSchema } from '@/context.auth/_domain/model.schemas.user';
import { userAdapter } from './user.adapter';

export async function getUser(
    opts: {
        signal?: AbortSignal;
    } = {},
): Promise<TUser | null> {
    try {
        const user = await fetchApi(API_ENDPOINTS.user, {
            schema: userSchema,
            signal: opts.signal,
        });

        return userAdapter(user);
    } catch (error) {
        if (isUnauthenticatedError(error)) {
            return null;
        }

        throw error;
    }
}
