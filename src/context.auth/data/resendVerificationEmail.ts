import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';

export async function resendVerificationEmail(): Promise<null> {
    return await fetchApi(API_ENDPOINTS.emailVerificationNotification, {
        method: 'POST',
    });
}
