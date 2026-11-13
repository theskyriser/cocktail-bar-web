import { QueryClient } from '@tanstack/react-query';
import { isApiError } from './errors';

const MAX_RETRIES = 2;

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                refetchOnWindowFocus: false,
                retry: (failureCount, error) => {
                    if (isApiError(error) && error.status < 500) {
                        return false;
                    }

                    return failureCount < MAX_RETRIES;
                },
            },
            mutations: {
                retry: false,
            },
        },
    });
}
