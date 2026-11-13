import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';
import type { TForgotPasswordRequest } from '@/context.auth/_domain/model.schemas.credentials';

export async function forgotPassword(opts: {
    data: TForgotPasswordRequest;
}): Promise<null> {
    return await fetchApi(API_ENDPOINTS.forgotPassword, {
        method: 'POST',
        body: opts.data,
    });
}
