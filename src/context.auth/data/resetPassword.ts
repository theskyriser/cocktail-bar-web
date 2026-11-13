import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';
import type { TResetPasswordRequest } from '@/context.auth/_domain/model.schemas.credentials';

export async function resetPassword(opts: {
    data: TResetPasswordRequest;
}): Promise<null> {
    return await fetchApi(API_ENDPOINTS.resetPassword, {
        method: 'POST',
        body: opts.data,
    });
}
