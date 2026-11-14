import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';

export async function logout(opts: { signal?: AbortSignal }): Promise<null> {
    const { signal } = opts;

    return await fetchApi(API_ENDPOINTS.logout, {
        method: 'POST',
        signal,
    });
}
