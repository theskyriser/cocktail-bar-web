import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';
import { isUnauthenticatedError } from '@/common/lib/api/errors';
import { parseUser } from '@/context.auth/_domain/model.parsers.user';
import type { TUser } from '@/context.auth/_domain/model.parsers.user';
import { userAdapter } from '@/context.auth/data/user.adapter';

export async function getUser(
    opts: { signal?: AbortSignal } = {},
): Promise<TUser | null> {
    try {
        const user = await fetchApi(API_ENDPOINTS.user, {
            parse: parseUser,
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
