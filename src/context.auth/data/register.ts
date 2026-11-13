import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';
import type { TRegisterCredentials } from '@/context.auth/_domain/model.schemas.credentials';

export async function register(opts: {
    data: TRegisterCredentials;
}): Promise<null> {
    return await fetchApi(API_ENDPOINTS.register, {
        method: 'POST',
        body: opts.data,
    });
}
