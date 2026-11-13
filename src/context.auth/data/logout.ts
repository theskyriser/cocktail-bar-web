import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';

export async function logout(): Promise<null> {
    return await fetchApi(API_ENDPOINTS.logout, { method: 'POST' });
}
