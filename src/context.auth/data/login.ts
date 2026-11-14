import { fetchApi } from '@/common/lib/api/client';
import type { TCredentials } from '../_domain/model.schemas.credentials';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';

export async function login(opts: {
    data: TCredentials;
    signal?: AbortSignal;
}): Promise<null> {
    const { data, signal } = opts;

    return await fetchApi(API_ENDPOINTS.login, {
        body: data,
        method: 'POST',
        signal,
    });
}
