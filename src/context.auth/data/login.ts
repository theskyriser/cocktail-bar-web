import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';
import type { TLoginCredentials } from '@/context.auth/_domain/model.schemas.credentials';

export async function login(opts: { data: TLoginCredentials }): Promise<null> {
    return await fetchApi(API_ENDPOINTS.login, {
        method: 'POST',
        body: opts.data,
    });
}
