import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';
import type { TAccountDeletion } from '@/context.settings/_domain/model.schemas.profile';

export async function deleteAccount(opts: {
    data: TAccountDeletion;
}): Promise<null> {
    return await fetchApi(API_ENDPOINTS.profile, {
        method: 'DELETE',
        body: opts.data,
    });
}
