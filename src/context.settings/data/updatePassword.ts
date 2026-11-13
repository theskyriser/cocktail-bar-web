import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';
import type { TPasswordUpdate } from '@/context.settings/_domain/model.schemas.profile';

export async function updatePassword(opts: {
    data: TPasswordUpdate;
}): Promise<null> {
    return await fetchApi(API_ENDPOINTS.password, {
        method: 'PUT',
        body: opts.data,
    });
}
