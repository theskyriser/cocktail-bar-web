import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';
import type { TProfileUpdate } from '@/context.settings/_domain/model.schemas.profile';

export async function updateProfile(opts: {
    data: TProfileUpdate;
}): Promise<null> {
    return await fetchApi(API_ENDPOINTS.profile, {
        method: 'PATCH',
        body: opts.data,
    });
}
